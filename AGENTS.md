# Codebuff Agents

This document describes the available agents that can be spawned to help with development tasks in this project.

## Available Agents

### File Explorer (`codebuff/file-explorer@0.0.7`)
Comprehensively explores the codebase and reports back on findings.

**Use when:** You need to understand different parts of the codebase or discover relevant files.

**Parameters:**
- `prompt`: What you need to accomplish by exploring the codebase
- `prompts`: List of 1-4 different parts of the codebase to explore

**Example:**
```json
{
  "agent_type": "codebuff/file-explorer@0.0.7",
  "prompt": "Understand the reservation system architecture",
  "params": {
    "prompts": [
      "Client-side reservation components",
      "Server-side reservation API",
      "Database schema for reservations"
    ]
  }
}
```

### File Picker (`codebuff/file-picker@0.0.5`)
Finds relevant files in the codebase related to a coding task.

**Use when:** You need to locate files for a specific feature or bug fix.

**Parameters:**
- `prompt`: A coding task to complete

**Example:**
```json
{
  "agent_type": "codebuff/file-picker@0.0.5",
  "prompt": "Fix the reservation form validation"
}
```

### Researcher (`codebuff/researcher@0.0.4`)
Browses the web and reads technical documentation to find relevant information.

**Use when:** You need to research APIs, libraries, or best practices.

**Parameters:**
- `prompt`: A question you would like answered

**Example:**
```json
{
  "agent_type": "codebuff/researcher@0.0.4",
  "prompt": "How to implement real-time notifications with Firebase Cloud Messaging?"
}
```

### Thinker (`codebuff/thinker@0.0.5`)
Performs deep thinking on complex problems with access to current message history.

**Use when:** You need to solve a complex architectural or algorithmic problem.

**Parameters:**
- `prompt`: The problem you are trying to solve

**Example:**
```json
{
  "agent_type": "codebuff/thinker@0.0.5",
  "prompt": "Design a conflict resolution strategy for overlapping lab reservations"
}
```

### Reviewer (`codebuff/reviewer@0.0.11`)
Reviews file changes and provides critical feedback.

**Use when:** After making significant changes to ensure code quality.

**Parameters:**
- `prompt`: What should be reviewed (be brief)

**Example:**
```json
{
  "agent_type": "codebuff/reviewer@0.0.11",
  "prompt": "Reservation validation logic changes"
}
```

### Context Pruner (`codebuff/context-pruner@0.0.23`)
Prunes context by removing old tool results and messages.

**Use when:** Conversation history becomes too large.

**Parameters:**
- `maxContextLength`: Maximum context length to maintain

**Example:**
```json
{
  "agent_type": "codebuff/context-pruner@0.0.23",
  "params": {
    "maxContextLength": 50000
  }
}
```

## Usage Tips

1. **Start with File Explorer or File Picker** when beginning work on a new feature
2. **Use Researcher** when you need external documentation or examples
3. **Spawn Thinker** for complex architectural decisions
4. **Always use Reviewer** after significant code changes
5. **Spawn agents in parallel** when possible for efficiency

## Project-Specific Agent Workflows

### Adding a New Feature
1. File Explorer → understand existing architecture
2. Researcher → gather best practices
3. Thinker → design the solution
4. Reviewer → validate implementation

### Debugging an Issue
1. File Picker → locate relevant files
2. Thinker → analyze the problem
3. Reviewer → verify the fix

### Refactoring
1. File Explorer → map dependencies
2. Thinker → plan refactoring strategy
3. Reviewer → ensure nothing broke

## Project Structure

```
client/                   # React SPA frontend
├── pages/                # Route components (Index.tsx = home)
├── components/ui/        # Pre-built UI component library
├── App.tsx                # App entry point and with SPA routing setup
└── global.css            # TailwindCSS 3 theming and global styles

server/                   # Express API backend
├── index.ts              # Main server setup (express config + routes)
└── routes/               # API handlers

shared/                   # Types used by both client & server
└── api.ts                # Example of how to share api interfaces
```

## Key Features

## SPA Routing System

The routing system is powered by React Router 6:

- `client/pages/Index.tsx` represents the home page.
- Routes are defined in `client/App.tsx` using the `react-router-dom` import
- Route files are located in the `client/pages/` directory

For example, routes can be defined with:

```typescript
import { BrowserRouter, Routes, Route } from "react-router-dom";

<Routes>
  <Route path="/" element={<Index />} />
  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
  <Route path="*" element={<NotFound />} />
</Routes>;
```

### Styling System

- **Primary**: TailwindCSS 3 utility classes
- **Theme and design tokens**: Configure in `client/global.css`
- **UI components**: Pre-built library in `client/components/ui/`
- **Utility**: `cn()` function combines `clsx` + `tailwind-merge` for conditional classes

```typescript
// cn utility usage
className={cn(
  "base-classes",
  { "conditional-class": condition },
  props.className  // User overrides
)}
```

### Express Server Integration

- **Development**: Single port (8080) for both frontend/backend
- **Hot reload**: Both client and server code
- **API endpoints**: Prefixed with `/api/`

#### Example API Routes

- `GET /api/ping` - Simple ping api
- `GET /api/demo` - Demo endpoint

### Shared Types

Import consistent types in both client and server:

```typescript
import { DemoResponse } from "@shared/api";
```

Path aliases:

- `@shared/*` - Shared folder
- `@/*` - Client folder

## Development Commands

```bash
pnpm dev        # Start dev server (client + server)
pnpm build      # Production build
pnpm start      # Start production server
pnpm typecheck  # TypeScript validation
pnpm test          # Run Vitest tests
```

## Adding Features

### Add new colors to the theme

Open `client/global.css` and `tailwind.config.ts` and add new tailwind colors.

### New API Route

1. **Optional**: Create a shared interface in `shared/api.ts`:

```typescript
export interface MyRouteResponse {
  message: string;
  // Add other response properties here
}
```

2. Create a new route handler in `server/routes/my-route.ts`:

```typescript
import { RequestHandler } from "express";
import { MyRouteResponse } from "@shared/api"; // Optional: for type safety

export const handleMyRoute: RequestHandler = (req, res) => {
  const response: MyRouteResponse = {
    message: "Hello from my endpoint!",
  };
  res.json(response);
};
```

3. Register the route in `server/index.ts`:

```typescript
import { handleMyRoute } from "./routes/my-route";

// Add to the createServer function:
app.get("/api/my-endpoint", handleMyRoute);
```

4. Use in React components with type safety:

```typescript
import { MyRouteResponse } from "@shared/api"; // Optional: for type safety

const response = await fetch("/api/my-endpoint");
const data: MyRouteResponse = await response.json();
```

### New Page Route

1. Create component in `client/pages/MyPage.tsx`
2. Add route in `client/App.tsx`:

```typescript
<Route path="/my-page" element={<MyPage />} />
```

## Production Deployment

- **Standard**: `pnpm build`
- **Binary**: Self-contained executables (Linux, macOS, Windows)
- **Cloud Deployment**: Use either Netlify or Vercel via their MCP integrations for easy deployment. Both providers work well with this starter template.

## Architecture Notes

- Single-port development with Vite + Express integration
- TypeScript throughout (client, server, shared)
- Full hot reload for rapid development
- Production-ready with multiple deployment options
- Comprehensive UI component library included
- Type-safe API communication via shared interfaces
