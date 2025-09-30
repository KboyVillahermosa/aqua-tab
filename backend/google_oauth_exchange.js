// Example Node/Express endpoint to exchange Google authorization code for tokens
// Usage: POST /oauth/google with JSON body { code, redirect_uri }
// Install: npm install express node-fetch jsonwebtoken

const express = require('express');
const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

// Configure these from your Google Cloud Console
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

app.post('/oauth/google', async (req, res) => {
  try {
    const { code, redirect_uri } = req.body;
    if (!code || !redirect_uri) return res.status(400).json({ message: 'Missing code or redirect_uri' });

    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenRes.json();
    if (tokenData.error) return res.status(400).json(tokenData);

    // tokenData contains access_token, expires_in, id_token, refresh_token (maybe)
    const idToken = tokenData.id_token;
    if (!idToken) return res.status(400).json({ message: 'No id_token in token response' });

    // Verify id_token (basic verification). For production use the google-auth-library.
    const decoded = jwt.decode(idToken, { complete: true });

    // Basic checks
    if (!decoded) return res.status(400).json({ message: 'Invalid id_token' });
    const payload = decoded.payload;
    if (payload.aud !== CLIENT_ID) return res.status(400).json({ message: 'Invalid aud in id_token' });

    // At this point, you can lookup or create the user in your DB and issue a session token
    // Example session token (not secure): return the id_token directly or create your own JWT
    return res.json({ token: idToken, profile: { email: payload.email, name: payload.name } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log('Example Google exchange listening on', port));
}

module.exports = app;
