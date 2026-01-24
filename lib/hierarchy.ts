import { Category, User } from '../types';

// Rule 7: Auto-generate slug from name (sanitized)
export const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Rule 2: Max depth 5 levels
export const getCategoryDepth = (
  targetParentId: string | null,
  allCategories: Category[]
): number => {
  if (!targetParentId) return 0; // Root is level 0 (so items inside are depth 1)
  
  let depth = 1;
  let currentId = targetParentId;
  
  // Safe guard against circular refs (max loop)
  let loopCount = 0;
  while (currentId && loopCount < 10) {
    const parent = allCategories.find(c => c.id === currentId);
    if (!parent) break;
    if (parent.parentId) {
      currentId = parent.parentId;
      depth++;
    } else {
      break;
    }
    loopCount++;
  }
  return depth;
};

// Rule 3: EDITOR only creates within their department
export const canUserModifyCategory = (user: User, category: Category | null): boolean => {
  if (user.role === 'ADMIN') return true;
  if (user.role === 'READER') return false;
  if (user.role === 'EDITOR') {
    // If creating root, must match department
    // If creating child, parent must match department (implied by tree traversal, but checked here)
    if (!category) return true; // Theoretical check, usually we check against a specific target
    return category.departmentId === user.department;
  }
  return false;
};

// Rule 1: Unique slug within same parent
export const isSlugUnique = (
  slug: string, 
  parentId: string | null, 
  allCategories: Category[]
): boolean => {
  const siblings = allCategories.filter(c => c.parentId === parentId);
  return !siblings.some(c => c.slug === slug);
};

// Rule 8: Breadcrumb generation
export const getCategoryPath = (
  categoryId: string, 
  allCategories: Category[]
): string => {
  const path: string[] = [];
  let current = allCategories.find(c => c.id === categoryId);
  
  let loopCount = 0;
  while (current && loopCount < 10) {
    path.unshift(current.name);
    if (current.parentId) {
      current = allCategories.find(c => c.id === current.parentId);
    } else {
      current = undefined;
    }
    loopCount++;
  }
  return path.join(' > ');
};

// Rule 9: Tree building with sorting by order
export const buildCategoryTree = (categories: Category[]): Category[] => {
  const map = new Map<string, Category>();
  const roots: Category[] = [];

  // Deep copy to avoid mutating original state references during build
  const cats = categories.map(c => ({ ...c, children: [] }));

  cats.forEach(cat => map.set(cat.id, cat));

  cats.forEach(cat => {
    if (cat.parentId && map.has(cat.parentId)) {
      map.get(cat.parentId)!.children!.push(cat);
    } else {
      roots.push(cat);
    }
  });

  // Recursive sort
  const sortRecursive = (list: Category[]) => {
    // Sort by order, then by name
    list.sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      return a.name.localeCompare(b.name);
    });
    list.forEach(item => {
      if (item.children && item.children.length > 0) {
        sortRecursive(item.children);
      }
    });
  };

  sortRecursive(roots);
  return roots;
};
