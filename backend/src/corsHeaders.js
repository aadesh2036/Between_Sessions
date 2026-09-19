/**
 * Between Sessions — Centralized CORS Policy & Origin Control
 * Strictly restricts production API access to authorized frontend origins.
 */

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'https://main.d22m0ipcsise4e.amplifyapp.com';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Content-Type': 'application/json',
};

module.exports = {
  ALLOWED_ORIGIN,
  CORS_HEADERS,
};
