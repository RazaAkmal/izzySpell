import * as XLSX from "xlsx";
import mammoth from "mammoth";
import pdfToText from "react-pdftotext";
import Tesseract from "tesseract.js";

export const readFileContent = (file: File): Promise<string[] | null> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    if (file.type.startsWith("text/")) {
      reader.onload = () => resolve((reader.result as string).split(/\s+/));
      reader.onerror = () => reject(new Error("Failed to read the text file."));
      reader.readAsText(file);
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
    } else if (file.type === "text/csv" || file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
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
    } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      reader.onload = async () => {
        try {
          const { value } = await mammoth.extractRawText({ arrayBuffer: reader.result as ArrayBuffer });
          resolve(value.split(/\s+/));
        } catch {
          reject(new Error("Failed to extract text from DOCX file."));
        }
      };
      reader.onerror = () => reject(new Error("Failed to read the DOCX file."));
      reader.readAsArrayBuffer(file);
    } else if (file.type.startsWith("image/")) {
      reader.onload = async () => {
        try {
          // Perform OCR using Tesseract.js
          const { data } = await Tesseract.recognize(reader.result as string, "eng");

          // Extract only words (filter out non-alphabetic characters)
          const words = data.text
            .split(/\s+/) // Split text into words by whitespace
            .map((word) => word.replace(/[^a-zA-Z]/g, "")) // Remove non-alphabetic characters
            .filter((word) => word.length > 0); // Remove empty strings

          resolve(words);
        } catch (error) {
          console.error("Failed to extract text from image:", error);
          reject(new Error("Failed to extract text from image."));
        }
      };

      reader.onerror = () => reject(new Error("Failed to read the image file."));
      reader.readAsDataURL(file);
    } else {
      reject(new Error("Unsupported file type."));
    }
  });
};
