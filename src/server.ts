import app from "./app.ts";
import { AppDataSource } from "./config/data-source.ts";
import { Config } from "./config/index.ts";
import logger from "./config/logger.ts";

const startServer = async () => {
  const PORT = Config.PORT;
  try {
    // Connecting to the database
    await AppDataSource.initialize();

    logger.info("Database connected successfully");

    // Listening on the specified port
    app.listen(PORT, () => logger.info("Listening on PORT", { port: PORT }));
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(error.message);
      setTimeout(() => {
        process.exit(1);
      }, 1000);
    }
  }
};

startServer();
