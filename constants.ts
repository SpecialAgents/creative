import { PromptTemplate, SampleOutput, DocSection } from './types';

export const GENRES = ['Fantasy', 'Sci-Fi', 'Mystery', 'Romance', 'Horror', 'Historical Fiction', 'Literary Fiction', 'Cyberpunk', 'Folklore'];
export const TONES = ['Dark', 'Humorous', 'Melancholic', 'Optimistic', 'Suspenseful', 'Whimsical', 'Gritty', 'Romantic', 'Educational'];
export const LENGTHS = ['short', 'medium', 'long'];

export const SA_LANGUAGES = [
  'English',
  'isiZulu',
  'isiXhosa',
  'Afrikaans',
  'Sepedi',
  'Setswana',
  'Sesotho',
  'Xitsonga',
  'siSwati',
  'Tshivenda',
  'isiNdebele'
];

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
      { label: 'Poetic Style', key: 'style', type: 'select', options: ['Free Verse', 'Sonnet', 'Haiku', 'Limerick', 'Epic', 'Praise Poem (Izibongo)'] },
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
    title: "1. Executive Summary",
    content: `
## Project Overview
**PenPal AI** is a state-of-the-art creative writing suite designed to democratize access to advanced generative AI. It serves as a co-pilot for authors, role-players, and world-builders, leveraging the multimodal capabilities of the Google Gemini API. The application provides a seamless, distraction-free environment for generating diverse content types, including narratives, poetry, character profiles, and dialogue systems.

## Key Objectives
1.  **Accessibility**: Remove the barrier to entry for prompting complex LLMs by providing structured, intuitive templates.
2.  **Performance**: Utilize 'Flash' models for low-latency ideation and 'Pro' models for complex reasoning.
3.  **Privacy**: Implement a client-side-first architecture where user history is stored locally.

## Technology Stack
*   **Core Framework**: React 18 with TypeScript.
*   **Styling**: Tailwind CSS for utility-first, responsive design with Dark Mode support.
*   **AI Engine**: Google GenAI SDK (Gemini 2.5 Flash & Gemini 3.0 Pro).
*   **Visualization**: Recharts for performance analytics.
*   **Routing**: React Router DOM (HashRouter) for SPA navigation.
`
  },
  {
    title: "2. System Architecture",
    content: `
## Client-Side Architecture
PenPal AI operates as a **Single Page Application (SPA)**. This architectural choice minimizes server costs and latency, as the application logic resides entirely within the user's browser after the initial load.

### Component Hierarchy
The application is structured around a central \`LayoutShell\` that manages global state (Theme, History) and navigation.
*   **App**: Root entry point, handles routing and LocalStorage synchronization.
*   **Generator**: The core workhorse. Manages the "Prompt Engineering" layer, input validation, and streaming API responses.
*   **Stats**: A data visualization dashboard that aggregates user metrics (tokens/sec, genre distribution).
*   **History**: A virtualized list view for managing past generations.

### State Management Strategy
Instead of heavy state libraries (Redux/Zustand), the app utilizes React's native \`useState\` and \`useEffect\` hooks, combined with \`localStorage\` for persistence.
*   **Volatile State**: Current input fields, loading states, streaming buffers.
*   **Persisted State**: User history arrays, theme preference (Dark/Light).

### Data Persistence
Data is stored in the browser's \`localStorage\` under the key \`museai_history\`.
*   **Limit Management**: The history is capped at 10 items to prevent \`localStorage\` quota exceedance (typically 5MB).
*   **Structure**: JSON objects containing unique IDs, timestamps, content strings, and meta-parameters.
`
  },
  {
    title: "3. API Implementation Strategy",
    content: `
## Google Gemini Integration
The core value proposition of PenPal AI is its sophisticated integration with the Google Gemini API.

### Model Selection Logic
We employ a dynamic routing strategy for model selection based on user intent:
1.  **Gemini 2.5 Flash**: Selected for standard tasks (Short Stories, Dialogue).
    *   *Rationale*: Extremely low Time-To-First-Token (TTFT) and high throughput.
2.  **Gemini 3.0 Pro**: Selected for complex tasks (World Building, High Creativity > 0.8).
    *   *Rationale*: Superior reasoning capabilities required for maintaining internal consistency in fictional worlds.

### Structured Template Injection (STI)
To ensure consistent quality, we do not send raw user inputs to the model. We utilize STI:
1.  **Input Collection**: User fills specific form fields (e.g., "Protagonist", "Setting").
2.  **Context Wrapping**: These inputs are injected into a rigid Markdown template.
3.  **System Instruction**: A hidden system prompt defines the AI persona ("Expert Creative Writing Assistant") and enforces formatting rules.

### Streaming Response Handling
The application utilizes \`generateContentStream\`.
*   **UX Impact**: The user perceives near-instant responsiveness as text generates character-by-character.
*   **Technical Implementation**: An async iterator loop consumes chunks from the API and updates the React state in real-time.

\`\`\`typescript
for await (const chunk of responseStream) {
  const text = chunk.text();
  updateUI(text);
}
\`\`\`
`
  },
  {
    title: "4. Frontend Engineering",
    content: `
## UI/UX Design Patterns
The interface is built using **Glassmorphism** principles to create a modern, immersive aesthetic suitable for creative work.
*   **Visual Stack**: Translucent backgrounds (\`bg-white/60\`), backdrop blurs (\`backdrop-blur-xl\`), and subtle borders.
*   **Dark Mode**: A generic class-based toggle strategy that cascades via Tailwind's \`dark:\` prefix.

## Input Validation & Sanitation
To prevent wasted API calls and ensure prompt safety:
*   **Gibberish Detection**: A heuristic algorithm analyzes vowel/consonant ratios to reject keyboard mashing.
*   **Regex Validation**: Prevents purely numerical inputs or illegal characters in narrative fields.

## Visualization Engine
The \`Stats\` component parses the history array to generate insights:
*   **Token Estimation**: Since the API returns raw text, we estimate token count using a character-ratio heuristic (approx 4 chars/token).
*   **Latency Tracking**: We capture \`Date.now()\` deltas between request start and stream completion.
`
  },
  {
    title: "5. Security & Privacy",
    content: `
## API Key Security
The application uses \`process.env.API_KEY\` injection.
*   **Risk Mitigation**: In a production environment, this variable is injected at build time. The client never transmits the key to a third-party server, only directly to Google's endpoints.
*   **Best Practice**: For a public deployment, a proxy server would be introduced to hide the key. Current architecture assumes a personal/local deployment or protected environment.

## Content Safety
We rely on Gemini's default safety filters (Harassment, Hate Speech, Sexually Explicit).
*   **Error Handling**: If a prompt triggers a safety filter, the API throws a specific error which is caught and displayed as a user-friendly "Content Policy Violation" message, rather than crashing the app.
`
  },
  {
    title: "6. Future Roadmap",
    content: `
## Planned Features (v3.0)
1.  **Export to PDF/ePub**: Native export for writers to publish directly.
2.  **Multi-turn Conversations**: Allowing users to "chat" with the generated characters using the \`ChatSession\` API.
3.  **Image Generation**: Integration of Imagen 3 to generate book covers or character portraits based on the text descriptions.
4.  **Cloud Sync**: Optional Firebase integration to sync history across devices.

## Optimization Targets
*   **Caching**: Implement \`sessionStorage\` caching for identical prompts to save API costs.
*   **Voice Input**: Utilization of the Web Speech API to allow dictation of prompts.
`
  }
];