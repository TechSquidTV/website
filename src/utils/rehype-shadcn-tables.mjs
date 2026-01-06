import { visit } from 'unist-util-visit';

/**
 * Rehype plugin to add shadcn/ui classes to tables
 * Transforms standard HTML tables to use shadcn component classes
 */
export function rehypeShadcnTables() {
  return function (tree) {
    visit(tree, 'element', (node) => {
      // Transform table element
      if (node.tagName === 'table') {
        node.properties = {
          ...node.properties,
          className: [...(node.properties?.className || []), 'shadcn-table']
        };
      }
      
      // Transform thead element
      if (node.tagName === 'thead') {
        node.properties = {
          ...node.properties,
          className: [...(node.properties?.className || []), 'shadcn-table-header']
        };
      }
      
      // Transform tbody element
      if (node.tagName === 'tbody') {
        node.properties = {
          ...node.properties,
          className: [...(node.properties?.className || []), 'shadcn-table-body']
        };
      }
      
      // Transform tr elements
      if (node.tagName === 'tr') {
        const isHeaderRow = node.parent?.tagName === 'thead';
        node.properties = {
          ...node.properties,
          className: [...(node.properties?.className || []), isHeaderRow ? 'shadcn-table-header-row' : 'shadcn-table-row']
        };
      }
      
      // Transform th elements
      if (node.tagName === 'th') {
        node.properties = {
          ...node.properties,
          className: [...(node.properties?.className || []), 'shadcn-table-head']
        };
      }
      
      // Transform td elements
      if (node.tagName === 'td') {
        node.properties = {
          ...node.properties,
          className: [...(node.properties?.className || []), 'shadcn-table-cell']
        };
      }
    });
  };
}
