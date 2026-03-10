import { createGoogleGenerativeAI } from "@ai-sdk/google";

const google = createGoogleGenerativeAI({
  // custom settings
  apiKey: process.env.GEMINI_API_KEY!,
});

// const gemini2_5Flash = google.chat("gemini-2.5-flash");
// const gemini2_5 = google.chat("gemini-2.5-flash");
const gemini2_5FlashLite = google.chat("gemini-2.5-flash-lite");
const gemini2_5Flash = google.chat("gemini-2.5-flash");
const gemini2_5Pro = google.chat("gemini-2.5-pro");

// embedding models
const gemini2_5Embedding = google.embeddingModel("gemini-2.5-flash");

export { gemini2_5Flash, gemini2_5FlashLite, gemini2_5Pro, gemini2_5Embedding };
