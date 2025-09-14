// MCP Component Response Types

export interface ComponentResponse {
  components: Array<{
    name: string;
    variant?: string | null;
    description: string;
    import: string;
    styles: string[];
    props: Array<{
      name: string;
      description: string;
      type: string;
      default: string;
      required: boolean;
    }>;
    size_specifications?: Record<string, any>;
    notes?: string[];
    data_attributes?: string[];
    examples?: Array<{
      title: string;
      code: string;
    }>;
  }>;
  
  // Dependencies and Installation
  required_dependencies?: Record<string, string>;
  package_json_dependencies?: Record<string, string>;
  installation_commands?: string[];
  
  // Setup Instructions (CRITICAL)
  setup_instructions?: string[];
  critical_notes?: string[];
  
  // Helper Components
  helper_components?: Array<{
    name: string;
    description: string;
    files: Array<{
      path: string;
      content: string;
    }>;
  }>;
  
  // Metadata
  metadata?: {
    version?: string;
    lastUpdated?: string;
    tags?: string[];
  };
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  summary?: string;
}

export interface MCPToolResponse {
  content: Array<{
    type: "text";
    text: string;
  }>;
}
