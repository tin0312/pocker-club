import serverless from "serverless-http";
import app from "../../src/index.mts"

// Export the handler for serverless deployment
export const handler = serverless(app);