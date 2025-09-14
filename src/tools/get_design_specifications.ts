import { z } from "zod";
import type { ToolMetadata, InferSchema } from "xmcp";

// Define the schema for tool parameters
export const schema = {
  versions: z.object({
    andes: z.string().default("latest").describe("Semver version of package \"@andes/[component]\" (format: \"latest\", \"8.0.0\", \"9.0.0\")"),
  }).optional().describe("Package versions. If not provided, defaults to latest."),
};

// Define tool metadata
export const metadata: ToolMetadata = {
  name: "get_design_specifications",
  description: "Contains the foundational rules and implementation guidelines for generating interfaces aligned with the Mercado Libre user experience and brand language, including details on dependencies, helper components, and code generation best practices.",
  annotations: {
    title: "Get Design System Implementation Specifications",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
  },
};

// Tool implementation
export default function getDesignSpecifications({
  versions = { andes: "latest" },
}: InferSchema<typeof schema>) {
  const andesVersion = versions?.andes || "latest";
  const designSpecs = `# Specification for an LLM to Generate Components with the Look & Feel of Mercado Libre

> Compatible with Andes UI version: ${andesVersion}

> This document defines the foundational rules and implementation guidelines that the LLM must follow when generating interfaces aligned with the Mercado Libre user experience and brand language.

## Objective

Generate functional, production-ready React components that work immediately without additional setup or missing dependencies.

## MANDATORY REQUIREMENTS

### Dependencies and Imports

- **MANDATORY**: \`clsx\` MUST ALWAYS be installed - All components use \`clsx\` for conditional class names
- **MANDATORY**: Include \`clsx\` in package.json dependencies for every project
- **CONDITIONAL**: Only install other dependencies when MCP response includes \`required_dependencies\` or \`package_json_dependencies\`
- **CONDITIONAL**: Only create helper files when MCP response includes \`helper_components\` and they are actually needed by the component
- **Required dependencies for projects**:
  \`\`\`json
  {
    "dependencies": {
      "react": "^18.0.0",
      "clsx": "^2.0.0"
    }
  }
  \`\`\`

### Processing MCP Response

When receiving a component from MCP, follow this order:

1. **MANDATORY**: Always install \`clsx\` first - \`pnpm add clsx\`
2. **CONDITIONAL**: Check for \`required_dependencies\` → Only install if present and needed
3. **CONDITIONAL**: Check for \`helper_components\` → Only create if present and component actually uses them
4. **Create main component** → Use the component specifications
5. **Follow \`setup_instructions\`** → Complete any additional setup steps

Example MCP response processing:
\`\`\`typescript
// 1. MANDATORY: Always install clsx
await executeCommand('pnpm add clsx');

// 2. CONDITIONAL: Install other dependencies only if needed
if (mcpResponse.required_dependencies) {
  Object.keys(mcpResponse.required_dependencies).forEach(dep => {
    // Run: pnpm add [dep] only if not already installed
  });
}

// 3. CONDITIONAL: Create helper components only if needed
if (mcpResponse.helper_components && componentNeedsHelpers(mcpResponse.components)) {
  mcpResponse.helper_components.forEach(helper => {
    helper.files.forEach(file => {
      // Create file at file.path with file.content
    });
  });
}

// 4. Create main component
// Use mcpResponse.components[0] specifications
\`\`\`

### When NOT to Install Files

**DO NOT install dependencies or create files unless:**
- \`clsx\` is missing (always install this)
- Component actually uses the helper component (check imports in component code)
- MCP response explicitly includes \`required_dependencies\` for that specific component
- Component has \`loading\` prop and needs Spinner
- Component has \`href\` prop and needs link functionality

**Examples of when to skip:**
- Badge component → No additional dependencies needed
- Card component → No helper components needed  
- Button without loading prop → No Spinner needed
- Components that don't import helper files → Don't create them

### Helper Components

When components require helper components (like Spinner for loading states), **provide them only when needed**:

#### Spinner Component
\`\`\`tsx
// components/Spinner/Spinner.tsx
import React from 'react';
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

export default Spinner;
\`\`\`

#### Spinner CSS
\`\`\`css
/* components/Spinner/Spinner.module.css */
.spinner {
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
}
\`\`\`

### Design System Principles

#### Color System
Use CSS custom properties for consistent theming:
\`\`\`css
:root {
  /* Primary Colors */
  --andes-blue-500: #3483fa;
  --andes-blue-600: #2968c8;
  --andes-blue-700: #1e4f96;
  --andes-blue-150: #e6f4ff;
  --andes-blue-200: #cce7ff;
  --andes-blue-300: #99d1ff;
  
  /* Neutral Colors */
  --andes-white: #ffffff;
  --andes-gray-50: #fafafa;
  --andes-gray-100: #f5f5f5;
  --andes-gray-700: #666666;
  
  /* Semantic Colors */
  --andes-green-100: #e8f5e8;
  --andes-green-700: #00a650;
  --andes-yellow-100: #fff8e1;
  --andes-yellow-700: #ff8f00;
  --andes-red-100: #ffebee;
  --andes-red-700: #d32f2f;
}
\`\`\`

#### Typography Tokens
\`\`\`css
:root {
  /* Font Weights */
  --andes-font-weight-medium: 500;
  --andes-font-weight-semibold: 600;
  
  /* Font Sizes */
  --andes-font-size-caption: 11px;
  --andes-font-size-small: 12px;
  --andes-font-size-medium: 14px;
  --andes-font-size-large: 16px;
}
\`\`\`

#### Spacing System
\`\`\`css
:root {
  --andes-spacing-4: 4px;
  --andes-spacing-8: 8px;
  --andes-spacing-12: 12px;
  --andes-spacing-16: 16px;
  --andes-spacing-24: 24px;
}
\`\`\`

### Component Implementation Rules

#### 1. File Structure
\`\`\`
components/
  ComponentName/
    ComponentName.tsx
    ComponentName.module.css
    index.ts (optional)
\`\`\`

#### 2. Component Template
\`\`\`tsx
import React, { forwardRef } from 'react';
import clsx from 'clsx';
import styles from './ComponentName.module.css';

interface ComponentNameProps {
  children: React.ReactNode;
  className?: string;
  // ... other props
}

const ComponentName = forwardRef<HTMLElement, ComponentNameProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <element
        ref={ref}
        className={clsx(styles.component, className)}
        {...props}
      >
        {children}
      </element>
    );
  }
);

ComponentName.displayName = 'ComponentName';

// CRITICAL: Always use default export to prevent import/export errors
export default ComponentName;
\`\`\`

#### 3. Export/Import Rules (CRITICAL for preventing React runtime errors)

**MANDATORY Export Rules:**
- **ALWAYS use default export**: \`export default ComponentName;\`
- **NEVER use named exports** for main components: \`export { ComponentName };\` (WRONG)
- **Always set displayName**: \`ComponentName.displayName = 'ComponentName';\`
- **Validate component is function**: Component must be a React function/forwardRef, not an object

**MANDATORY Import Rules:**
- **Use default import**: \`import ComponentName from './ComponentName';\`
- **NEVER use named import** for main components: \`import { ComponentName } from './ComponentName';\` (WRONG)
- **Verify import path**: Ensure file exists and has default export
- **Check for typos**: Component name must match exactly

**Page Component Rules:**
\`\`\`tsx
// CORRECT: app/page.tsx
import React from 'react';
import Button from '../components/Button/Button'; // Default import

export default function Page() { // Default export
  return (
    <div>
      <Button>Click me</Button>
    </div>
  );
}

// WRONG: Missing default export
export function Page() { ... }

// WRONG: Named import for component
import { Button } from '../components/Button/Button';
\`\`\`

#### 3. CSS Module Template
\`\`\`css
.component {
  /* Base styles using design tokens */
  font-family: inherit;
  box-sizing: border-box;
}

/* Size variants */
.component[data-size="small"] { }
.component[data-size="medium"] { }
.component[data-size="large"] { }

/* Hierarchy variants */
.component[data-hierarchy="loud"] { }
.component[data-hierarchy="quiet"] { }
.component[data-hierarchy="mute"] { }

/* State variants */
.component:hover { }
.component:active { }
.component:disabled { }
.component[data-loading="true"] { }
\`\`\`

### Button-Specific Implementation

#### Button Component Structure
\`\`\`tsx
import React, { forwardRef } from 'react';
import clsx from 'clsx';
import Spinner from '../Spinner/Spinner';
import styles from './Button.module.css';

interface ButtonProps {
  children: React.ReactNode;
  hierarchy?: 'loud' | 'quiet' | 'mute' | 'transparent';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  backgroundType?: 'default' | 'complexBackground';
  className?: string;
  href?: string;
  id?: string;
  srAnnouncement?: string;
  srLabel?: string;
  type?: 'button' | 'submit' | 'reset';
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    children,
    hierarchy = 'loud',
    size = 'large',
    disabled = false,
    loading = false,
    fullWidth = false,
    backgroundType = 'default',
    className,
    href,
    srAnnouncement,
    srLabel,
    type = 'button',
    onClick,
    ...props
  }, ref) => {
    const Component = href ? 'a' : 'button';
    
    return (
      <Component
        ref={ref as any}
        className={clsx(
          styles.button,
          className
        )}
        data-hierarchy={hierarchy}
        data-size={size}
        data-background-type={backgroundType}
        data-loading={loading}
        data-full-width={fullWidth}
        disabled={disabled || loading}
        type={href ? undefined : type}
        href={href}
        onClick={onClick}
        aria-label={srLabel}
        aria-disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <Spinner 
            srAnnouncement={srAnnouncement} 
            size={size === 'large' ? 'medium' : 'small'} 
          />
        ) : (
          children
        )}
      </Component>
    );
  }
);

Button.displayName = 'Button';

// CRITICAL: Validate component is function to prevent runtime errors
if (typeof Button !== 'function') {
  throw new Error('Button must be a function component');
}

// CRITICAL: Always use default export to prevent import/export errors
export default Button;
\`\`\`

### Critical Implementation Guidelines

1. **Always use \`clsx\`** for conditional class names
2. **Always provide helper components** (Spinner, etc.) when needed
3. **Use CSS custom properties** for consistent theming
4. **Use data attributes** for styling variants instead of multiple CSS classes
5. **Include forwardRef** for proper ref handling
6. **Add displayName** for better debugging
7. **Use semantic HTML** (button vs a tags based on href prop)
8. **Include proper accessibility** attributes (aria-label, aria-disabled, etc.)
9. **Handle loading states** with proper spinner integration
10. **Support all documented props** from the component specification

### Package.json Template

When generating a new project, always include:
\`\`\`json
{
  "name": "component-demo",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "next": "^14.0.0",
    "clsx": "^2.0.0"
  },
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  }
}
\`\`\`

### Next.js Configuration

Include proper TypeScript configuration:
\`\`\`json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": false,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
\`\`\`

### Component Validation (CRITICAL for preventing runtime errors)

**Before generating any component, validate:**

1. **Component Function Validation:**
\`\`\`typescript
// VALID: Function component
const Button = (props) => <button {...props} />;

// VALID: forwardRef component  
const Button = forwardRef((props, ref) => <button ref={ref} {...props} />);

// INVALID: Object instead of function
const Button = { render: () => <button /> }; // This causes "got: object" error
\`\`\`

2. **Export Validation:**
\`\`\`typescript
// VALID: Default export of function
export default Button;

// INVALID: Named export (causes import issues)
export { Button };

// INVALID: Exporting object
export default { Button };
\`\`\`

3. **Import Path Validation:**
\`\`\`typescript
// VALID: Correct relative path
import Button from '../components/Button/Button';

// INVALID: Wrong path (file doesn't exist)
import Button from '../components/Button'; // Missing /Button

// INVALID: Named import for default export
import { Button } from '../components/Button/Button';
\`\`\`

### Common Error Prevention

**To prevent "React.jsx: type is invalid" errors:**

- **Always check**: Component is a function, not an object
- **Always use**: Default exports for components
- **Always verify**: Import paths are correct
- **Always set**: displayName for debugging
- **Always test**: Component renders before using in pages

**Error Detection Template:**
\`\`\`typescript
// Add this validation in generated components
if (typeof ComponentName !== 'function') {
  throw new Error('ComponentName must be a function component');
}
\`\`\`

## Success Criteria

A successful implementation should:
- Compile without errors
- Include all required dependencies
- Work immediately after generation
- Follow Mercado Libre design principles
- Include proper accessibility features
- Support all documented component props
- Use consistent naming and file structure
- **Use default exports to prevent runtime errors**
- **Have correct import/export patterns**
- **Be valid React function components**

## CRITICAL WORKFLOW FOR AI AGENTS

When an AI agent fetches a component from MCP:

1. **STEP 1: Check Response Structure**
   - Look for \`required_dependencies\` → Install these first
   - Look for \`helper_components\` → Create these files
   - Look for \`setup_instructions\` → Follow exactly
   - Look for \`critical_notes\` → Pay attention to warnings

2. **STEP 2: Validate Component Code**
   - If component imports '../Spinner/Spinner' → Create Spinner.tsx and Spinner.module.css
   - If component uses 'clsx' → Install clsx package
   - If component uses any '../Something' import → Create Something files

3. **STEP 3: Installation Order**
   \`\`\`bash
   # ALWAYS this order:
   1. pnpm add clsx (if component uses clsx)
   2. Create helper component files (if any imports)
   3. Create main component files
   4. Test compilation
   \`\`\`

4. **STEP 4: Verification**
   - Check that all imports resolve
   - Check that all dependencies are installed
   - Check that component compiles without errors

**FAILURE TO FOLLOW THIS WORKFLOW WILL RESULT IN "Module not found" ERRORS**
`;

  return {
    content: [
      {
        type: "text",
        text: designSpecs,
      },
    ],
  };
}
