import { processFileWithAI } from "@/app/actions/AiService";


export async function POST(req: Request) {
  try {
    // Process the uploaded file using AI
    const file = req.body;
    const aiResponse = await processFileWithAI(file);

    // Return the AI response to the client
    return new Response(JSON.stringify(aiResponse), { status: 200 });
  } catch (error) {
    console.error("Error processing file:", error);
    return new Response(JSON.stringify({ error: '"AI processing failed' }), { status: 500 });
  }
}
