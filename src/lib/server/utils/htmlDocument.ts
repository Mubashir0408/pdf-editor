export function wrapHtmlDocument(innerHtml: string, extraCss = ""): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    font-family: "Segoe UI", Arial, Helvetica, sans-serif;
    font-size: 12pt;
    line-height: 1.5;
    color: #1a1a1a;
    padding: 40px 48px;
  }
  img { max-width: 100%; }
  table { border-collapse: collapse; width: 100%; margin: 0.6em 0; }
  table, th, td { border: 1px solid #ccc; }
  th, td { padding: 6px 10px; text-align: left; vertical-align: top; }
  th { background: #f3f4f6; }
  h1, h2, h3, h4 { margin-top: 1.1em; margin-bottom: 0.4em; line-height: 1.25; }
  p { margin: 0.5em 0; }
  ul, ol { margin: 0.5em 0; padding-left: 1.5em; }
  ${extraCss}
</style>
</head>
<body>${innerHtml}</body>
</html>`;
}
