
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  console.log('Testing Chat Model: gemini-2.0-flash ...');
  
  try {
    const { text } = await generateText({
      model: google("gemini-2.0-flash"),
      prompt: "Hello",
    });
    console.log('Success! Response:', text);
  } catch (error) {
    console.error('Failed:', error);
  }
}

test();
