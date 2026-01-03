
import { google } from "@ai-sdk/google";
import { embed } from "ai";
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  console.log('Testing google.textEmbeddingModel...');
  
  // @ts-ignore
  const model = google.textEmbeddingModel("models/text-embedding-004");
  console.log('Model keys:', Object.keys(model));
  // @ts-ignore
  console.log('Has doEmbed?', typeof model.doEmbed);

  try {
    const { embedding } = await embed({
      model: model,
      value: "This is a test sentence.",
    });
    console.log('Success! Embedding length:', embedding.length);
  } catch (error) {
    console.error('Embedding Failed:', error);
  }
}

test();
