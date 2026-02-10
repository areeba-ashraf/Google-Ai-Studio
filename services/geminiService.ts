
import { GoogleGenAI, Type } from "@google/genai";
import { InsightReport, GroundingLink, MoodEntry } from "../types";

// Always use process.env.API_KEY directly
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const INSIGHT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    overallMood: { type: Type.STRING, description: "A brief summary of the user's current mood state." },
    riskScore: { type: Type.NUMBER, description: "A mental health risk score from 0 to 100." },
    stressMarkers: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "List of detected emotional or behavioral stress markers."
    },
    crisisWarning: { type: Type.BOOLEAN, description: "True if urgent professional help is needed." },
    recommendations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          type: { type: Type.STRING, description: "One of: exercise, meditation, journaling, break, professional" },
          urgency: { type: Type.STRING, description: "One of: low, medium, high" }
        },
        required: ["title", "description", "type", "urgency"]
      }
    }
  },
  required: ["overallMood", "riskScore", "stressMarkers", "crisisWarning", "recommendations"]
};

export async function analyzeJournalEntry(text: string): Promise<InsightReport> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze the following journal entry for mental health insights: "${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: INSIGHT_SCHEMA,
        systemInstruction: "You are a specialized mental health analysis AI. Your goal is to detect early signs of stress, anxiety, and depression. Be empathetic but objective. Provide actionable coping mechanisms."
      },
    });

    const result = JSON.parse(response.text || '{}');
    return result as InsightReport;
  } catch (error) {
    console.error("Gemini analysis error:", error);
    throw error;
  }
}

export async function transcribeAudio(base64Data: string, mimeType: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          // Fix: Changed base64data to base64Data to match the parameter name
          { inlineData: { data: base64Data, mimeType } },
          { text: "Transcribe this audio exactly. Only return the transcript text, nothing else." }
        ]
      }
    });
    return response.text || "";
  } catch (error) {
    console.error("Transcribe error:", error);
    return "";
  }
}

export async function getNearbySupport(latitude: number, longitude: number): Promise<{ text: string, links: GroundingLink[] }> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Identify exactly the top 10 best-rated psychologists and mental health clinics in this specific vicinity. Rank them primarily by their Google star ratings and review volume. Provide a very short, one-sentence highlight for each explaining why they are top-tier.",
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: latitude,
              longitude: longitude
            }
          }
        }
      },
    });

    const text = response.text || "Top rated local professionals identified.";
    
    const links: GroundingLink[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    chunks.forEach((chunk: any) => {
      if (chunk.maps) {
        let snippetText = "";
        if (chunk.maps.placeAnswerSources && chunk.maps.placeAnswerSources.length > 0) {
            const source = chunk.maps.placeAnswerSources[0];
            if (source.reviewSnippets && source.reviewSnippets.length > 0) {
                snippetText = source.reviewSnippets[0];
            }
        }

        links.push({
          title: chunk.maps.title || "Support Center",
          uri: chunk.maps.uri,
          snippet: snippetText
        });
      }
    });

    const uniqueLinks = Array.from(new Map(links.map(item => [item.title, item])).values()).slice(0, 10);
    return { text, links: uniqueLinks };
  } catch (error) {
    console.error("Maps grounding error:", error);
    throw error;
  }
}

export async function generateWeeklySummary(history: MoodEntry[]): Promise<string> {
  const historyText = history.slice(-14).map(h => `- ${new Date(h.timestamp).toLocaleDateString()}: Score ${h.score}/10, Emotion: ${h.dominantEmotion}, Text: ${h.journalText}`).join('\n');
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a Comprehensive Weekly Biometric Mental Health Report. 
      Use these exact markers for parsing:
      [RISK_SCORE] (0-100)
      [EXECUTIVE_SUMMARY] (2-3 sentences)
      [PATTERN_ANALYSIS] (Detailed technical observations on Energy Depletion, Volatility, and Recovery)
      [LIFESTYLE_STRATEGIES] (5 high-impact actionable quality of life improvements)
      [CLINICAL_SIGN_OFF] (Professional closing)

      Requirements for PATTERN_ANALYSIS:
      - Energy Depletion: Analyze specific drops in mood scores and potential causes.
      - Affective Volatility: Rate the frequency of mood shifts.
      - Low Baseline Recovery: Detect if mood fails to return to peaks after stressors.

      History:
      ${historyText}`,
      config: {
        systemInstruction: "You are an Elite Mental Health Data Analyst. Your writing is highly analytical, formal, and information-dense. You focus on data correlations and long-term psychological patterns."
      },
    });
    
    return response.text || "";
  } catch (error) {
    console.error("Summary error:", error);
    return "";
  }
}
