/** Mammoth ships no types of its own — this covers exactly the surface this project uses. */
declare module "mammoth" {
  export interface MammothMessage {
    type: string;
    message: string;
  }

  export interface ConvertResult {
    value: string;
    messages: MammothMessage[];
  }

  export function convertToHtml(input: { path: string } | { buffer: Buffer }): Promise<ConvertResult>;
}
