import { z } from "zod";
import type { ToolMetadata, InferSchema } from "xmcp";
import { findComponents } from "../utils/catalog";
import { validateComponentResponse } from "./validate_component_response";

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
    
    // Check if we need to include helper components
    const response: {
      components: typeof filteredComponents;
      required_dependencies?: Record<string, string>;
      package_json_dependencies?: Record<string, string>;
      installation_commands?: string[];
      setup_instructions?: string[];
      critical_notes?: string[];
      helper_components?: Array<{
        name: string;
        description: string;
        files: Array<{
          path: string;
          content: string;
        }>;
      }>;
    } = {
      components: filteredComponents,
    };

    // Add helper components and dependencies if Button is requested
    if (name.toLowerCase() === 'button') {
      response.required_dependencies = {
        "clsx": "^2.0.0"
      };
      
      response.package_json_dependencies = {
        "clsx": "^2.0.0"
      };
      
      response.installation_commands = [
        "pnpm add clsx",
        "npm install clsx", 
        "yarn add clsx"
      ];
      
      response.setup_instructions = [
        "1. MANDATORY: Install clsx dependency: pnpm add clsx",
        "2. MANDATORY: Create all helper components listed in helper_components section",
        "3. Verify all imports in the main component have corresponding files",
        "4. Only after completing steps 1-3, the component will work without errors"
      ];

      response.critical_notes = [
        "WARNING: This component imports '../Spinner/Spinner' - you MUST create Spinner.tsx and Spinner.module.css",
        "WARNING: This component uses 'clsx' - you MUST install it with: pnpm add clsx",
        "WARNING: Missing any of these files will cause 'Module not found' errors"
      ];
      
      response.helper_components = [
        {
          name: "Spinner",
          description: "Loading spinner component for buttons and other loading states",
          files: [
            {
              path: "components/Spinner/Spinner.tsx",
              content: `import React from 'react';
import styles from './Spinner.module.css';

interface SpinnerProps {
  srAnnouncement?: string;
  size?: 'small' | 'medium' | 'large';
}

const Spinner: React.FC<SpinnerProps> = ({ 
  srAnnouncement = "Loading...", 
  size = 'medium' 
}) => {
  return (
    <div className={styles.spinner} data-size={size}>
      <div className={styles.circle}></div>
      {srAnnouncement && (
        <span className={styles.srOnly}>{srAnnouncement}</span>
      )}
    </div>
  );
};

Spinner.displayName = 'Spinner';
export default Spinner;`
            },
            {
              path: "components/Spinner/Spinner.module.css",
              content: `.spinner {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.circle {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner[data-size="small"] .circle {
  width: 12px;
  height: 12px;
  border-width: 1.5px;
}

.spinner[data-size="large"] .circle {
  width: 20px;
  height: 20px;
  border-width: 2.5px;
}

.srOnly {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}`
            }
          ]
        }
      ];
    }

    // Validate response before returning
    const validation = validateComponentResponse(response);
    if (!validation.isValid) {
      console.error('Component validation failed:', validation.errors);
      // Add validation errors to critical_notes
      if (response.critical_notes) {
        response.critical_notes.push(
          "VALIDATION ERRORS DETECTED:",
          ...validation.errors.map(err => `ERROR: ${err}`)
        );
      }
    }
    if (validation.warnings.length > 0) {
      console.warn('Component validation warnings:', validation.warnings);
      // Add validation warnings to critical_notes
      if (response.critical_notes) {
        response.critical_notes.push(
          "VALIDATION WARNINGS:",
          ...validation.warnings.map(warn => `WARNING: ${warn}`)
        );
      }
    }

    // Return in Andes DS format with helper components when needed
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(response, null, 2),
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
