/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Utility to detect and handle actual page refresh events
 * Distinguishes between actual refresh and programmatic navigation
 */

export class RefreshDetector {
  private static isRefreshingRef: { current: boolean } = { current: false };
  private static refreshCheckTimeoutRef: { current: NodeJS.Timeout | null } = {
    current: null,
  };
  private static cleanupRef: { current: (() => void) | null } = {
    current: null,
  };
  private static isModalShownRef: { current: boolean } = { current: false };

  /**
   * Set up listeners to detect refresh attempts
   * Returns a function to clean up listeners
   */
  static setupRefreshDetector(
    onRefreshAttempt: () => void,
  ): () => void {
    // Listen for keyboard shortcuts (F5, Ctrl+R, Cmd+R, Ctrl+Shift+R)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "F5" ||
        (e.ctrlKey && e.key === "r" && !e.shiftKey) ||
        (e.metaKey && e.key === "r" && !e.shiftKey) ||
        (e.ctrlKey && e.shiftKey && e.key === "r") ||
        (e.metaKey && e.shiftKey && e.key === "r")
      ) {
        // Prevent default browser refresh
        e.preventDefault();
        
        // Only show modal if not already shown and not currently refreshing
        if (!this.isModalShownRef.current && !this.isRefreshingRef.current) {
          this.isModalShownRef.current = true;
          onRefreshAttempt();
        }
      }
    };

    // Listen for beforeunload to detect page refresh/reload (browser refresh button)
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Only trigger if we're not in the middle of a programmatic navigation
      if (!this.isRefreshingRef.current && !this.isModalShownRef.current) {
        // Show our custom modal instead of browser's default
        this.isModalShownRef.current = true;
        onRefreshAttempt();
        
        // Return null to prevent browser's default confirmation dialog
        // This is the key change - we don't set returnValue
        return null;
      }
      return undefined;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Store cleanup function ref for later use
    const cleanup = () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
    this.cleanupRef.current = cleanup;

    // Cleanup function
    return cleanup;
  }

  /**
   * Mark that we're about to do a programmatic navigation
   * This tells the refresh detector to ignore the next beforeunload
   */
  static allowRefresh() {
    if (this.refreshCheckTimeoutRef.current) {
      clearTimeout(this.refreshCheckTimeoutRef.current);
    }

    this.isRefreshingRef.current = true;
    this.isModalShownRef.current = false;

    // Reset after 500ms to allow the refresh to complete
    this.refreshCheckTimeoutRef.current = setTimeout(() => {
      this.isRefreshingRef.current = false;
      this.isModalShownRef.current = false;
    }, 500);
  }

  /**
   * Reset modal shown state when user cancels
   */
  static cancelRefresh() {
    this.isModalShownRef.current = false;
  }

  /**
   * Check if we're in the process of refreshing
   */
  static isRefreshing(): boolean {
    return this.isRefreshingRef.current;
  }

  /**
   * Clean up the timeout
   */
  static cleanup() {
    if (this.refreshCheckTimeoutRef.current) {
      clearTimeout(this.refreshCheckTimeoutRef.current);
    }
  }
}