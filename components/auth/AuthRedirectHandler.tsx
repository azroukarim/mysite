'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthRedirectHandler() {
  const router = useRouter();

  useEffect(() => {
    // Check if we are on the home page and have a recovery token in the hash
    const handleAuthRedirect = () => {
      const hash = window.location.hash;
      const urlParams = new URLSearchParams(window.location.search);
      
      const isRecovery = hash.includes('type=recovery') || 
                        hash.includes('access_token=') ||
                        urlParams.get('mode') === 'reset';

      if (isRecovery) {
        // If we are not already on the admin page, redirect there
        if (!window.location.pathname.startsWith('/admin')) {
          console.log('Recovery token detected, redirecting to admin reset page...');
          router.push(`/admin?mode=reset${hash}`);
        }
      }
    };

    handleAuthRedirect();
    
    // Also listen for hash changes (some Supabase flows might trigger this)
    window.addEventListener('hashchange', handleAuthRedirect);
    return () => window.removeEventListener('hashchange', handleAuthRedirect);
  }, [router]);

  return null;
}
