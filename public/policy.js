(function() {
  try {
    if (typeof window !== 'undefined' && window.trustedTypes && !window.trustedTypes.defaultPolicy) {
      console.log("🔒 Static Policy Source Activated.");
      window.trustedTypes.createPolicy('default', {
        createHTML: function(s) { return s; },
        createScriptURL: function(s) { return s; },
        createScript: function(s) { return s; }
      });
    }
  } catch (e) {
    console.warn("Policy assignment deferral", e);
  }
})();
