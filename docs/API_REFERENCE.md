# API Reference

Rather than listing all the endpoints in a text document that quickly becomes out of date, **Sports Monitor** includes an interactive **Swagger UI** to explore and test the API directly from your browser!

## Accessing the Swagger UI

1. Start the local backend server (see the [Getting Started guide](GETTING_STARTED.md)).
2. Navigate your browser to: [http://localhost:3001/api-docs](http://localhost:3001/api-docs)

You should see a visual interface mapping out all the available API routes defined in our Express router.

## Testing Endpoints with Authentication

Several endpoints (like `/api/user/favorites`) require you to be authenticated. Follow these steps to test them in the Swagger UI:

1. **Create an account:** Find the `POST /api/auth/register` endpoint in Swagger. Fill out the request body with a demo email and password, then click "Execute".
2. **Login:** Find the `POST /api/auth/login` endpoint. Provide your email and password. Click "Execute".
3. **Copy the Token:** In the response body from the login request, find the `accessToken`. Copy it to your clipboard.
4. **Authorize:** Scroll to the top of the Swagger page and click the green **"Authorize"** button. Paste your token completely into the value box and click "Authorize".

You can now test all of the protected endpoints! Ensure your token begins with `eyJ` to be valid.
