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
    
    // Group by component name and only show base variants for list
    const uniqueComponents = new Map();
    
    components.forEach(comp => {
      if (!uniqueComponents.has(comp.name) || comp.variant === null) {
        uniqueComponents.set(comp.name, {
          name: comp.name,
          description: comp.description,
          purpose: comp.description // Andes DS format uses 'purpose' field
        });
      }
    });
    
    // Convert to array format expected by Andes DS
    const items = Array.from(uniqueComponents.values());
    
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(items, null, 2),
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
          }, null, 2),
        },
      ],
    };
  }
}
