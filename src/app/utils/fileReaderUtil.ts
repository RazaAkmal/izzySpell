import * as XLSX from "xlsx";
import mammoth from "mammoth";
import pdfToText from "react-pdftotext";

export const readFileContent = (file: File): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    // TEXT FILE
    if (file.type.startsWith("text/")) {
      reader.onload = () => resolve((reader.result as string).split(/\s+/));
      reader.onerror = () => reject(new Error("Failed to read the text file."));
      reader.readAsText(file);

    // PDF FILE
    } else if (file.type === "application/pdf") {
      reader.onload = async () => {
        try {
          const text = await pdfToText(file);
          resolve(text.split(/\s+/));
        } catch {
          reject(new Error("Failed to extract text from PDF."));
        }
      };
      reader.onerror = () => reject(new Error("Failed to read the PDF file."));
      reader.readAsArrayBuffer(file);

    // CSV or EXCEL FILE
    } else if (
      file.type === "text/csv" ||
      file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      reader.onload = () => {
        try {
          const workbook = XLSX.read(reader.result, { type: "array" });
          let text = "";
          workbook.SheetNames.forEach((sheetName) => {
            const sheet = workbook.Sheets[sheetName];
            text += XLSX.utils.sheet_to_csv(sheet) + " ";
          });
          resolve(text.split(/\s+/));
        } catch {
          reject(new Error("Failed to extract text from spreadsheet."));
        }
      };
      reader.onerror = () => reject(new Error("Failed to read the spreadsheet file."));
      reader.readAsArrayBuffer(file);

    // DOCX FILE
    } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      reader.onload = async () => {
        try {
          const { value } = await mammoth.extractRawText({
            arrayBuffer: reader.result as ArrayBuffer
          });
          resolve(value.split(/\s+/));
        } catch {
          reject(new Error("Failed to extract text from DOCX file."));
        }
      };
      reader.onerror = () => reject(new Error("Failed to read the DOCX file."));
      reader.readAsArrayBuffer(file);

    // IMAGE FILES (use API route for Textract)
    } else if (file.type.startsWith("image/")) {
      reader.onload = async () => {
        try {
          const base64 = (reader.result as string).split(",")[1]; // Remove data:image/... prefix

          const res = await fetch("/api/textract", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ fileBase64: base64 }),
          });

          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.error || "Textract failed");
          }

          resolve(data.words);
        } catch (error) {
          console.error("Textract API error:", error);
          reject(new Error("Failed to extract text from image."));
        }
      };
      reader.onerror = () => reject(new Error("Failed to read the image file."));
      reader.readAsDataURL(file); // Required for base64
    }

    // UNSUPPORTED FILE TYPE
    else {
      reject(new Error("Unsupported file type."));
    }
  });
};
