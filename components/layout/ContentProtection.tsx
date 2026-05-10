"use client";

import { useEffect, useState } from "react";

export default function ContentProtection() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // 1. Skip protection if we are on an admin page
    if (window.location.pathname.startsWith('/admin')) {
      setEnabled(false);
      return;
    }

    // 2. Check if protection is enabled from API
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setEnabled(data.protection_enabled);
        }
      })
      .catch(() => {
        // Fallback to false if API fails
        setEnabled(false);
      });
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // 1. Prevent Right Click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // 2. Prevent Copy
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
    };

    // 3. Prevent Keyboard Shortcuts (F12, Ctrl+U, Ctrl+Shift+I, etc.)
    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable F12
      if (e.key === "F12") {
        e.preventDefault();
      }
      // Disable Ctrl+U (View Source)
      if (e.ctrlKey && e.key === "u") {
        e.preventDefault();
      }
      // Disable Ctrl+Shift+I (DevTools)
      if (e.ctrlKey && e.shiftKey && e.key === "I") {
        e.preventDefault();
      }
      // Disable Ctrl+C (Copy)
      if (e.ctrlKey && e.key === "c") {
        e.preventDefault();
      }
      // Disable PrintScreen
      if (e.key === "PrintScreen") {
        alert("Screenshots are disabled on this site.");
        e.preventDefault();
      }
    };

    // Apply CSS to prevent text selection
    document.body.style.userSelect = "none";
    document.body.style.webkitUserSelect = "none";
    
    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("copy", handleCopy);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.userSelect = "auto";
      document.body.style.webkitUserSelect = "auto";
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("copy", handleCopy);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled]);

  return null;
}
