// app/api/textract/route.ts

import { NextResponse } from "next/server";
import { TextractClient, DetectDocumentTextCommand } from "@aws-sdk/client-textract";
import { Buffer } from "buffer";
import { getSessionUserId } from "@/lib/requireSession";
import { MAX_UPLOAD_BYTES } from "@/lib/limits";

const textractClient = new TextractClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

// Next.js App Router segment config (the old `config.api.bodyParser` only applies to the
// Pages Router and is ignored here)
export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    if (!(await getSessionUserId())) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { fileBase64 } = await req.json();

    if (!fileBase64 || typeof fileBase64 !== "string") {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Reject before decoding: base64 is ~4/3 the size of the file
    if (fileBase64.length > Math.ceil((MAX_UPLOAD_BYTES * 4) / 3) + 4) {
      return NextResponse.json({ error: "File is too large (10 MB maximum)" }, { status: 400 });
    }

    const buffer = Buffer.from(fileBase64, "base64");
    if (buffer.length > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: "File is too large (10 MB maximum)" }, { status: 400 });
    }

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
