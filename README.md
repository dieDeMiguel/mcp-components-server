# Components MCP Server

MCP server exposing MercadoLibre UI component catalog via HTTP endpoints for AI tools integration.

## What it does

This repository provides a Model Context Protocol (MCP) server that exposes UI component catalog through HTTP endpoints. It allows AI tools and other services to query component information, including props, variants, styling, and usage details.

## Production URL

**Live Endpoint:** `https://meli-xmcp-poc.vercel.app/mcp`

## How to Consume

### Protocol

JSON-RPC 2.0 over HTTP POST

### Required Headers

- `Content-Type: application/json`
- `Accept: application/json`

### Available Tools

#### 1\. get_design_specifications

Returns implementation specifications and guidance for generating UI using this MCP. Parameters:

```json
{
  "jsonrpc": "2.0",
  "id": "0",
  "method": "tools/call",
  "params": {
    "name": "get_design_specifications",
    "arguments": {
      "versions": { "andes": "latest" }
    }
  }
}
```

Response is a `content` array with a single `text` item containing a markdown string with implementation guidance (imports, dependencies, helper components, validation checklists). The `versions` object is optional and currently used only to echo Andes version in the document header.

#### 2\. list_components

Get all components with optional filtering

```json
{
  "jsonrpc": "2.0",
  "id": "1",
  "method": "tools/call",
  "params": {
    "name": "list_components",
    "arguments": {
      "query": "button",
      "tags": ["interactive"],
      "packageFilter": "@meli/ui"
    }
  }
}
```

#### 3\. get_component

Get detailed component specification

```json
{
  "jsonrpc": "2.0",
  "id": "2", 
  "method": "tools/call",
  "params": {
    "name": "get_component",
    "arguments": {
      "name": "Button",
      "variant": "primary"
    }
  }
}
```

### Integration Options

- Direct HTTP calls from any service
- MCP client libraries (Cursor, Claude Desktop)
- Custom AI tool integrations
- Component documentation generators

### Response Format

- **Envelope**: All tool responses use the MCP `content` array. Each entry is an object with `{ type: "text", text: string }`.
- **Text payload**:
  - `get_design_specifications`: returns a markdown string with implementation guidance. No leading JSON. Consumers should treat `content[0].text` as markdown.
  - `list_components`: returns a JSON stringified array of simplified components: `[{ name, description, purpose }]`.
  - `get_component`: returns a JSON stringified object with shape:

```json
{
  "components": [ { /* component spec from catalog */ } ],
  "required_dependencies": { "clsx": "^2.0.0" },
  "package_json_dependencies": { "clsx": "^2.0.0" },
  "installation_commands": ["pnpm add clsx", "npm install clsx", "yarn add clsx"],
  "setup_instructions": ["..."],
  "critical_notes": ["..."],
  "helper_components": [
    {
      "name": "Spinner",
      "description": "...",
      "files": [ { "path": "components/Spinner/Spinner.tsx", "content": "..." }, { "path": "components/Spinner/Spinner.module.css", "content": "..." } ]
    }
  ]
}
```

Notes:
- `required_dependencies`, `installation_commands`, `setup_instructions`, `critical_notes`, and `helper_components` are included conditionally based on the component (e.g., present for `Button`).
- The `text` field is JSON as a string; consumers should parse it to an object when needed.

### Legacy Tool Name Mapping

If you previously integrated with Andes-prefixed tool names, use this mapping:

- `andes-design-specifications` → `get_design_specifications`
- `andes-components-list` → `list_components`
- `andes-components` → `get_component`

Schema differences:
- `get_design_specifications`: `versions` is optional; there is no separate `version` tool.
- `list_components`: accepts `{ query?, tags?, packageFilter? }` (no `versions`).
- `get_component`: accepts `{ name, variant? }` instead of a CSV `componentName`.

## Development

This project was created with [create-xmcp-app](https://github.com/basementstudio/xmcp).

### Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

This will start the MCP server with the selected transport method.

### Project Structure

This project uses the structured approach where tools are automatically discovered from the `src/tools` directory. Each tool is defined in its own file with the following structure:

```typescript
import { z } from "zod";
import { type InferSchema } from "xmcp";

// Define the schema for tool parameters
export const schema = {
  a: z.number().describe("First number to add"),
  b: z.number().describe("Second number to add"),
};

// Define tool metadata
export const metadata = {
  name: "add",
  description: "Add two numbers together",
  annotations: {
    title: "Add Two Numbers",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
  },
};

// Tool implementation
export default async function add({ a, b }: InferSchema<typeof schema>) {
  return {
    content: [{ type: "text", text: String(a + b) }],
  };
}
```

### Adding New Tools

To add a new tool:

1. Create a new `.ts` file in the `src/tools` directory
2. Export a `schema` object defining the tool parameters using Zod
3. Export a `metadata` object with tool information
4. Export a default function that implements the tool logic

### Building for Production

To build your project for production:

```bash
npm run build
# or
yarn build
# or
pnpm build
```

This will compile your TypeScript code and output it to the `dist` directory.

### Running the Server

You can run the server for the transport built with:

- HTTP: `node dist/http.js`
- STDIO: `node dist/stdio.js`

Given the selected transport method, you will have a custom start script added to the `package.json` file.

For HTTP:

```bash
npm run start-http
# or
yarn start-http
# or
pnpm start-http
```

For STDIO:

```bash
npm run start-stdio
# or
yarn start-stdio
# or
pnpm start-stdio
```

## Learn More

- [xmcp Documentation](https://xmcp.dev/docs)