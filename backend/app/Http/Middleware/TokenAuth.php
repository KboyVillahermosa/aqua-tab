<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class TokenAuth
{
    public function handle(Request $request, Closure $next)
    {
        $header = $request->header('Authorization');
        Log::debug('TokenAuth: incoming Authorization header', ['header' => $header]);
        if (!$header || !str_starts_with($header, 'Bearer ')) {
            Log::debug('TokenAuth: no bearer header, unauthorized');
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $token = substr($header, 7);
        $hashed = hash('sha256', $token);
        Log::debug('TokenAuth: token hashed for lookup', ['hashed' => $hashed]);
        $user = User::where('api_token', $hashed)->first();
        if (!$user) {
            Log::debug('TokenAuth: no user matches token', ['hashed' => $hashed]);
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // set the user on the request so controllers can access via $request->user()
        $request->setUserResolver(function () use ($user) {
            return $user;
        });
        Log::debug('TokenAuth: user resolved from token', ['user_id' => $user->id]);

        return $next($request);
    }
}
