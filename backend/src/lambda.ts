import serverless from 'serverless-http';
import app from './index.js';

// The serverless-http adapter wraps the existing Express app (`app`)
// and maps the AWS API Gateway Proxy Events (HTTP requests)
// directly to Express req/res objects transparently.

export const handler = serverless(app);
