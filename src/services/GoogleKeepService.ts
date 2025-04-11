/**
 * Google Keep integration service
 * 
 * Since Google Keep doesn't have an official public API that works in the browser,
 * we're using a clipboard approach that generates a formatted list for Google Keep
 * and opens Google Keep for the user to paste it.
 * 
 * The format is specifically designed to work with Google Keep's task list functionality.
 */

interface GroceryItem {
  ingredient: string;
  quantity: string;
  category: string;
}

/**
 * Creates a properly formatted Google Keep checklist
 * and copies it to the clipboard
 */
export const createGoogleKeepChecklist = async (
  title: string,
  items: GroceryItem[]
): Promise<void> => {
  try {
    // Organize items by category
    const categorizedItems: Record<string, GroceryItem[]> = {};
    
    items.forEach(item => {
      // Normalize category name for better grouping
      const category = item.category.charAt(0).toUpperCase() + item.category.slice(1).toLowerCase();
      
      if (!categorizedItems[category]) {
        categorizedItems[category] = [];
      }
      
      categorizedItems[category].push(item);
    });
    
    // Format the content as a Google Keep checklist
    // The □ character is recognized by Google Keep as a checkbox
    let content = `${title}\n\n`;
    
    // Sort categories alphabetically
    const sortedCategories = Object.keys(categorizedItems).sort();
    
    for (const category of sortedCategories) {
      // Add a category header
      content += `${category}:\n`;
      
      // Sort items within each category
      const sortedItems = categorizedItems[category].sort((a, b) => 
        a.ingredient.localeCompare(b.ingredient)
      );
      
      // Add each item as a checklist item
      sortedItems.forEach(item => {
        // Format: □ Ingredient (quantity)  - Google Keep will convert this to a checkbox
        content += `□ ${item.ingredient} (${item.quantity})\n`;
      });
      
      content += '\n';
    }
    
    // Add a footer
    content += '--- Created with EasyCook ---';
    
    // Copy to clipboard
    await navigator.clipboard.writeText(content);
    
    console.log('Google Keep checklist copied to clipboard');
  } catch (error) {
    console.error('Error creating Google Keep checklist:', error);
    throw error;
  }
};

/**
 * Opens Google Keep in a new browser tab
 */
export const openGoogleKeep = (): void => {
  window.open('https://keep.google.com', '_blank');
};

/**
 * Track authentication state for Google services
 * This is a stub for interface compatibility
 */
export const isAuthenticatedForGoogle = (): boolean => {
  return true; // We don't need actual auth for clipboard approach
};