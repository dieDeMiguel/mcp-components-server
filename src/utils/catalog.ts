import { ComponentCatalog, ComponentSpec } from '../types/components';
import catalogData from '../data/components-catalog.json';

let catalog: ComponentCatalog | null = null;

export function loadCatalog(): ComponentCatalog {
  if (catalog) {
    return catalog;
  }
  
  catalog = catalogData as ComponentCatalog;
  return catalog;
}

export function findComponents(query?: string, tags?: string[], packageFilter?: string): ComponentSpec[] {
  const catalog = loadCatalog();
  let components = catalog.components;
  
  // Filter by name if query is provided (exact or partial match)
  if (query) {
    const searchTerm = query.toLowerCase();
    components = components.filter(comp =>
      comp.name.toLowerCase().includes(searchTerm) ||
      comp.description.toLowerCase().includes(searchTerm)
    );
  }
  
  // Filter by package (using import field for new format)
  if (packageFilter) {
    components = components.filter(comp => 
      comp.import && comp.import.includes(packageFilter)
    );
  }
  
  // Filter by tags (not implemented in new format yet, but keeping for compatibility)
  if (tags && tags.length > 0) {
    // In the new format, we could add tags later if needed
    // For now, just return all components
  }
  
  return components;
}

export function getComponent(name: string): ComponentSpec | null {
  const catalog = loadCatalog();
  return catalog.components.find(comp => comp.name === name) || null;
}
