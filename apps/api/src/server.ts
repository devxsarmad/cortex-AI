import { env } from "./config/env.js";
import { createApp } from "./app.js";

const app = createApp();

const server = app.listen(env.port, () => {
  console.log(`Cortex API listening on http://localhost:${env.port}`);
});

server.on("error", (error: NodeJS.ErrnoException) => {
  if (error.code === "EADDRINUSE") {
    console.error(
      `Port ${env.port} is already in use. Stop the existing process or change PORT in apps/api/.env.`
    );
    process.exit(1);
  }

  throw error;
});
