// Netlify serverless function wrapper for the Express app.
// Placed inside backend/ so node_modules resolution works correctly.
process.env.IS_NETLIFY_FUNCTION = '1';

const serverless = require('serverless-http');
const app = require('../server');

module.exports.handler = serverless(app);
