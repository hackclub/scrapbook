const { config } = require("dotenv");

// load the environment variables
config({ quiet: true });

export const BASE_URL = process.env.APP_URL;
