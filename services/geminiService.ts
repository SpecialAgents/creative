import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GenerationParams, PromptTemplate } from "../types";
import { PROMPT_TEMPLATES } from "../constants";

// Helper to determine the best model based on complexity
const getModelForTask = (params: GenerationParams) => {
  // Use Pro for high creativity or complex worldbuilding
  if (params.creativity > 0.8 || params.type === 'worldbuilding') {
    return 'gemini-3-pro-preview';
  }
  // Use Flash for speed on shorter/simpler tasks
  return 'gemini-2.5-flash';
};

const constructPrompt = (params: GenerationParams, template: PromptTemplate): string => {
  let prompt = `Write a ${params.length} ${template.name.toLowerCase()} in the ${params.genre} genre. `;
  
  if (params.tone) {
    prompt += `The tone should be ${params.tone}. `;
  }

  prompt += `\n\nSpecific Details:\n`;
  
  template.fields.forEach(field => {
    const value = params.promptInputs[field.key];
    if (value) {
      prompt += `- ${field.label}: ${value}\n`;
    }
  });

  prompt += `\nOutput Guidelines:\n`;
  prompt += `- Focus on showing, not telling.\n`;
  prompt += `- Use sensory details.\n`;
  prompt += `- Ensure the output is coherent and structured.\n`;
  
  return prompt;
};

export const generateCreativeContent = async (
  apiKey: string,
  params: GenerationParams,
  onChunk: (text: string) => void
): Promise<{ text: string; model: string }> => {
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const modelName = getModelForTask(params);
  const template = PROMPT_TEMPLATES.find(t => t.id === params.type);

  if (!template) throw new Error("Invalid template type");

  const prompt = constructPrompt(params, template);

  // System instruction for persona
  const systemInstruction = "You are PenPal AI, an expert creative writing partner. Your output should be highly creative, original, and formatted in Markdown. Do not include meta-commentary like 'Here is your story'. Just start writing.";

  try {
    const responseStream = await ai.models.generateContentStream({
      model: modelName,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction: systemInstruction,
        temperature: params.creativity,
        maxOutputTokens: params.length === 'short' ? 500 : params.length === 'medium' ? 1500 : 4000,
      }
    });

    let fullText = "";

    for await (const chunk of responseStream) {
      const c = chunk as GenerateContentResponse;
      if (c.text) {
        fullText += c.text;
        onChunk(fullText);
      }
    }

    return { text: fullText, model: modelName };

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to generate content.");
  }
};
