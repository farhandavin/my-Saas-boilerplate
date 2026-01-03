
import { google } from "@ai-sdk/google";
import { embed } from "ai";
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  console.log('Testing simple model name...');
  
  try {
    const { embedding } = await embed({
      model: google.textEmbeddingModel("text-embedding-004"),
      value: "Test",
    });
    console.log('Success! Embedding length:', embedding.length);
  } catch (error) {
    console.error('Failed without prefix:', error);
  }

  try {
    const { embedding } = await embed({
      model: google.textEmbeddingModel("models/text-embedding-004"),
      value: "Test",
    });
    console.log('Success! Embedding length (with prefix):', embedding.length);
  } catch (error) {
    console.error('Failed with prefix:', error);
  }
}

test();
