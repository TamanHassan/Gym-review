import { test } from "vitest";

test("debug - check if app is defined", async () => {
  const appModule = await import("../src/app.js");
  const app = appModule.default;
  
  console.log("AppModule keys:", Object.keys(appModule));
  console.log("App type:", typeof app);
  console.log("App constructor:", app?.constructor?.name);
  console.log("App is function:", typeof app === "function");
  console.log("App keys:", Object.keys(app || {}).slice(0, 10));
});
