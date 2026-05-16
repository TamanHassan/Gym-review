import app from "./app.js";

const PORT = process.env.PORT || 3000;

try {
  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`Port ${PORT} is already in use`);
    } else {
      console.error("Server error:", err);
    }
    process.exit(1);
  });
} catch (err) {
  console.error("Failed to start server:", err);
  process.exit(1);
}