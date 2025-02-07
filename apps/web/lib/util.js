const { config } = require("dotenv");

// load the environment variables
config();

export const isDevDeployment = (path) => !path.includes("hackclub.dev") && path != 'scrapbook.hackclub.com';
export const BASE_URL = process.env.APP_URL;
