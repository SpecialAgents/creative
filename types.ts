
export type ContentType = 'story' | 'poem' | 'character' | 'worldbuilding' | 'dialogue';

export interface PromptTemplate {
  id: ContentType;
  name: string;
  description: string;
  fields: {
    label: string;
    key: string;
    type: 'text' | 'select' | 'textarea';
    options?: string[];
    placeholder?: string;
  }[];
}

export interface GenerationParams {
  type: ContentType;
  genre: string;
  tone: string;
  language: string;
  length: 'short' | 'medium' | 'long';
  creativity: number; // 0 to 1 (Temperature)
  promptInputs: Record<string, string>;
}

export interface GenerationResult {
  id: string;
  content: string;
  timestamp: number;
  params: GenerationParams;
  metrics: {
    durationMs: number;
    estimatedTokens: number;
    model: string;
  };
  userRating?: number;
}

export interface SampleOutput {
  title: string;
  type: ContentType;
  content: string;
  description: string;
}

export interface DocSection {
  title: string;
  content: string;
}
