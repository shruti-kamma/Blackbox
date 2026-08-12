// pdf-parse@1's package entry (index.js) has a debug-mode footgun that
// misfires under Turbopack (see extract-text.ts) — importing its inner lib
// file directly avoids it, but that subpath has no bundled/DefinitelyTyped
// declaration, hence this minimal shim.
declare module "pdf-parse/lib/pdf-parse.js" {
  interface PDFParseResult {
    text: string;
    numpages: number;
  }
  function pdfParse(dataBuffer: Buffer): Promise<PDFParseResult>;
  export default pdfParse;
}
