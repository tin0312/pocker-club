import serverless from "serverless-http";
import app from "./utils/index"

// Export the handler for serverless deployment
export const handler = serverless(app);