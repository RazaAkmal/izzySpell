// app/api/textract/route.ts

import { NextResponse } from "next/server";
import { TextractClient, DetectDocumentTextCommand } from "@aws-sdk/client-textract";
import { Buffer } from "buffer";

const textractClient = new TextractClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

export async function POST(req: Request) {
  console.log(process.env.AWS_ACCESS_KEY_ID, process.env.AWS_SECRET_ACCESS_KEY)
  try {
    const { fileBase64 } = await req.json();

    if (!fileBase64) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(fileBase64, "base64");

    const command = new DetectDocumentTextCommand({
      Document: {
        Bytes: buffer,
      },
    });

    const response = await textractClient.send(command);
    const words =
      response.Blocks?.filter((block) => block.BlockType === "WORD")
        .map((block) => block.Text || "")
        .filter((word) => word.length > 0) || [];
        
    return NextResponse.json({ words });
  } catch (error: any) {
    console.error("Textract error:", error);
    return NextResponse.json(
      { error: "Textract failed", details: error.message },
      { status: 500 }
    );
  }
}
