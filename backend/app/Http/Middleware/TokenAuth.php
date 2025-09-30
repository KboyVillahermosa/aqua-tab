<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\User;

class TokenAuth
{
    public function handle(Request $request, Closure $next)
    {
        $header = $request->header('Authorization');
        if (!$header || !str_starts_with($header, 'Bearer ')) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $token = substr($header, 7);
        $hashed = hash('sha256', $token);
        $user = User::where('api_token', $hashed)->first();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // set the user on the request so controllers can access via $request->user()
        $request->setUserResolver(function () use ($user) {
            return $user;
        });

        return $next($request);
    }
}
