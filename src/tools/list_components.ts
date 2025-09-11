import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import { findComponents } from "../utils/catalog";

// Define the schema for tool parameters
export const schema = {
  query: z.string().optional().describe("Search term to filter components by name or description"),
  tags: z.array(z.string()).optional().describe("Array of tags to filter components"),
  packageFilter: z.string().optional().describe("Package name to filter components by"),
};

// Define tool metadata
export const metadata: ToolMetadata = {
  name: "list_components",
  description: "List available components from the catalog with optional filtering",
  annotations: {
    title: "List Components",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
  },
};

// Tool implementation
export default function listComponents({
  query,
  tags,
  packageFilter,
}: InferSchema<typeof schema>) {
  try {
    const components = findComponents(query, tags, packageFilter);
    
    const items = components.map(comp => ({
      name: comp.name,
      description: comp.description,
      package: comp.package,
      version: comp.version,
      style: comp.style,
      tags: comp.tags,
    }));
    
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            items,
            total: items.length,
          }, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            error: error instanceof Error ? error.message : "Unknown error",
            items: [],
            total: 0,
          }, null, 2),
        },
      ],
    };
  }
}
