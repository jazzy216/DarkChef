
import { GoogleGenAI, Type } from "@google/genai";
import { DetectionResult } from "../types";

const API_KEY = process.env.API_KEY || "";

export const analyzeInput = async (input: string): Promise<DetectionResult | null> => {
  if (!API_KEY || input.length < 3) return null;

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the following data and detect its encoding, hash type, or data format. 
      Input Data: ${input.slice(0, 1000)}...
      Return a JSON object with format, confidence (0-1), explanation, and a list of suggested operation IDs from this set: 
      [base64-decode, hex-decode, url-decode, json-prettify, rot13, sha256].`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            format: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            explanation: { type: Type.STRING },
            suggestedOperations: { 
                type: Type.ARRAY,
                items: { type: Type.STRING }
            }
          },
          required: ["format", "confidence", "explanation", "suggestedOperations"]
        }
      }
    });

    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return null;
  }
};
