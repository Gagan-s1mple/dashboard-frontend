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
        e.preventDefault();
        onRefreshAttempt();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Store cleanup function ref for later use
    const cleanup = () => {
      window.removeEventListener("keydown", handleKeyDown);
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

    // Reset after 500ms to allow the refresh to complete
    this.refreshCheckTimeoutRef.current = setTimeout(() => {
      this.isRefreshingRef.current = false;
    }, 500);
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
