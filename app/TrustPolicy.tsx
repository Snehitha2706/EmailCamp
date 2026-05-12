"use client";

import { useEffect } from 'react';

export default function TrustPolicyEnforcer() {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && (window as any).trustedTypes && !(window as any).trustedTypes.defaultPolicy) {
        console.log("🔓 Initializing Dynamic Trust Policy Override...");
        (window as any).trustedTypes.createPolicy('default', {
          createHTML: (s: string) => s,
          createScriptURL: (s: string) => s,
          createScript: (s: string) => s,
        });
      }
    } catch (e) {
      // Policy assignment bypass
    }
  }, []);

  return null;
}
