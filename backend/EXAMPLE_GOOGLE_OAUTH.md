# Example Google OAuth exchange (Node)

This file accompanies `google_oauth_exchange.js` — a tiny Node/Express example showing how to exchange an authorization code for tokens with Google.

Environment variables required:
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- PORT (optional)

Install and run example:

```bash
cd backend
npm install express node-fetch jsonwebtoken
node google_oauth_exchange.js
```

POST to `/oauth/google` with JSON body:

```json
{ "code": "<authorization_code>", "redirect_uri": "https://auth.expo.io/@kboydev/app" }
```

The endpoint returns `id_token` and a simple `profile` object. Replace the session issuance logic with your own user/session management in production.

Laravel integration notes
-------------------------
If your backend is Laravel (this repo includes one), the `App\Http\Controllers\AuthController::google` method has been updated to accept either an `id_token` or a `{ code, redirect_uri }` POST and will exchange the code for tokens using `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` from your `.env`.

Make sure in your `backend/.env` you set:

```
GOOGLE_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

Then restart your PHP server (e.g., `php artisan serve`) and the existing `/api/oauth/google` route will handle the code exchange.
