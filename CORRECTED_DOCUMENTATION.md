# Andes DS MCP Server - Available Tools

This document provides the complete specification for all tools available in the Andes Design System MCP Server.

---

## Tool 1: get_design_specifications

### Tool Definition

```typescript
export const designSpecificationsTool: Tool = {
  name: 'get_design_specifications',
  description:
    'Contains the foundational rules and implementation guidelines for generating interfaces aligned with the Mercado Libre user experience and brand language, including details on dependencies, helper components, and code generation best practices.',
  annotations: {
    title: 'Get Design System Implementation Specifications',
  },
  inputSchema: {
    type: 'object',
    properties: {
      versions: {
        type: 'object',
        description:
          'Package versions. If not provided, defaults to latest.',
        properties: {
          andes: {
            type: 'string',
            description:
              'Semver version of package "@andes/[component]" (format: "latest", "8.0.0", "9.0.0")',
            default: 'latest',
          },
        },
      },
    },
    required: [],
  },
};
```

### Tool Response (extract)

```markdown
# Specification for an LLM to Generate Components with the Look & Feel of Mercado Libre

> Compatible with Andes UI version: latest

> This document defines the foundational rules and implementation guidelines that the LLM must follow when generating interfaces aligned with the Mercado Libre user experience and brand language.

## Objective

Generate functional, production-ready React components that work immediately without additional setup or missing dependencies.

## MANDATORY REQUIREMENTS

### Dependencies and Imports

- **MANDATORY**: `clsx` MUST ALWAYS be installed - All components use `clsx` for conditional class names
- **MANDATORY**: Include `clsx` in package.json dependencies for every project
- **CONDITIONAL**: Only install other dependencies when MCP response includes `required_dependencies` or `package_json_dependencies`
- **CONDITIONAL**: Only create helper files when MCP response includes `helper_components` and they are actually needed by the component

### CRITICAL: Import Statement Rules

**ALWAYS follow these EXACT import patterns to avoid "Module not found" errors:**

#### 1. React Imports (MANDATORY)
```typescript
import React from 'react';
// For TypeScript projects, also import types:
import type { ReactNode, MouseEvent } from 'react';
```

#### 2. clsx Import (MANDATORY when using clsx)
```typescript
import clsx from 'clsx';
// NOT: import { clsx } from 'clsx'; ❌
// NOT: import * as clsx from 'clsx'; ❌
```

#### 3. Helper Component Imports (CRITICAL)
When MCP response includes helper_components, use EXACT paths:
```typescript
// If helper component path is "components/Spinner/Spinner.tsx"
import Spinner from '../Spinner/Spinner';
// NOT: import { Spinner } from '../Spinner/Spinner'; ❌
// NOT: import Spinner from '../Spinner'; ❌
```

### Processing MCP Response

When receiving a component from MCP, follow this order:

1. **MANDATORY**: Always install `clsx` first - `pnpm add clsx`
2. **CONDITIONAL**: Check for `required_dependencies` → Only install if present and needed
3. **CONDITIONAL**: Check for `helper_components` → Only create if present and component actually uses them
4. **Create main component** → Use the component specifications
5. **Follow `setup_instructions`** → Complete any additional setup steps

...
```

---

## Tool 2: list_components

### Tool Definition

```typescript
export const componentsListTool: Tool = {
  name: 'list_components',
  description:
    'List available components from the catalog with optional filtering by name, description, tags, or package.',
  annotations: {
    title: 'List Components with Filtering',
  },
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Search term to filter components by name or description',
      },
      tags: {
        type: 'array',
        items: {
          type: 'string',
        },
        description: 'Array of tags to filter components',
      },
      packageFilter: {
        type: 'string',
        description: 'Package name to filter components by',
      },
    },
    required: [],
  },
};
```

### Tool Response

Returns an array of simplified component objects. Each component includes:

```json
[
  {
    "name": "Badge",
    "description": "Small indicator for statuses, counts, or new content.",
    "purpose": "Used inline or over other elements to highlight status or notifications."
  },
  {
    "name": "Button",
    "description": "Action trigger with various visual states, maintaining brand identity.",
    "purpose": "Initiates actions or submits forms."
  }
]
```

**Notes:**
- If multiple variants exist for a component (e.g., Button, ButtonText, DropdownButton), only the base variant is shown in the list
- Use the `get_component` tool to retrieve detailed specifications for a specific component
- All filter parameters are optional; omit them to retrieve all components

---

## Tool 3: get_component

### Tool Definition

```typescript
export const componentsTool: Tool = {
  name: 'get_component',
  description:
    'Retrieves the complete specification for a single component in the Andes UI Design System, including props, variants, code examples, and any required dependencies or helper components.',
  annotations: {
    title: 'Get Component Specification',
  },
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description:
          'The component name to retrieve (e.g., "Button", "Badge", "Card")',
      },
      variant: {
        type: 'string',
        description:
          'Optional: Specific variant of the component to retrieve (e.g., "ButtonText", "DropdownButton"). If not provided, all variants are returned.',
      },
    },
    required: ['name'],
  },
};
```

### Tool Response Structure

The response is a JSON object with the following structure:

```typescript
{
  // Array of component specifications (may include multiple variants)
  components: Array<ComponentSpec>,
  
  // CONDITIONAL: Only included for components that require dependencies (e.g., Button)
  required_dependencies?: {
    "clsx": "^2.0.0"
  },
  
  // CONDITIONAL: Dependencies formatted for package.json
  package_json_dependencies?: {
    "clsx": "^2.0.0"
  },
  
  // CONDITIONAL: Installation commands for different package managers
  installation_commands?: [
    "pnpm add clsx",
    "npm install clsx",
    "yarn add clsx"
  ],
  
  // CONDITIONAL: Step-by-step setup instructions
  setup_instructions?: [
    "1. MANDATORY: Install clsx dependency: pnpm add clsx",
    "2. MANDATORY: Create all helper components listed in helper_components section",
    "3. Verify all imports in the main component have corresponding files",
    "4. Only after completing steps 1-3, the component will work without errors"
  ],
  
  // CONDITIONAL: Critical warnings and import requirements
  critical_notes?: [
    "CRITICAL IMPORT REQUIREMENTS:",
    "1. This component imports '../Spinner/Spinner' - you MUST create Spinner.tsx and Spinner.module.css",
    "2. This component uses 'clsx' - you MUST install it with: pnpm add clsx",
    "WARNING: Missing any of these files or wrong import syntax will cause 'Module not found' errors"
  ],
  
  // CONDITIONAL: Helper components with complete implementation code
  helper_components?: [
    {
      name: "Spinner",
      description: "Loading spinner component for buttons and other loading states",
      files: [
        {
          path: "components/Spinner/Spinner.tsx",
          content: "// Complete TypeScript component code..."
        },
        {
          path: "components/Spinner/Spinner.module.css",
          content: "/* Complete CSS module code... */"
        }
      ]
    }
  ]
}
```

### Tool Response - Full Example (Button Component)

```json
{
  "components": [
    {
      "name": "Button",
      "variant": null,
      "description": "Base button component with support for multiple hierarchies, sizes, loading states, and full accessibility features. Supports text-only buttons and buttons with icons.",
      "import": "import { Button } from '@andes/button';",
      "styles": ["@import '@andes/button/index';"],
      "props": [
        {
          "name": "children",
          "description": "Custom content - text or complex content including icons",
          "type": "ReactNode",
          "default": "undefined",
          "required": true
        },
        {
          "name": "backgroundType",
          "description": "Determines the background type where the button is placed, used when placed over colored surfaces",
          "type": "'default' | 'complexBackground'",
          "default": "'default'",
          "required": false
        },
        {
          "name": "className",
          "description": "Custom CSS class for additional styling",
          "type": "string",
          "default": "undefined",
          "required": false
        },
        {
          "name": "disabled",
          "description": "Whether the button should be disabled",
          "type": "boolean",
          "default": "false",
          "required": false
        },
        {
          "name": "fullWidth",
          "description": "Whether the button should use full available width",
          "type": "boolean",
          "default": "false",
          "required": false
        },
        {
          "name": "hierarchy",
          "description": "Style hierarchy of the button",
          "type": "'loud' | 'quiet' | 'mute' | 'transparent'",
          "default": "'loud'",
          "required": false
        },
        {
          "name": "href",
          "description": "Location where to point the button when used as link",
          "type": "string",
          "default": "undefined",
          "required": false
        },
        {
          "name": "id",
          "description": "Unique identifier for the button",
          "type": "string",
          "default": "undefined",
          "required": false
        },
        {
          "name": "loading",
          "description": "Shows loading state with progress indicator circular component",
          "type": "boolean",
          "default": "false",
          "required": false
        },
        {
          "name": "onClick",
          "description": "Callback function called when button is clicked",
          "type": "function(event)",
          "default": "undefined",
          "required": false
        },
        {
          "name": "size",
          "description": "Size of the button element",
          "type": "'small' | 'medium' | 'large'",
          "default": "'large'",
          "required": false
        },
        {
          "name": "srAnnouncement",
          "description": "Screen reader label for spinner when loading is active",
          "type": "string",
          "default": "undefined",
          "required": false
        },
        {
          "name": "srLabel",
          "description": "Accessible label for screen readers",
          "type": "string",
          "default": "undefined",
          "required": false
        },
        {
          "name": "type",
          "description": "Type attribute for button native element",
          "type": "'button' | 'submit' | 'reset' | string",
          "default": "'button'",
          "required": false
        }
      ],
      "size_specifications": {
        "component_heights": {
          "small": "24px",
          "medium": "32px",
          "large": "48px"
        },
        "component_widths": {
          "default": "auto",
          "fullWidth": "100%"
        },
        "padding": {
          "small": "0 8px (andes-spacing-8)",
          "medium": "0 12px (andes-spacing-12)",
          "large": "0 24px (andes-spacing-24)"
        },
        "typography_tokens": {
          "small": "body-small-emphasis (12px font, semibold weight)",
          "medium": "body-medium-emphasis (14px font, semibold weight)",
          "large": "body-large-emphasis (16px font, semibold weight)"
        },
        "border_radius": {
          "small": "4px (border-radius-4)",
          "medium": "5px (border-radius-5)",
          "large": "6px (border-radius-6)"
        },
        "spacing": {
          "icon_text_spacing_large": "12px (button-spacing-12)",
          "icon_text_spacing_medium": "8px (button-spacing-8)",
          "icon_text_spacing_small": "8px (button-spacing-8)"
        },
        "icon_sizes": {
          "recommended": "18px (button-icon-size)"
        },
        "layout": {
          "display": "inline-block",
          "flex_direction": "row",
          "align_items": "center",
          "justify_content": "center",
          "direction": "icon left, text center, or text only"
        },
        "colors": {
          "states": {
            "idle": {
              "loud": "blue-500 background, white text",
              "quiet": "blue-150 background, blue-500 text",
              "mute": "transparent background, blue-500 text"
            },
            "hover": {
              "loud": "blue-600 background, white text",
              "quiet": "blue-200 background, blue-500 text",
              "mute": "blue-100 background, blue-500 text"
            },
            "active": {
              "loud": "blue-700 background, white text",
              "quiet": "blue-300 background, blue-500 text",
              "mute": "blue-200 background, blue-500 text"
            },
            "disabled": {
              "loud": "gray-100 background, disabled text color",
              "quiet": "gray-100 background, disabled text color",
              "mute": "transparent background, disabled text color"
            }
          },
          "variants": {
            "complexBackground": "Darker variants for use on colored backgrounds with adjusted opacity"
          }
        },
        "breakpoints": {}
      },
      "notes": [
        "Uses semibold font weight (font-weight-semibold) for all sizes",
        "Supports loading state with animated spinner overlay",
        "Box-shadow focus ring with blue-300 color for accessibility",
        "Smooth transitions (0.18s ease-out) for background and color changes",
        "Icon size automatically constrained to 18px maximum",
        "Text truncation with ellipsis for overflow content",
        "Keyboard navigation and screen reader support included",
        "Complex background variants provide better contrast on colored surfaces",
        "Loading state includes translateIn/translateOut animations",
        "Border transparent for all states to maintain consistent sizing"
      ],
      "data_attributes": [
        "aria-disabled for disabled state",
        "role and accessibility attributes for screen readers"
      ],
      "examples": [
        {
          "title": "Basic Button",
          "code": "import { Button } from '@andes/button';\n\n<Button hierarchy=\"loud\">Sign up</Button>"
        },
        {
          "title": "Button with Icon",
          "code": "import { Button, ButtonText } from '@andes/button';\nimport Attach24 from '@andes/icons/Attach24';\n\n<Button>\n  <Attach24 color=\"white\" />\n  <ButtonText>Attach document</ButtonText>\n</Button>"
        },
        {
          "title": "Loading Button",
          "code": "import { Button } from '@andes/button';\n\n<Button loading={loading} srAnnouncement=\"Processing...\">\n  Sign Up\n</Button>"
        }
      ]
    },
    {
      "name": "Button",
      "variant": "ButtonText",
      "description": "Helper component for text content within buttons, especially when combining with icons or other elements.",
      "import": "import { ButtonText } from '@andes/button';",
      "styles": ["@import '@andes/button/index';"],
      "props": [
        {
          "name": "children",
          "description": "Text content for the button",
          "type": "ReactNode",
          "default": "undefined",
          "required": true
        }
      ],
      "size_specifications": {
        "typography_tokens": {
          "default": "Inherits from parent button size"
        },
        "layout": {
          "display": "block",
          "text_overflow": "ellipsis",
          "white_space": "nowrap",
          "direction": "Handles text truncation and spacing with adjacent icons"
        }
      },
      "notes": [
        "Automatically handles spacing when used with icons (12px margin for large, 8px for medium/small)",
        "Provides text overflow ellipsis for long content",
        "Flex: 1 to take available space in button layout"
      ],
      "data_attributes": [],
      "examples": [
        {
          "title": "ButtonText with Icon",
          "code": "import { Button, ButtonText } from '@andes/button';\n\n<Button>\n  <IconComponent />\n  <ButtonText>Button Label</ButtonText>\n</Button>"
        }
      ]
    },
    {
      "name": "Button",
      "variant": "DropdownButton",
      "description": "Button component that opens a dropdown menu with list items. Supports keyboard navigation and accessibility features.",
      "import": "import { DropdownButton } from '@andes/button';",
      "styles": ["@import '@andes/button/index';", "@import '@andes/list/base';", "@import '@andes/floating-menu/base';"],
      "props": [
        {
          "name": "children",
          "description": "Button text content",
          "type": "string",
          "default": "undefined",
          "required": false
        },
        {
          "name": "listContent",
          "description": "Array of menu items with title, description, href, onClick properties",
          "type": "Array<{title: string, description?: string, href?: string, onClick?: function}>",
          "default": "undefined",
          "required": true
        },
        {
          "name": "className",
          "description": "Custom CSS class",
          "type": "string",
          "default": "undefined",
          "required": false
        },
        {
          "name": "dialogSrLabel",
          "description": "Accessible label for the dropdown menu dialog",
          "type": "string",
          "default": "undefined",
          "required": false
        },
        {
          "name": "disabled",
          "description": "Whether the dropdown button should be disabled",
          "type": "boolean",
          "default": "false",
          "required": false
        },
        {
          "name": "fullWidth",
          "description": "Whether button should use full available width",
          "type": "boolean",
          "default": "false",
          "required": false
        },
        {
          "name": "hierarchy",
          "description": "Button style hierarchy",
          "type": "'loud' | 'quiet'",
          "default": "'loud'",
          "required": false
        },
        {
          "name": "id",
          "description": "Unique identifier",
          "type": "string",
          "default": "undefined",
          "required": false
        },
        {
          "name": "menuWidth",
          "description": "Width of the dropdown menu",
          "type": "number | string",
          "default": "undefined",
          "required": false
        },
        {
          "name": "side",
          "description": "Menu placement relative to button",
          "type": "'bottom' | 'bottom-start' | 'bottom-end' | 'top' | 'top-start' | 'top-end' | 'left' | 'left-start' | 'left-end' | 'right' | 'right-start' | 'right-end'",
          "default": "'bottom'",
          "required": false
        },
        {
          "name": "size",
          "description": "Size of the dropdown button",
          "type": "'medium' | 'large'",
          "default": "'large'",
          "required": false
        },
        {
          "name": "srLabel",
          "description": "Screen reader label for the trigger button",
          "type": "string",
          "default": "undefined",
          "required": false
        }
      ],
      "size_specifications": {
        "component_heights": {
          "medium": "32px",
          "large": "48px"
        },
        "layout": {
          "display": "inline-block",
          "chevron_icon": "Includes dropdown chevron indicator",
          "direction": "Button with chevron icon, opens floating menu below"
        }
      },
      "notes": [
        "Integrates with floating-menu component for positioning",
        "Supports keyboard navigation (Arrow keys, Enter, Escape)",
        "Menu items can have href links or onClick handlers",
        "Accessible menu dialog with proper ARIA attributes",
        "Only supports medium and large sizes"
      ],
      "data_attributes": [],
      "examples": [
        {
          "title": "Basic Dropdown",
          "code": "import { DropdownButton } from '@andes/button';\n\nconst options = [\n  { title: 'Option 1', onClick: () => {} },\n  { title: 'Option 2', href: '/link' }\n];\n\n<DropdownButton listContent={options}>Edit</DropdownButton>"
        }
      ]
    },
    {
      "name": "Button",
      "variant": "SplitButton",
      "description": "Button component with a primary action and a secondary dropdown menu for additional actions.",
      "import": "import { SplitButton } from '@andes/button';",
      "styles": ["@import '@andes/button/index';", "@import '@andes/list/base';", "@import '@andes/floating-menu/base';"],
      "props": [
        {
          "name": "children",
          "description": "Primary button text content",
          "type": "string",
          "default": "undefined",
          "required": true
        },
        {
          "name": "listContent",
          "description": "Array of secondary menu items",
          "type": "Array<{title: string, href?: string, onClick?: function}>",
          "default": "undefined",
          "required": true
        },
        {
          "name": "className",
          "description": "Custom CSS class",
          "type": "string",
          "default": "undefined",
          "required": false
        },
        {
          "name": "dialogSrLabel",
          "description": "Accessible label for menu dialog",
          "type": "string",
          "default": "undefined",
          "required": false
        },
        {
          "name": "hierarchy",
          "description": "Button style hierarchy",
          "type": "'loud' | 'quiet'",
          "default": "'loud'",
          "required": false
        },
        {
          "name": "id",
          "description": "Unique identifier",
          "type": "string",
          "default": "undefined",
          "required": false
        },
        {
          "name": "onClick",
          "description": "Callback function for primary button action",
          "type": "function(event)",
          "default": "undefined",
          "required": false
        },
        {
          "name": "side",
          "description": "Menu placement relative to button",
          "type": "'bottom' | 'bottomRight' | 'top' | 'topRight'",
          "default": "'bottomRight'",
          "required": false
        },
        {
          "name": "srLabel",
          "description": "Screen reader label for the trigger button",
          "type": "string",
          "default": "undefined",
          "required": false
        }
      ],
      "size_specifications": {
        "layout": {
          "display": "inline-flex",
          "structure": "Primary button + separator + chevron dropdown",
          "direction": "Two-part button with primary action left, dropdown right"
        }
      },
      "notes": [
        "Combines primary action with secondary menu options",
        "Visual separator between main button and dropdown trigger",
        "Supports both loud and quiet hierarchies",
        "Menu positioning optimized for split button layout"
      ],
      "data_attributes": [],
      "examples": [
        {
          "title": "Split Button",
          "code": "import { SplitButton } from '@andes/button';\n\nconst options = [\n  { title: 'Secondary Action 1', onClick: () => {} },\n  { title: 'Secondary Action 2', onClick: () => {} }\n];\n\n<SplitButton listContent={options} onClick={() => console.log('Primary action')}>Primary Action</SplitButton>"
        }
      ]
    },
    {
      "name": "Button",
      "variant": "ProgressButton",
      "description": "Button component with built-in progress states for multi-step operations, showing loading and completion states.",
      "import": "import { ProgressButton } from '@andes/button';",
      "styles": ["@import '@andes/button/index';"],
      "props": [
        {
          "name": "children",
          "description": "Button content for default state",
          "type": "ReactNode",
          "default": "undefined",
          "required": true
        },
        {
          "name": "className",
          "description": "Custom CSS class",
          "type": "string",
          "default": "undefined",
          "required": false
        },
        {
          "name": "hierarchy",
          "description": "Button style hierarchy",
          "type": "'loud' | 'quiet'",
          "default": "'loud'",
          "required": false
        },
        {
          "name": "id",
          "description": "Unique identifier",
          "type": "string",
          "default": "undefined",
          "required": false
        },
        {
          "name": "loading",
          "description": "Shows progress state with custom label",
          "type": "boolean",
          "default": "false",
          "required": false
        },
        {
          "name": "onClick",
          "description": "Callback function called when button is clicked",
          "type": "function(event)",
          "default": "undefined",
          "required": false
        },
        {
          "name": "progressLabel",
          "description": "Custom content when loading is active",
          "type": "ReactNode",
          "default": "undefined",
          "required": false
        },
        {
          "name": "progressSrAnnouncement",
          "description": "Screen reader announcement for progress changes",
          "type": "string",
          "default": "undefined",
          "required": false
        },
        {
          "name": "timeout",
          "description": "Timeout in milliseconds to delay finished state",
          "type": "number",
          "default": "1000",
          "required": false
        }
      ],
      "size_specifications": {
        "layout": {
          "display": "block",
          "states": "default → loading → finished",
          "direction": "Full-width button with state transitions"
        }
      },
      "notes": [
        "Designed for full-width usage in forms and processes",
        "Automatic state management with timeout control",
        "Custom progress labels for better user feedback",
        "Accessibility announcements for state changes",
        "Visual transitions between states with animations"
      ],
      "data_attributes": [
        "aria-disabled for disabled state",
        "aria-live for progress announcements",
        "data-progress-state for current state"
      ],
      "examples": [
        {
          "title": "Progress Button",
          "code": "import { ProgressButton } from '@andes/button';\n\n<ProgressButton\n  loading={isLoading}\n  progressLabel=\"Processing...\"\n  progressSrAnnouncement=\"Please wait, processing your request\"\n  onClick={handleSubmit}\n>\n  Submit\n</ProgressButton>"
        }
      ]
    },
    {
      "name": "Button",
      "variant": "FloatingActionButton",
      "description": "Circular floating action button with icon, supporting expanded and collapsed states for primary actions.",
      "import": "import { FloatingActionButton } from '@andes/button';",
      "styles": ["@import '@andes/button/index';"],
      "props": [
        {
          "name": "icon",
          "description": "Icon element to display (img or svg)",
          "type": "ReactElement",
          "default": "undefined",
          "required": true
        },
        {
          "name": "behavior",
          "description": "Controls button expansion state",
          "type": "'expanded' | 'collapsed'",
          "default": "'expanded'",
          "required": false
        },
        {
          "name": "className",
          "description": "Custom CSS class",
          "type": "string",
          "default": "undefined",
          "required": false
        },
        {
          "name": "hierarchy",
          "description": "Button style hierarchy",
          "type": "'loud' | 'quiet'",
          "default": "'loud'",
          "required": false
        },
        {
          "name": "id",
          "description": "Unique identifier",
          "type": "string",
          "default": "undefined",
          "required": false
        },
        {
          "name": "onClick",
          "description": "Click handler function",
          "type": "function(event)",
          "default": "undefined",
          "required": false
        },
        {
          "name": "size",
          "description": "Size of the floating action button",
          "type": "'small' | 'large'",
          "default": "'large'",
          "required": false
        },
        {
          "name": "text",
          "description": "Text label for expanded state",
          "type": "string",
          "default": "undefined",
          "required": false
        },
        {
          "name": "srLabel",
          "description": "Screen reader label for accessibility",
          "type": "string",
          "default": "undefined",
          "required": false
        }
      ],
      "size_specifications": {
        "component_heights": {
          "small": "32px",
          "large": "48px"
        },
        "component_widths": {
          "collapsed_small": "32px",
          "collapsed_large": "48px",
          "expanded": "auto (based on text + padding)"
        },
        "border_radius": {
          "small": "16px (andes-button-border-radius-sm)",
          "large": "24px (andes-button-border-radius-lg)"
        },
        "padding": {
          "default": "14px (andes-button-padding-lg)"
        },
        "layout": {
          "display": "inline-flex",
          "align_items": "center",
          "justify_content": "center",
          "direction": "icon left, text right (when expanded)"
        }
      },
      "notes": [
        "Circular shape with high border radius for floating appearance",
        "Supports both icon-only (collapsed) and icon+text (expanded) states",
        "Typically positioned fixed for floating behavior",
        "Only supports small and large sizes (no medium)",
        "Icon is always required, text is optional for expanded state"
      ],
      "data_attributes": [
        "aria-label for accessibility when no text is provided",
        "data-behavior for expanded/collapsed state"
      ],
      "examples": [
        {
          "title": "Floating Action Button (Expanded)",
          "code": "import { FloatingActionButton } from '@andes/button';\nimport Add16 from '@andes/icons/Add16';\n\n<FloatingActionButton\n  icon={<Add16 />}\n  text=\"Add item\"\n  behavior=\"expanded\"\n  onClick={() => console.log('Add clicked')}\n/>"
        },
        {
          "title": "Floating Action Button (Collapsed)",
          "code": "import { FloatingActionButton } from '@andes/button';\nimport Add16 from '@andes/icons/Add16';\n\n<FloatingActionButton\n  icon={<Add16 />}\n  behavior=\"collapsed\"\n  srLabel=\"Add new item\"\n  onClick={() => console.log('Add clicked')}\n/>"
        }
      ]
    }
  ],
  "required_dependencies": {
    "clsx": "^2.0.0"
  },
  "package_json_dependencies": {
    "clsx": "^2.0.0"
  },
  "installation_commands": [
    "pnpm add clsx",
    "npm install clsx",
    "yarn add clsx"
  ],
  "setup_instructions": [
    "1. MANDATORY: Install clsx dependency: pnpm add clsx",
    "2. MANDATORY: Create all helper components listed in helper_components section",
    "3. Verify all imports in the main component have corresponding files",
    "4. Only after completing steps 1-3, the component will work without errors"
  ],
  "critical_notes": [
    "CRITICAL IMPORT REQUIREMENTS:",
    "1. This component imports '../Spinner/Spinner' - you MUST create Spinner.tsx and Spinner.module.css",
    "2. This component uses 'clsx' - you MUST install it with: pnpm add clsx",
    "3. Use EXACT import syntax: import clsx from 'clsx'; (NOT named import)",
    "4. Use EXACT import syntax: import Spinner from '../Spinner/Spinner'; (NOT named import)",
    "5. CSS modules: import styles from './Component.module.css'; (default import)",
    "WARNING: Missing any of these files or wrong import syntax will cause 'Module not found' errors"
  ],
  "helper_components": [
    {
      "name": "Spinner",
      "description": "Loading spinner component for buttons and other loading states",
      "files": [
        {
          "path": "components/Spinner/Spinner.tsx",
          "content": "// CRITICAL: Use exact import syntax - default imports only\nimport React from 'react';\nimport styles from './Spinner.module.css';\n\ninterface SpinnerProps {\n  srAnnouncement?: string;\n  size?: 'small' | 'medium' | 'large';\n}\n\nconst Spinner: React.FC<SpinnerProps> = ({ \n  srAnnouncement = \"Loading...\", \n  size = 'medium' \n}) => {\n  return (\n    <div className={styles.spinner} data-size={size}>\n      <div className={styles.circle}></div>\n      {srAnnouncement && (\n        <span className={styles.srOnly}>{srAnnouncement}</span>\n      )}\n    </div>\n  );\n};\n\nSpinner.displayName = 'Spinner';\n// CRITICAL: Use default export (NOT named export)\nexport default Spinner;"
        },
        {
          "path": "components/Spinner/Spinner.module.css",
          "content": ".spinner {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n}\n\n.circle {\n  width: 16px;\n  height: 16px;\n  border: 2px solid transparent;\n  border-top: 2px solid currentColor;\n  border-radius: 50%;\n  animation: spin 1s linear infinite;\n}\n\n.spinner[data-size=\"small\"] .circle {\n  width: 12px;\n  height: 12px;\n  border-width: 1.5px;\n}\n\n.spinner[data-size=\"large\"] .circle {\n  width: 20px;\n  height: 20px;\n  border-width: 2.5px;\n}\n\n.srOnly {\n  position: absolute;\n  width: 1px;\n  height: 1px;\n  padding: 0;\n  margin: -1px;\n  overflow: hidden;\n  clip: rect(0, 0, 0, 0);\n  white-space: nowrap;\n  border: 0;\n}\n\n@keyframes spin {\n  0% { transform: rotate(0deg); }\n  100% { transform: rotate(360deg); }\n}"
        }
      ]
    }
  ]
}
```

---

## Usage Examples

### Example 1: Get Design Specifications

```bash
curl -X POST https://meli-xmcp-poc.vercel.app/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "1",
    "method": "tools/call",
    "params": {
      "name": "get_design_specifications",
      "arguments": {
        "versions": { "andes": "latest" }
      }
    }
  }'
```

### Example 2: List All Components

```bash
curl -X POST https://meli-xmcp-poc.vercel.app/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "2",
    "method": "tools/call",
    "params": {
      "name": "list_components",
      "arguments": {}
    }
  }'
```

### Example 3: Filter Components by Query

```bash
curl -X POST https://meli-xmcp-poc.vercel.app/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "3",
    "method": "tools/call",
    "params": {
      "name": "list_components",
      "arguments": {
        "query": "button"
      }
    }
  }'
```

### Example 4: Get Button Component (All Variants)

```bash
curl -X POST https://meli-xmcp-poc.vercel.app/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "4",
    "method": "tools/call",
    "params": {
      "name": "get_component",
      "arguments": {
        "name": "Button"
      }
    }
  }'
```

### Example 5: Get Specific Button Variant

```bash
curl -X POST https://meli-xmcp-poc.vercel.app/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "5",
    "method": "tools/call",
    "params": {
      "name": "get_component",
      "arguments": {
        "name": "Button",
        "variant": "DropdownButton"
      }
    }
  }'
```

---

## Migration Guide

If you were using the previous tool names (with `andes-` prefix), here's how to migrate:

### Tool Name Changes

| Old Name | New Name |
|----------|----------|
| `andes-design-specifications` | `get_design_specifications` |
| `andes-components-list` | `list_components` |
| `andes-components` | `get_component` |

### Input Schema Changes

#### get_component (formerly andes-components)

**Before:**
```json
{
  "componentName": "Button,Modal,Form",
  "versions": { "andes": "latest" }
}
```

**After:**
```json
{
  "name": "Button",
  "variant": "DropdownButton"
}
```

**Changes:**
- `componentName` → `name` (single component only, no comma-separated list)
- Added `variant` parameter for specific variants
- Removed `versions` parameter

#### list_components (formerly andes-components-list)

**Before:**
```json
{
  "versions": { "andes": "latest" }
}
```

**After:**
```json
{
  "query": "button",
  "tags": ["interactive"],
  "packageFilter": "@andes/button"
}
```

**Changes:**
- Removed `versions` parameter
- Added `query`, `tags`, and `packageFilter` for filtering
- Changed purpose from single-component retrieval to multi-component listing

---

## Additional Notes

### When to Use Each Tool

1. **get_design_specifications**: 
   - First tool to call when starting a new project
   - Get implementation guidelines, import patterns, and best practices
   - Understand dependency requirements and helper component patterns

2. **list_components**: 
   - Discover available components
   - Filter by name, tags, or package
   - Get a quick overview before fetching detailed specs

3. **get_component**: 
   - Get complete specifications for implementation
   - Access all props, variants, and code examples
   - Retrieve helper components and dependencies
   - Understand size specifications and design tokens

### Response Field Conditions

The following fields are **conditionally included** in `get_component` responses:

- `required_dependencies` - Only for components needing external packages (e.g., Button needs clsx)
- `package_json_dependencies` - Only when dependencies are required
- `installation_commands` - Only when dependencies are required
- `setup_instructions` - Only for components with special setup needs
- `critical_notes` - Only for components with important warnings
- `helper_components` - Only for components that require helper files (e.g., Button needs Spinner)

Components like Badge or Card that don't require dependencies will only return the `components` array.
