/**
 * Utility functions for managing selected files in sessionStorage
 */

export const FILE_SELECTION_STORAGE_KEY = "adro_selected_files";

/**
 * Save selected file IDs to sessionStorage
 */
export const persistSelectedFiles = (fileIds: string[]): void => {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(FILE_SELECTION_STORAGE_KEY, JSON.stringify(fileIds));
  } catch (error) {
    console.error("Failed to persist selected files:", error);
  }
};

/**
 * Restore selected file IDs from sessionStorage
 */
export const restoreSelectedFiles = (): string[] => {
  if (typeof sessionStorage === "undefined") return [];
  try {
    const stored = sessionStorage.getItem(FILE_SELECTION_STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to restore selected files:", error);
    return [];
  }
};

/**
 * Clear selected files from sessionStorage
 */
export const clearPersistedSelectedFiles = (): void => {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.removeItem(FILE_SELECTION_STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear persisted selected files:", error);
  }
};

/**
 * Check if there are any persisted selected files
 */
export const hasPersistedSelectedFiles = (): boolean => {
  if (typeof sessionStorage === "undefined") return false;
  try {
    return sessionStorage.getItem(FILE_SELECTION_STORAGE_KEY) !== null;
  } catch {
    return false;
  }
};
