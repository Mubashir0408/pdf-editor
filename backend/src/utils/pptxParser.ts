import { XMLParser } from "fast-xml-parser";
import type JSZip from "jszip";

const EMU_PER_PX = 9525;
const EMU_PER_INCH = 914400;

export interface PptxTextRun {
  text: string;
  bold: boolean;
  italic: boolean;
  sizePt: number;
  color: string;
}

export interface PptxParagraph {
  runs: PptxTextRun[];
  align: "left" | "center" | "right" | "justify";
  bulleted: boolean;
}

export interface PptxTextShape {
  kind: "text";
  xPx: number;
  yPx: number;
  widthPx: number;
  heightPx: number;
  paragraphs: PptxParagraph[];
}

export interface PptxImageShape {
  kind: "image";
  xPx: number;
  yPx: number;
  widthPx: number;
  heightPx: number;
  dataUri: string;
}

export type PptxShape = PptxTextShape | PptxImageShape;

export interface PptxSlide {
  shapes: PptxShape[];
}

export interface PptxPresentation {
  widthIn: number;
  heightIn: number;
  widthPx: number;
  heightPx: number;
  slides: PptxSlide[];
}

type XmlNode = Record<string, unknown>;

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  isArray: (name) => ["p:sp", "p:pic", "a:p", "a:r", "p:sldId", "Relationship"].includes(name),
});

/**
 * Parses a .pptx (a zip of OOXML parts) into a plain structural model: slide
 * dimensions, and each slide's shapes with an absolute pixel position/size,
 * text runs (bold/italic/size/color), and images (inlined as data URIs so
 * the HTML renderer that consumes this never needs further file access).
 *
 * Deliberately out of scope: shapes with no explicit position on the slide
 * itself (i.e. inherited from a slide layout/master — resolving that chain
 * accurately is a much bigger undertaking), tables/charts/connectors,
 * precise bullet numbering (rendered as a plain "•" instead), and
 * theme-relative colors (only direct `srgbClr` values are read; anything
 * theme-relative falls back to black). Real-world decks vary enormously —
 * this covers the common case of text boxes and pictures with their own
 * position, which is what the vast majority of slides are built from.
 */
export async function parsePptx(zip: JSZip): Promise<PptxPresentation> {
  const presentationXml = await readXmlFile(zip, "ppt/presentation.xml");
  const presentationRels = await readXmlFile(zip, "ppt/_rels/presentation.xml.rels");

  const presentation = presentationXml["p:presentation"] as XmlNode | undefined;
  if (!presentation) {
    throw new Error("This file doesn't look like a valid PowerPoint presentation.");
  }

  const sldSz = presentation["p:sldSz"] as XmlNode | undefined;
  const widthEmu = Number(attr(sldSz, "cx") ?? 9144000);
  const heightEmu = Number(attr(sldSz, "cy") ?? 6858000);

  const relMap = buildRelationshipMap(presentationRels);
  const sldIdLst = asArray((presentation["p:sldIdLst"] as XmlNode | undefined)?.["p:sldId"] as XmlNode | XmlNode[] | undefined);

  const slidePaths = sldIdLst
    .map((sldId) => relMap.get(attr(sldId, "r:id") ?? ""))
    .filter((target): target is string => !!target)
    .map((target) => resolveRelativeTarget("ppt/presentation.xml", target));

  const slides: PptxSlide[] = [];
  for (const slidePath of slidePaths) {
    slides.push(await parseSlide(zip, slidePath));
  }

  return {
    widthIn: widthEmu / EMU_PER_INCH,
    heightIn: heightEmu / EMU_PER_INCH,
    widthPx: Math.round(widthEmu / EMU_PER_PX),
    heightPx: Math.round(heightEmu / EMU_PER_PX),
    slides,
  };
}

async function parseSlide(zip: JSZip, slidePath: string): Promise<PptxSlide> {
  const slideXml = await readXmlFile(zip, slidePath);
  const relsXml = await readXmlFile(zip, relsPathFor(slidePath)).catch(() => ({}) as XmlNode);
  const relMap = buildRelationshipMap(relsXml);

  const sld = slideXml["p:sld"] as XmlNode | undefined;
  const cSld = sld?.["p:cSld"] as XmlNode | undefined;
  const spTree = cSld?.["p:spTree"] as XmlNode | undefined;
  if (!spTree) return { shapes: [] };

  const shapes: PptxShape[] = [];

  for (const sp of asArray(spTree["p:sp"] as XmlNode | XmlNode[] | undefined)) {
    const shape = parseTextShape(sp);
    if (shape) shapes.push(shape);
  }

  for (const pic of asArray(spTree["p:pic"] as XmlNode | XmlNode[] | undefined)) {
    const shape = await parseImageShape(pic, zip, relMap, slidePath);
    if (shape) shapes.push(shape);
  }

  return { shapes };
}

function parseTextShape(sp: XmlNode): PptxTextShape | null {
  const spPr = sp["p:spPr"] as XmlNode | undefined;
  const xfrm = spPr?.["a:xfrm"] as XmlNode | undefined;
  const off = xfrm?.["a:off"] as XmlNode | undefined;
  const ext = xfrm?.["a:ext"] as XmlNode | undefined;
  if (!off || !ext) return null;

  const txBody = sp["p:txBody"] as XmlNode | undefined;
  if (!txBody) return null;

  const paragraphs = asArray(txBody["a:p"] as XmlNode | XmlNode[] | undefined)
    .map(parseParagraph)
    .filter((p) => p.runs.length > 0);
  if (paragraphs.length === 0) return null;

  return {
    kind: "text",
    xPx: emuToPx(attr(off, "x")),
    yPx: emuToPx(attr(off, "y")),
    widthPx: emuToPx(attr(ext, "cx")),
    heightPx: emuToPx(attr(ext, "cy")),
    paragraphs,
  };
}

function parseParagraph(p: XmlNode): PptxParagraph {
  const pPr = p["a:pPr"] as XmlNode | undefined;
  const bulleted = !!pPr && !("a:buNone" in pPr) && ("a:buChar" in pPr || "a:buAutoNum" in pPr);

  const runs = asArray(p["a:r"] as XmlNode | XmlNode[] | undefined)
    .map(parseRun)
    .filter((r): r is PptxTextRun => r !== null);

  return { runs, align: mapAlign(attr(pPr, "algn")), bulleted };
}

function parseRun(r: XmlNode): PptxTextRun | null {
  const text = r["a:t"];
  if (typeof text !== "string" || text.length === 0) return null;

  const rPr = r["a:rPr"] as XmlNode | undefined;
  const srgbClr = (rPr?.["a:solidFill"] as XmlNode | undefined)?.["a:srgbClr"] as XmlNode | undefined;

  return {
    text,
    bold: attr(rPr, "b") === "1",
    italic: attr(rPr, "i") === "1",
    sizePt: Number(attr(rPr, "sz") ?? 1800) / 100,
    color: `#${attr(srgbClr, "val") ?? "000000"}`,
  };
}

async function parseImageShape(
  pic: XmlNode,
  zip: JSZip,
  relMap: Map<string, string>,
  slidePath: string
): Promise<PptxImageShape | null> {
  const blip = (pic["p:blipFill"] as XmlNode | undefined)?.["a:blip"] as XmlNode | undefined;
  const embedId = attr(blip, "r:embed");
  const xfrm = (pic["p:spPr"] as XmlNode | undefined)?.["a:xfrm"] as XmlNode | undefined;
  const off = xfrm?.["a:off"] as XmlNode | undefined;
  const ext = xfrm?.["a:ext"] as XmlNode | undefined;
  if (!embedId || !off || !ext) return null;

  const target = relMap.get(embedId);
  if (!target) return null;

  const mediaPath = resolveRelativeTarget(slidePath, target);
  const file = zip.file(mediaPath);
  if (!file) return null;

  const bytes = await file.async("nodebuffer");
  const dataUri = `data:${mimeForImagePath(mediaPath)};base64,${bytes.toString("base64")}`;

  return {
    kind: "image",
    xPx: emuToPx(attr(off, "x")),
    yPx: emuToPx(attr(off, "y")),
    widthPx: emuToPx(attr(ext, "cx")),
    heightPx: emuToPx(attr(ext, "cy")),
    dataUri,
  };
}

function mimeForImagePath(filePath: string): string {
  const ext = filePath.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "png":
      return "image/png";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "gif":
      return "image/gif";
    case "bmp":
      return "image/bmp";
    default:
      return "image/png";
  }
}

function mapAlign(value: string | undefined): PptxParagraph["align"] {
  switch (value) {
    case "ctr":
      return "center";
    case "r":
      return "right";
    case "just":
      return "justify";
    default:
      return "left";
  }
}

function emuToPx(value: string | undefined): number {
  return Math.round(Number(value ?? 0) / EMU_PER_PX);
}

function attr(node: XmlNode | undefined, name: string): string | undefined {
  const value = node?.[`@_${name}`];
  return typeof value === "string" ? value : undefined;
}

function asArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

function buildRelationshipMap(relsXml: XmlNode): Map<string, string> {
  const relationships = relsXml["Relationships"] as XmlNode | undefined;
  const list = asArray(relationships?.["Relationship"] as XmlNode | XmlNode[] | undefined);
  const map = new Map<string, string>();
  for (const rel of list) {
    const id = attr(rel, "Id");
    const target = attr(rel, "Target");
    if (id && target) map.set(id, target);
  }
  return map;
}

/** Resolves an OPC relationship `Target` (which may start with `../`)
 *  relative to the part that referenced it, e.g. resolving
 *  `../media/image1.png` from `ppt/slides/slide2.xml` to `ppt/media/image1.png`. */
function resolveRelativeTarget(fromFilePath: string, target: string): string {
  const stack = fromFilePath.split("/").slice(0, -1);
  for (const part of target.split("/")) {
    if (part === "..") stack.pop();
    else if (part === "." || part === "") continue;
    else stack.push(part);
  }
  return stack.join("/");
}

/** e.g. "ppt/slides/slide2.xml" -> "ppt/slides/_rels/slide2.xml.rels" */
function relsPathFor(filePath: string): string {
  const segments = filePath.split("/");
  const fileName = segments.pop()!;
  return [...segments, "_rels", `${fileName}.rels`].join("/");
}

async function readXmlFile(zip: JSZip, filePath: string): Promise<XmlNode> {
  const file = zip.file(filePath);
  if (!file) {
    throw new Error(`This presentation is missing an expected part (${filePath}).`);
  }
  const xml = await file.async("string");
  return xmlParser.parse(xml) as XmlNode;
}
