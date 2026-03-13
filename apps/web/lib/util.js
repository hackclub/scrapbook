const { config } = require("dotenv");

// load the environment variables
config();

export const BASE_URL = process.env.APP_URL;
