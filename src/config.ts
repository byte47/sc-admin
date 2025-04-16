import path from "path";

const config = {
  data: {
    // Default to ./data directory if not specified
    path: process.env.DATA_PATH || path.join(process.cwd(), "data"),
  },
  logs: {
    // Default to ./logs directory if not specified
    path: process.env.LOGS_PATH || path.join(process.cwd(), "logs"),
  },
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || "0.0.0.0",
  },
};

export default config;
