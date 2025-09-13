import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import { getComponent, findComponents } from "../utils/catalog";

// Define the schema for tool parameters
export const schema = {
  name: z.string().describe("Name of the component to retrieve"),
  variant: z.string().optional().describe("Specific variant of the component to retrieve"),
};

// Define tool metadata
export const metadata: ToolMetadata = {
  name: "get_component",
  description: "Get detailed information about a specific component including props, variants, and code",
  annotations: {
    title: "Get Component",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
  },
};

// Tool implementation
export default function getComponentTool({
  name,
  variant,
}: InferSchema<typeof schema>) {
  try {
    const components = findComponents(name);
    
    if (components.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              error: `Component "${name}" not found`,
            }, null, 2),
          },
        ],
      };
    }
    
    // Filter by variant if specified
    let filteredComponents = components;
    if (variant) {
      filteredComponents = components.filter(comp => 
        comp.variant === variant || (comp.variant === null && variant === 'base')
      );
      
      if (filteredComponents.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                error: `Component "${name}" with variant "${variant}" not found`,
              }, null, 2),
            },
          ],
        };
      }
    }
    
    // Return in Andes DS format - array of components with full specifications
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(filteredComponents, null, 2),
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
          }, null, 2),
        },
      ],
    };
  }
}
