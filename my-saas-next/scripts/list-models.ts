
import dotenv from 'dotenv';
dotenv.config();

async function listModels() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.warn('GEMINI_API_KEY not set');
    return;
  }
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
  
  console.log('Fetching models from:', url.replace(key, 'HIDDEN'));

  try {
    const res = await fetch(url);
    const data = await res.json();
    
    if (data.models) {
      console.log('Available Models:');
      data.models.forEach((m: any) => {
        if (m.supportedGenerationMethods.includes('generateContent')) {
             console.log(`- ${m.name} (generateContent)`);
        } else if (m.supportedGenerationMethods.includes('embedContent')) {
             console.log(`- ${m.name} (embedContent)`);
        } else {
             console.log(`- ${m.name}`);
        }
      });
    } else {
      console.log('No models found or error:', data);
    }
  } catch (error) {
    console.error('Fetch failed:', error);
  }
}

listModels();
