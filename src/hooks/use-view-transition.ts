import { useCallback } from "react";

export function useViewTransition() {
  const startTransition = useCallback((callback: () => void) => {
    if (document.startViewTransition) {
      document.startViewTransition(callback);
    } else {
      callback();
    }
  }, []);

  return { startTransition };
}
