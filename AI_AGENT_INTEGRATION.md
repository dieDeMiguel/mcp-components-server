# AI Agent Integration Guide

## Required Workflow

When an AI agent fetches a component from this MCP server, it MUST follow this exact workflow to prevent "Module not found" errors:

### 1. Parse MCP Response Structure

The MCP response will include these critical fields:

```typescript
interface MCPResponse {
  components: ComponentSpec[];           // Component specifications
  setup_instructions: string[];         // MANDATORY steps to follow
  critical_notes: string[];            // WARNING messages about imports/dependencies
  required_dependencies: Record<string, string>;  // npm packages to install
  helper_components: HelperComponent[]; // Additional files to create
}
```

### 2. Execute Setup Instructions in Order

**MANDATORY**: Always follow `setup_instructions` in the exact order provided:

```json
{
  "setup_instructions": [
    "1. MANDATORY: Install clsx dependency: pnpm add clsx",
    "2. MANDATORY: Create all helper components listed in helper_components section",
    "3. Verify all imports in the main component have corresponding files",
    "4. Only after completing steps 1-3, the component will work without errors"
  ]
}
```

### 3. Create All Helper Components First

Before creating the main component, create ALL files listed in `helper_components`:

```typescript
// Example: Button component requires Spinner
if (response.helper_components) {
  response.helper_components.forEach(helper => {
    helper.files.forEach(file => {
      // Create file at file.path with file.content
      createFile(file.path, file.content);
    });
  });
}
```

### 4. Install All Required Dependencies

Install ALL dependencies listed in `required_dependencies`:

```typescript
if (response.required_dependencies) {
  Object.keys(response.required_dependencies).forEach(dep => {
    executeCommand(`pnpm add ${dep}`);
  });
}
```

### 5. Pay Attention to Critical Notes

`critical_notes` contain WARNING messages about potential errors:

```json
{
  "critical_notes": [
    "WARNING: This component imports '../Spinner/Spinner' - you MUST create Spinner.tsx and Spinner.module.css",
    "WARNING: This component uses 'clsx' - you MUST install it with: pnpm add clsx",
    "WARNING: Missing any of these files will cause 'Module not found' errors"
  ]
}
```

## Error Prevention Checklist

### ✅ Before Creating Component:

- [ ] Install all `required_dependencies`
- [ ] Create all files from `helper_components`
- [ ] Verify all relative imports have corresponding files
- [ ] Check that component uses only installed packages

### ✅ After Creating Component:

- [ ] Test compilation: `pnpm build` or `npm run build`
- [ ] Verify no "Module not found" errors
- [ ] Verify no "Cannot resolve" errors
- [ ] Verify component renders without runtime errors

## Validation Tool Usage

Use the `validate_component_response` tool to check if a response is valid:

```typescript
const validation = await mcpClient.call('validate_component_response', {
  response: mcpResponse
});

if (!validation.validation_result.is_valid) {
  console.error('Validation failed:', validation.validation_result.errors);
  // Fix errors before proceeding
}
```

## Common Mistakes to Avoid

### ❌ DON'T:
- Skip installing dependencies
- Create main component before helper components
- Ignore `critical_notes` warnings
- Use named imports for default exports
- Skip the validation step

### ✅ DO:
- Follow `setup_instructions` exactly
- Create helper components first
- Install all dependencies
- Use default imports for components
- Validate response before proceeding

## Example Workflow Implementation

```typescript
async function createComponentFromMCP(componentName: string) {
  // 1. Fetch component from MCP
  const response = await mcpClient.call('get_component', { name: componentName });
  
  // 2. Validate response
  const validation = await mcpClient.call('validate_component_response', { response });
  if (!validation.validation_result.is_valid) {
    throw new Error(`Invalid component: ${validation.validation_result.errors.join(', ')}`);
  }
  
  // 3. Install dependencies
  if (response.required_dependencies) {
    for (const [dep, version] of Object.entries(response.required_dependencies)) {
      await executeCommand(`pnpm add ${dep}@${version}`);
    }
  }
  
  // 4. Create helper components
  if (response.helper_components) {
    for (const helper of response.helper_components) {
      for (const file of helper.files) {
        await createFile(file.path, file.content);
      }
    }
  }
  
  // 5. Create main component
  const mainComponent = response.components[0];
  await createFile(`components/${componentName}/${componentName}.tsx`, generateComponentCode(mainComponent));
  
  // 6. Verify compilation
  await executeCommand('pnpm build');
  
  console.log('✅ Component created successfully without errors');
}
```

## Troubleshooting

### "Module not found" Errors

1. Check `critical_notes` for missing files
2. Verify all `helper_components` were created
3. Ensure all `required_dependencies` were installed
4. Check import paths match created file paths

### "Cannot resolve" Errors

1. Verify file extensions (.tsx, .ts, .css)
2. Check relative import paths (../ vs ./)
3. Ensure helper components have correct exports

### Runtime Errors

1. Verify components use default exports
2. Check that all props are correctly typed
3. Ensure CSS modules are imported correctly

---

**Following this workflow will eliminate "Module not found" errors and ensure components work immediately after generation.**
