import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import { getComponent } from "../utils/catalog";

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
    const component = getComponent(name);
    
    if (!component) {
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
    
    // Format for VCP compatibility - normalized component structure
    const result = {
      component: {
        name: component.name,
        package: component.package,
        version: component.version,
        description: component.description,
        language: component.language,
        style: component.style,
        props: component.props,
        ...(component.variants && { variants: component.variants }),
        code: component.code,
        ...(variant && { selectedVariant: variant }),
      },
    };
    
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
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
