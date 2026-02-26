/**
 * Entry point: set global error handler before any app code runs.
 * This ensures uncaught JS errors are logged (and visible in Metro) before
 * they hit the native bridge and surface as "non-std C++ exception" / RCTFatal.
 */
const g = typeof global !== "undefined" ? global : typeof window !== "undefined" ? window : {};
if (g.ErrorUtils && typeof g.ErrorUtils.setGlobalHandler === "function") {
  const orig = typeof g.ErrorUtils.getGlobalHandler === "function" ? g.ErrorUtils.getGlobalHandler() : null;
  g.ErrorUtils.setGlobalHandler((error, isFatal) => {
    console.error("[Uncaught JS error]", isFatal ? "FATAL" : "", error && error.message, error && error.stack);
    if (orig) orig(error, isFatal);
  });
}

try {
  require("expo/AppEntry");
} catch (e) {
  console.error("[Entry load error]", e && e.message, e && e.stack);
  throw e;
}
