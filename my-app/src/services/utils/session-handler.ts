import { toast } from "sonner";

/**
 * Centralized session expiry handler.
 * Clears auth tokens, shows a toast, and redirects to login.
 * Uses a debounce flag so multiple 401s don't trigger multiple toasts/redirects.
 */

let isHandlingSessionExpiry = false;

export function handleSessionExpired() {
    // Prevent multiple concurrent invocations
    if (isHandlingSessionExpiry) return;
    isHandlingSessionExpiry = true;

    // Clear auth tokens
    if (typeof window !== "undefined") {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_email");
        localStorage.removeItem("token_type");
    }

    // Show toast and redirect after it disappears
    toast.error("Session expired, please login", {
        duration: 2000,
        onAutoClose: () => {
            isHandlingSessionExpiry = false;
            window.location.href = "/";
        },
        onDismiss: () => {
            isHandlingSessionExpiry = false;
            window.location.href = "/";
        },
    });
}
