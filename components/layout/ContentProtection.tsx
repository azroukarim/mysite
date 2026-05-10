"use client";

import { useEffect, useState } from "react";

export default function ContentProtection() {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    const checkProtection = () => {
      const path = window.location.pathname;
      if (path.startsWith('/admin') || path.startsWith('/dashboard-master')) {
        setEnabled(false);
        return;
      }
      
      // Always enable protection for the main website to ensure security
      setEnabled(true);
    };

    checkProtection();
    const interval = setInterval(checkProtection, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!enabled) {
      document.body.style.userSelect = "auto";
      document.body.style.webkitUserSelect = "auto";
      document.oncontextmenu = null;
      document.onselectstart = null;
      return;
    }

    const preventDefault = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const forbiddenKeys = ['F12', 'PrintScreen'];
      if (forbiddenKeys.includes(e.key) || 
         (e.ctrlKey && (['u', 's', 'c', 'p'].includes(e.key.toLowerCase()))) ||
         (e.ctrlKey && e.shiftKey && (['i', 'j', 'c'].includes(e.key.toUpperCase())))) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    document.body.style.userSelect = "none";
    document.body.style.webkitUserSelect = "none";
    
    // Use both properties and event listeners with capture phase
    document.oncontextmenu = preventDefault;
    document.onselectstart = preventDefault;
    
    document.addEventListener("contextmenu", preventDefault, { capture: true });
    document.addEventListener("copy", preventDefault, { capture: true });
    document.addEventListener("keydown", handleKeyDown, { capture: true });
    document.addEventListener("selectstart", preventDefault, { capture: true });

    return () => {
      document.body.style.userSelect = "auto";
      document.body.style.webkitUserSelect = "auto";
      document.oncontextmenu = null;
      document.onselectstart = null;
      document.removeEventListener("contextmenu", preventDefault, { capture: true });
      document.removeEventListener("copy", preventDefault, { capture: true });
      document.removeEventListener("keydown", handleKeyDown, { capture: true });
      document.removeEventListener("selectstart", preventDefault, { capture: true });
    };
  }, [enabled]);

  return null;
}
