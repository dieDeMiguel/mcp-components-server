import { z } from "zod";
import type { ToolMetadata, InferSchema } from "xmcp";

// Define the schema for tool parameters
export const schema = {
  response: z.object({
    components: z.array(z.any()).optional(),
    helper_components: z.array(z.any()).optional(),
    required_dependencies: z.record(z.string()).optional(),
    package_json_dependencies: z.record(z.string()).optional(),
  }).describe("MCP component response to validate"),
};

// Define tool metadata
export const metadata: ToolMetadata = {
  name: "validate_component_response",
  description: "Validates an MCP component response to ensure all dependencies and helper components are properly included",
  annotations: {
    title: "Validate Component Response",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
  },
};

// Validation function
export function validateComponentResponse(response: {
  components?: Array<{ code?: string; import?: string }>;
  helper_components?: Array<{ name: string; files?: Array<{ path: string }> }>;
  required_dependencies?: Record<string, string>;
  package_json_dependencies?: Record<string, string>;
  setup_instructions?: string[];
  critical_notes?: string[];
}): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const mainComponent = response.components?.[0];
  if (mainComponent?.code || mainComponent?.import) {
    const componentCode = mainComponent.code || mainComponent.import || '';
    
    // Check for Spinner imports
    if (componentCode.includes('../Spinner/Spinner') || componentCode.includes('Spinner')) {
      const hasSpinnerHelper = response.helper_components?.some((h) => h.name === 'Spinner');
      if (!hasSpinnerHelper) {
        errors.push('Component imports Spinner but helper_components missing Spinner');
      }
    }
    
    // Check for clsx usage
    if (componentCode.includes('clsx')) {
      const hasClsxDep = response.required_dependencies?.clsx || response.package_json_dependencies?.clsx;
      if (!hasClsxDep) {
        errors.push('Component uses clsx but dependencies missing clsx');
      }
    }
    
    // Check for other relative imports
    const relativeImports = componentCode.match(/import.*from\s+['"]\.\.\/([^'"]+)['"]/g);
    if (relativeImports) {
      relativeImports.forEach((importStr: string) => {
        const match = importStr.match(/['"]\.\.\/([^'"]+)['"]/);
        if (match) {
          const importPath = match[1];
          const componentName = importPath.split('/')[0];
          const hasHelper = response.helper_components?.some((h) => 
            h.name === componentName || h.files?.some((f) => f.path.includes(componentName))
          );
          if (!hasHelper) {
            warnings.push(`Component imports '${importPath}' but no helper component found for '${componentName}'`);
          }
        }
      });
    }
  }
  
  // Check if setup instructions exist for complex components
  if (response.helper_components?.length > 0 && !response.setup_instructions) {
    warnings.push('Component has helper components but no setup_instructions provided');
  }
  
  // Check if critical notes exist for components with dependencies
  if ((response.required_dependencies || response.helper_components?.length > 0) && !response.critical_notes) {
    warnings.push('Component has dependencies/helpers but no critical_notes provided');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// Tool implementation
export default function validateComponentResponseTool({
  response,
}: InferSchema<typeof schema>) {
  try {
    const validation = validateComponentResponse(response);
    
    const result = {
      validation_result: {
        is_valid: validation.isValid,
        status: validation.isValid ? "PASSED" : "FAILED",
        errors: validation.errors,
        warnings: validation.warnings,
        summary: validation.isValid 
          ? "Component response is valid and should work without errors"
          : `Component response has ${validation.errors.length} critical errors that will cause runtime failures`
      },
      recommendations: validation.isValid ? [] : [
        "Fix all errors before using this component",
        "Ensure all imported files are created",
        "Verify all dependencies are installed",
        "Follow the setup_instructions exactly"
      ]
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
            validation_result: {
              is_valid: false,
              status: "ERROR",
              errors: [`Validation failed: ${error instanceof Error ? error.message : "Unknown error"}`],
              warnings: [],
              summary: "Could not validate component response due to error"
            }
          }, null, 2),
        },
      ],
    };
  }
}
