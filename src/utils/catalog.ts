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
  
  // Filter by package
  if (packageFilter) {
    components = components.filter(comp => comp.package === packageFilter);
  }
  
  // Filter by tags
  if (tags && tags.length > 0) {
    components = components.filter(comp =>
      tags.some(tag => comp.tags.includes(tag))
    );
  }
  
  // Filter by query (search in name and description)
  if (query) {
    const searchTerm = query.toLowerCase();
    components = components.filter(comp =>
      comp.name.toLowerCase().includes(searchTerm) ||
      comp.description.toLowerCase().includes(searchTerm)
    );
  }
  
  return components;
}

export function getComponent(name: string): ComponentSpec | null {
  const catalog = loadCatalog();
  return catalog.components.find(comp => comp.name === name) || null;
}
