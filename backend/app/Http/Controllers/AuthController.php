<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http as HttpClient;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'], // hashed via cast in model
        ]);

        // simple token
        $token = Str::random(60);
        $user->forceFill(['api_token' => hash('sha256', $token)])->save();

        return response()->json(['token' => $token, 'user' => $user], 201);
    }

    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $data['email'])->first();

        if (!$user || !\Hash::check($data['password'], $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $token = Str::random(60);
        $user->forceFill(['api_token' => hash('sha256', $token)])->save();

        return response()->json(['token' => $token, 'user' => $user]);
    }

    public function logout(Request $request)
    {
        $user = $request->user();
        if ($user) {
            $user->forceFill(['api_token' => null])->save();
        }
        return response()->json(['message' => 'Logged out']);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    // Accepts either { id_token: '...' } or { code: '...', redirect_uri: '...' }
    // If a code is provided we exchange it server-side for tokens, then verify id_token.
    public function google(Request $request)
    {
        $data = $request->validate([
            'id_token' => 'sometimes|string',
            'code' => 'sometimes|string',
            'redirect_uri' => 'sometimes|string',
        ]);

        $idToken = $data['id_token'] ?? null;

        // If a code was sent, exchange it for tokens at Google's token endpoint
        if (empty($idToken) && !empty($data['code'])) {
            if (empty(env('GOOGLE_CLIENT_ID')) || empty(env('GOOGLE_CLIENT_SECRET'))) {
                return response()->json(['message' => 'Server not configured with Google client credentials'], 500);
            }

            $tokenResp = HttpClient::asForm()->post('https://oauth2.googleapis.com/token', [
                'code' => $data['code'],
                'client_id' => env('GOOGLE_CLIENT_ID'),
                'client_secret' => env('GOOGLE_CLIENT_SECRET'),
                // Use a trusted redirect URI from env (must match the one you registered)
                'redirect_uri' => env('GOOGLE_REDIRECT_URI', $data['redirect_uri'] ?? ''),
                'grant_type' => 'authorization_code',
            ]);

            if ($tokenResp->failed()) {
                return response()->json(['message' => 'Failed to exchange code with Google', 'error' => $tokenResp->body()], 400);
            }

            $tokenData = $tokenResp->json();
            $idToken = $tokenData['id_token'] ?? null;
            if (empty($idToken)) {
                return response()->json(['message' => 'No id_token returned from Google'], 400);
            }
        }

        if (empty($idToken)) {
            return response()->json(['message' => 'No id_token or code provided'], 400);
        }

        // Verify the id_token with Google
        $resp = HttpClient::get('https://oauth2.googleapis.com/tokeninfo', ['id_token' => $idToken]);
        if ($resp->failed()) {
            return response()->json(['message' => 'Invalid Google token'], 400);
        }
        $payload = $resp->json();

        // ensure audience matches
        if (($payload['aud'] ?? '') !== env('GOOGLE_CLIENT_ID')) {
            return response()->json(['message' => 'Invalid Google client'], 400);
        }

        $email = $payload['email'] ?? null;
        $name = $payload['name'] ?? ($payload['email'] ?? 'User');
        if (!$email) return response()->json(['message' => 'Google token missing email'], 400);

        $user = User::firstOrCreate(['email' => $email], ['name' => $name, 'password' => Str::random(32)]);

        $token = Str::random(60);
        $user->forceFill(['api_token' => hash('sha256', $token)])->save();

        return response()->json(['token' => $token, 'user' => $user]);
    }
}
