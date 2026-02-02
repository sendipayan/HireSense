/**
 * PDF Parser Utility
 *
 * This utility extracts text from PDF files using pdf-parse v1
 * which works reliably in Next.js without worker configuration issues.
 */

interface PDFParseResult {
  text: string;
  numpages: number;
  info?: any;
  metadata?: any;
}

/**
 * Extracts text from a PDF file given its URL
 * @param pdfUrl - The URL of the PDF file
 * @returns The extracted text content
 */
export async function extractTextFromPDF(pdfUrl: string): Promise<string> {
  try {
    // Fetch the PDF as a buffer
    const response = await fetch(pdfUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Dynamically import pdf-parse (v1 uses a simple function interface)
    const pdfParse = (await import("pdf-parse")).default as (
      dataBuffer: Buffer,
    ) => Promise<PDFParseResult>;

    // Parse the PDF buffer
    const data = await pdfParse(buffer);

    return data.text;
  } catch (error) {
    console.error("[PDF Parser] Error extracting text:", error);
    throw new Error(
      `Failed to extract text from PDF: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Extracts text from a PDF buffer
 * @param buffer - The PDF file as a Buffer
 * @returns The extracted text content
 */
export async function extractTextFromPDFBuffer(
  buffer: Buffer,
): Promise<string> {
  try {
    // Dynamically import pdf-parse
    const pdfParse = (await import("pdf-parse")).default as (
      dataBuffer: Buffer,
    ) => Promise<PDFParseResult>;

    // Parse the PDF buffer
    const data = await pdfParse(buffer);

    return data.text;
  } catch (error) {
    console.error("PDF parsing error:", error);
    throw new Error(
      `Failed to extract text from PDF buffer: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Extracts full PDF information including metadata
 * @param pdfUrl - The URL of the PDF file
 * @returns The full PDF parse result with text, page count, and metadata
 */
export async function getPDFInfo(pdfUrl: string): Promise<PDFParseResult> {
  try {
    const response = await fetch(pdfUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const pdfParse = (await import("pdf-parse")).default as (
      dataBuffer: Buffer,
    ) => Promise<PDFParseResult>;
    const data = await pdfParse(buffer);

    return data;
  } catch (error) {
    console.error("PDF info extraction error:", error);
    throw new Error(
      `Failed to get PDF info: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
