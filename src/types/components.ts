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
  package: string;
  version: string;
  description: string;
  language: string;
  style: ComponentStyle;
  props: ComponentProp[];
  variants: ComponentVariant[];
  code: string;
  assets: string[];
  tags: string[];
  dependencies: string[];
}

export interface ComponentCatalog {
  version: string;
  components: ComponentSpec[];
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
