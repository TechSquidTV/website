import { visit } from "unist-util-visit";

/**
 * Rehype plugin to add shadcn/ui classes to tables
 * Transforms standard HTML tables to use shadcn component classes
 */
export function rehypeShadcnTables() {
  return function (tree) {
    visit(tree, "element", (node, index, parent) => {
      // Transform table element
      if (node.tagName === "table") {
        node.properties = {
          ...node.properties,
          className: [...(node.properties?.className || []), "shadcn-table"],
        };
      }

      // Keep wide tables scrollable without changing native table layout.
      if (node.tagName === "table" && parent && typeof index === "number") {
        parent.children[index] = {
          type: "element",
          tagName: "div",
          properties: {
            className: ["markdown-table-scroll"],
            tabIndex: 0,
            role: "region",
            ariaLabel: "Scrollable table",
          },
          children: [node],
        };
      }

      // Transform thead element
      if (node.tagName === "thead") {
        node.properties = {
          ...node.properties,
          className: [
            ...(node.properties?.className || []),
            "shadcn-table-header",
          ],
        };
      }

      // Transform tbody element
      if (node.tagName === "tbody") {
        node.properties = {
          ...node.properties,
          className: [
            ...(node.properties?.className || []),
            "shadcn-table-body",
          ],
        };
      }

      // Transform tr elements
      if (node.tagName === "tr") {
        const isHeaderRow = parent?.tagName === "thead";
        node.properties = {
          ...node.properties,
          className: [
            ...(node.properties?.className || []),
            isHeaderRow ? "shadcn-table-header-row" : "shadcn-table-row",
          ],
        };
      }

      // Transform th elements
      if (node.tagName === "th") {
        node.properties = {
          ...node.properties,
          className: [
            ...(node.properties?.className || []),
            "shadcn-table-head",
          ],
        };
      }

      // Transform td elements
      if (node.tagName === "td") {
        node.properties = {
          ...node.properties,
          className: [
            ...(node.properties?.className || []),
            "shadcn-table-cell",
          ],
        };
      }
    });
  };
}
