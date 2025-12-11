import { PromptTemplate, SampleOutput, DocSection } from './types';

export const GENRES = ['Fantasy', 'Sci-Fi', 'Mystery', 'Romance', 'Horror', 'Historical Fiction', 'Literary Fiction', 'Cyberpunk'];
export const TONES = ['Dark', 'Humorous', 'Melancholic', 'Optimistic', 'Suspenseful', 'Whimsical', 'Gritty', 'Romantic'];
export const LENGTHS = ['short', 'medium', 'long'];

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'story',
    name: 'Short Story',
    description: 'Generate a compelling narrative with a beginning, middle, and end.',
    fields: [
      { label: 'Protagonist', key: 'protagonist', type: 'text', placeholder: 'e.g., A retired detective' },
      { label: 'Setting', key: 'setting', type: 'text', placeholder: 'e.g., A rain-slicked futuristic Tokyo' },
      { label: 'Plot Twist', key: 'twist', type: 'text', placeholder: 'e.g., The detective is a ghost' }
    ]
  },
  {
    id: 'poem',
    name: 'Poetry',
    description: 'Compose evocative verse in various styles.',
    fields: [
      { label: 'Poetic Style', key: 'style', type: 'select', options: ['Free Verse', 'Sonnet', 'Haiku', 'Limerick', 'Epic'] },
      { label: 'Theme', key: 'theme', type: 'text', placeholder: 'e.g., The passage of time' }
    ]
  },
  {
    id: 'character',
    name: 'Character Profile',
    description: 'Create a deep, multifaceted character description.',
    fields: [
      { label: 'Name', key: 'name', type: 'text', placeholder: 'Character Name' },
      { label: 'Archetype', key: 'archetype', type: 'text', placeholder: 'e.g., The Reluctant Hero' },
      { label: 'Secret', key: 'secret', type: 'text', placeholder: 'What are they hiding?' }
    ]
  },
  {
    id: 'worldbuilding',
    name: 'World Building',
    description: 'Flesh out a unique setting, culture, or magic system.',
    fields: [
      { label: 'World Name', key: 'worldName', type: 'text', placeholder: 'e.g., Arrakis' },
      { label: 'Key Element', key: 'element', type: 'text', placeholder: 'e.g., Magic is fueled by memories' },
      { label: 'Society Type', key: 'society', type: 'text', placeholder: 'e.g., Theocratic dystopia' }
    ]
  },
  {
    id: 'dialogue',
    name: 'Dialogue Scene',
    description: 'Write a conversation between two characters revealing conflict.',
    fields: [
      { label: 'Characters', key: 'characters', type: 'text', placeholder: 'Name A and Name B' },
      { label: 'Conflict', key: 'conflict', type: 'text', placeholder: 'They are fighting over the last slice of pizza' }
    ]
  }
];

export const SAMPLE_OUTPUTS: SampleOutput[] = [
  {
    title: "The Clockwork Heart",
    type: "story",
    description: "A Steampunk tragedy about an automaton.",
    content: "The gears in Elara's chest clicked softly, a rhythmic reminder of the time she didn't have. Steam hissed from the vents of the London undercity, obscuring the bronze skyline. 'You told me it would last forever,' she whispered, her voice a synthesized melody of sorrow. The tinkerer, his hands stained with oil and regret, looked away. 'Nothing lasts, Elara. Not flesh, and certainly not brass.' He turned a screw, and her heartbeat slowed. One tick. Two ticks. Silence."
  },
  {
    title: "Silence of the Void",
    type: "poem",
    description: "Free verse sci-fi poem.",
    content: "Stars are not eyes,\nThey do not blink for us.\nCold fusion furnaces,\nBurning in the indifferent dark.\nWe drift, seeds in a metal shell,\nDreaming of green,\nWaking to black."
  },
  {
    title: "Kaelen Shadowwalker",
    type: "character",
    description: "Fantasy rogue profile.",
    content: "**Name:** Kaelen Shadowwalker\n**Role:** Master Thief / Reluctant King\n**Appearance:** Lean, scarred, heterochromatic eyes (one blue, one gold). Wears leather armor dyed with squid ink.\n**Personality:** Cynical but fiercely loyal to street urchins. Speaks in dry wit.\n**Secret:** He is actually the heir to the throne he is trying to rob, having been kidnapped as an infant."
  },
  {
    title: "The Floating Isles of Aerthos",
    type: "worldbuilding",
    description: "High fantasy setting description.",
    content: "Aerthos is a world shattered by the Great Sunder. Continents no longer exist; instead, massive islands float in a dense, breathable aether. Travel is conducted via skyships with sails woven from spider-silk. The core of the planet is a small sun, providing light from below, meaning 'night' is when an island drifts into the shadow of another higher island. Magic is gravity-based; mages are 'Anchors' who keep cities from drifting into the void."
  },
  {
    title: "The Interrogation",
    type: "dialogue",
    description: "Tense noir dialogue.",
    content: "**Detective Miller:** Sit down. You know why you're here.\n\n**Vinnie:** I know why you *think* I'm here. Big difference, Miller.\n\n**Miller:** We found the gun, Vinnie. It was in your locker.\n\n**Vinnie:** (Laughs) My locker? The one with the broken lock since '98? Real secure evidence chain you got there.\n\n**Miller:** Don't get cute. We have a witness.\n\n**Vinnie:** A witness? Unless it was God himself, you got nothing but a story."
  }
];

export const TECHNICAL_DOCS: DocSection[] = [
  {
    title: "1. Architecture",
    content: `
### System Overview
PenPal AI is a Single Page Application (SPA) built with **React 18** and **TypeScript**. It utilizes a client-side architecture where all logic, including API orchestration, happens within the user's browser.

### Key Components
1.  **UI Layer**:
    *   **Tailwind CSS**: Used for rapid, utility-first styling. Ensures responsive design and consistent theming.
    *   **Lucide React**: Provides lightweight, consistent SVG icons.
    *   **Recharts**: Used for visualizing performance metrics (latency, token usage).
2.  **Logic Layer**:
    *   **Custom Hooks**: \`useGenerator\` manages the state machine of the generation process (idle, loading, streaming, complete, error).
    *   **Service Layer**: \`geminiService.ts\` acts as a facade for the \`@google/genai\` SDK, handling authentication, model selection, and error normalization.
3.  **Data Persistence**:
    *   **Local Storage**: User history and preferences are persisted in the browser's \`localStorage\`, ensuring privacy and data retention across sessions without a backend database.

### Data Flow
1.  User selects a template and fills inputs.
2.  Frontend validates inputs against defined schemas.
3.  Request is sent to \`geminiService\`.
4.  \`GoogleGenAI\` SDK streams response chunks.
5.  React state updates progressively to show typing effect.
6.  Final metrics are calculated and stored.
`
  },
  {
    title: "2. API Choice & Prompt Engineering",
    content: `
### API Choice: Google Gemini API
We selected the Gemini API for three primary reasons:
1.  **Context Window**: The large context window allows for coherent long-form storytelling and maintaining consistency in worldbuilding tasks.
2.  **Speed/Cost Balance**: \`gemini-2.5-flash\` offers exceptional latency for real-time interaction, crucial for a "flow-state" writing tool.
3.  **Reasoning Capabilities**: \`gemini-3-pro-preview\` is utilized for complex tasks requiring logic, such as ensuring plot holes are filled or constructing consistent magic systems.

### Prompt Engineering Methodology
We employ a **Structured Template Injection** method.

**Base System Instruction**:
> "You are an expert creative writing assistant. Your goal is to produce high-quality, evocative, and structurally sound content. Adhere strictly to the requested genre and tone."

**Dynamic Template Construction**:
Instead of generic prompts, we construct precise instructions:
\`\`\`text
Task: [Template Name]
Genre: [User Genre]
Tone: [User Tone]
Constraints: Length=[User Length], Creativity=[User Temp]
Specific Details:
- [Field 1]: [Value 1]
- [Field 2]: [Value 2]
\`\`\`

**Output Filtering**:
While Gemini has built-in safety filters, we add explicit instructions in the system prompt to "Avoid clichés and ensure the content is appropriate for a general audience unless specified as 'Dark' or 'Gritty' tone."
`
  },
  {
    title: "3. Performance, Costs & Limits",
    content: `
### Performance Optimization
*   **Streaming**: We strictly use \`generateContentStream\`. This reduces Time-To-First-Byte (TTFB) perception significantly. A user sees text appearing in ~400ms rather than waiting 5s for the full block.
*   **Debouncing**: Input fields for parameters are debounced to prevent unnecessary state thrashing.

### Rate Limits & Costs
*   **Gemini 2.5 Flash**: 
    *   **Cost**: Free of charge (within limits) or low cost per 1M tokens. 
    *   **Rate Limits**: 15 RPM (Requests Per Minute) in the free tier; significantly higher in paid tiers.
    *   **Context**: 1M token context window.
*   **Gemini 3 Pro Preview**: 
    *   **Cost**: Higher cost per token, typically reserved for complex reasoning tasks.
    *   **Rate Limits**: 2 RPM in free tier; 60 RPM in paid.
    
### Limitation Management Strategies
*   **Token Limits**: Client-side checks warn users if 'Long' length is selected for complex prompts.
*   **Rate Limiting**: The app handles \`429\` errors with a user-friendly "Cooling down..." message and exponential backoff retry suggestions.
*   **Quota Exhaustion**: If the API key quota is exceeded, the app provides a clear error message prompting the user to check their billing or switch keys.
*   **Content Safety**: We utilize Gemini's default safety settings but handle blockages by prompting the user to refine their inputs if they trigger safety violations.
`
  }
];