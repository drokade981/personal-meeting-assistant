# Personal Assistant

A TypeScript personal assistant built with LangChain and LangGraph. It uses Groq to interpret requests and routes calendar-related requests through tools for creating and listing events.

## Current status

The LangGraph workflow is implemented. The calendar tools currently return sample responses; Google Calendar integration is planned.

Planned work is tracked in [plan.md](plan.md).

## Requirements

- Node.js 18 or newer
- A Groq API key

## Setup

Install dependencies:

```bash
npm install
```

Create a `.env` file in the project root:

```env
GROQ_API_KEY=your_groq_api_key
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
GOOGLE_ACCESS_TOKEN=
GOOGLE_REFRESH_TOKEN=
```

## Run

Build the TypeScript source:

```bash
npm run build
```

Run the compiled application:

```bash
npm start
```

The source uses Node's native ESM configuration. Keep the `.js` extension when importing local TypeScript modules, for example:

```ts
import { createCalendarEvents, getCalendarEvents } from "./tools.js";
```

TypeScript resolves this to `tools.ts` during compilation, and Node loads the generated `dist/tools.js` file at runtime.

## Project structure

- `index.ts` - Creates the Groq model, LangGraph workflow, and assistant entry point.
- `tools.ts` - Defines the calendar tools.
- `plan.md` - Lists planned features.
- `dist/` - Generated JavaScript output after running the build.

## Development

Check the project without emitting files:

```bash
npx tsc --noEmit
```

The default test script is currently a placeholder. Add automated tests as the calendar integration is implemented.

## License

ISC
