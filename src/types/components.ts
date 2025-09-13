export interface ComponentProp {
  name: string;
  type: string;
  required: boolean;
  default?: any;
  description: string;
}

export interface ComponentVariant {
  name: string;
  description: string;
  props: Record<string, any>;
}

export interface ComponentStyle {
  type: string;
  entry: string;
}

export interface ComponentSpec {
  name: string;
  variant: string | null;
  description: string;
  import: string;
  styles: string[];
  props: ComponentProp[];
  size_specifications?: any;
  notes?: string[];
  examples?: Array<{
    title: string;
    code: string;
  }>;
}

export interface ComponentCatalog {
  components: ComponentSpec[];
  metadata: {
    version: string;
    lastUpdated: string;
    totalComponents: number;
    packages: string[];
    tags: string[];
  };
}

export interface ListComponentsRequest {
  query?: string;
  tags?: string[];
  packageFilter?: string;
}

export interface ListComponentsResponse {
  items: Array<{
    name: string;
    description: string;
    package: string;
    version: string;
    style: ComponentStyle;
    tags: string[];
  }>;
  total: number;
}

export interface GetComponentRequest {
  name: string;
  variant?: string;
}

export interface GetComponentResponse {
  component: ComponentSpec;
}
