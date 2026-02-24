/**
 * Utility functions for managing selected files in localStorage
 */

export const FILE_SELECTION_STORAGE_KEY = "adro_selected_files";

/**
 * Save selected file IDs to localStorage
 */
export const persistSelectedFiles = (fileIds: string[]): void => {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(FILE_SELECTION_STORAGE_KEY, JSON.stringify(fileIds));
  } catch (error) {
    console.error("Failed to persist selected files:", error);
  }
};

/**
 * Restore selected file IDs from localStorage
 */
export const restoreSelectedFiles = (): string[] => {
  if (typeof localStorage === "undefined") return [];
  try {
    const stored = localStorage.getItem(FILE_SELECTION_STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to restore selected files:", error);
    return [];
  }
};

/**
 * Clear selected files from localStorage
 */
export const clearPersistedSelectedFiles = (): void => {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.removeItem(FILE_SELECTION_STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear persisted selected files:", error);
  }
};
