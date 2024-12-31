
export const readFileContent = (file: File): Promise<string | null> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    // Handle different file types
    if (file.type.startsWith("text/")) {
      reader.onload = () => resolve(reader.result as string); // Read as text
      reader.onerror = () => reject(new Error("Failed to read the text file."));
      reader.readAsText(file);
    } else if (file.type.startsWith("image/")) {
      reader.onload = () => resolve(reader.result as string); // Read as Data URL (base64)
      reader.onerror = () => reject(new Error("Failed to read the image file."));
      reader.readAsDataURL(file);
    } else {
      reject(new Error("Unsupported file type."));
    }
  });
};
