@extends('layouts.auth')

@section('title', 'Admin Login')

@section('content')
<style>
    /* Floating Animations */
    .pill-decor {
        position: absolute;
        border-radius: 50px;
        opacity: 0.15;
        animation: float 20s ease-in-out infinite;
        filter: blur(60px);
        /* Enhanced blur for softer glow */
    }

    .water-drop {
        position: absolute;
        border-radius: 50%;
        opacity: 0.15;
        animation: float 15s ease-in-out infinite;
        filter: blur(50px);
        /* Enhanced blur */
    }

    @keyframes float {

        0%,
        100% {
            transform: translateY(0px) rotate(0deg) scale(1);
        }

        33% {
            transform: translateY(-30px) rotate(120deg) scale(1.1);
        }

        66% {
            transform: translateY(-15px) rotate(240deg) scale(0.95);
        }
    }

    .pill-decor:nth-child(1) {
        animation: float 25s ease-in-out infinite 0s;
    }

    .pill-decor:nth-child(2) {
        animation: floatReverse 30s ease-in-out infinite 2s;
    }

    .water-drop:nth-child(3) {
        animation: floatDiagonal 28s ease-in-out infinite 1s;
    }

    .water-drop:nth-child(4) {
        animation: floatReverse 32s ease-in-out infinite 3s;
    }

    @keyframes floatReverse {

        0%,
        100% {
            transform: translateY(0px) rotate(0deg) scale(1);
        }

        33% {
            transform: translateY(30px) rotate(-120deg) scale(0.9);
        }

        66% {
            transform: translateY(15px) rotate(-240deg) scale(1.05);
        }
    }

    @keyframes floatDiagonal {

        0%,
        100% {
            transform: translate(0px, 0px) rotate(0deg) scale(1);
        }

        25% {
            transform: translate(20px, -25px) rotate(90deg) scale(1.1);
        }

        50% {
            transform: translate(-15px, -40px) rotate(180deg) scale(0.95);
        }

        75% {
            transform: translate(-20px, -15px) rotate(270deg) scale(1.05);
        }
    }
</style>

<div class="fixed inset-0 z-50 bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900 flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">

    <div class="pill-decor bg-blue-400" style="width: 350px; height: 180px; top: -5%; right: 5%;"></div>
    <div class="water-drop bg-blue-300" style="width: 450px; height: 450px; bottom: -5%; left: -8%;"></div>
    <div class="water-drop bg-blue-400" style="width: 280px; height: 280px; top: 20%; right: -5%; animation-delay: 5s;"></div>
    <div class="pill-decor bg-blue-300" style="width: 200px; height: 100px; top: 50%; left: -3%; animation-delay: 2s;"></div>
    <div class="water-drop bg-blue-500" style="width: 320px; height: 320px; bottom: 10%; right: 15%; animation-delay: 4s;"></div>
    <div class="pill-decor bg-blue-400" style="width: 160px; height: 80px; top: 70%; right: 20%; animation-delay: 6s;"></div>

    <div class="w-full max-w-md relative z-10">

        <div class="text-center mb-10">
            <div class="inline-flex items-center justify-center mb-6 p-4 rounded-full bg-blue-800/50 backdrop-blur-sm shadow-xl ring-1 ring-blue-700/50">
                <img src="{{ asset('images/mainlogo.png') }}" alt="AQUATAB Logo" class="h-20 w-auto drop-shadow-md">
            </div>
            <h1 class="text-3xl font-bold text-white tracking-tight">AQUATAB Admin</h1>
            <p class="text-blue-200 mt-2 text-sm font-medium">Health Management System</p>
        </div>

        @if ($errors->any())
        <div class="mb-6 p-4 bg-red-500/10 backdrop-blur-md border border-red-500/20 rounded-xl flex items-start gap-3">
            <svg class="w-5 h-5 text-red-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
                <h3 class="text-sm font-semibold text-red-400">Login Failed</h3>
                <p class="text-xs text-red-300 mt-1">{{ $errors->first() }}</p>
            </div>
        </div>
        @endif

        @if (session('status'))
        <div class="mb-6 p-4 bg-green-500/10 backdrop-blur-md border border-green-500/20 rounded-xl flex items-start gap-3">
            <svg class="w-5 h-5 text-green-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
                <h3 class="text-sm font-semibold text-green-400">Success</h3>
                <p class="text-xs text-green-300 mt-1">{{ session('status') }}</p>
            </div>
        </div>
        @endif

        @if (session('error'))
        <div class="mb-6 p-4 bg-red-500/10 backdrop-blur-md border border-red-500/20 rounded-xl flex items-start gap-3">
            <svg class="w-5 h-5 text-red-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
                <h3 class="text-sm font-semibold text-red-400">Error</h3>
                <p class="text-xs text-red-300 mt-1">{{ session('error') }}</p>
            </div>
        </div>
        @endif

        <div class="bg-transparent p-2">
            <form method="POST" action="{{ route('admin.login') }}" class="space-y-5">
                @csrf

                <div class="space-y-2">
                    <label for="email" class="text-sm font-medium text-blue-100 ml-1">Email Address</label>
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg class="h-5 w-5 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <input type="email" id="email" name="email" value="{{ old('email') }}" required autofocus placeholder="admin@aqua.com"
                            class="block w-full pl-10 pr-3 py-3 border border-blue-600/50 rounded-xl leading-5 bg-blue-900/40 text-white placeholder-blue-300/60 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:bg-blue-900/60 transition duration-150 ease-in-out sm:text-sm">
                    </div>
                    @error('email')
                    <p class="text-xs text-red-300 mt-1">{{ $message }}</p>
                    @enderror
                </div>

                <div class="space-y-2">
                    <label for="password" class="text-sm font-medium text-blue-100 ml-1">Password</label>
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg class="h-5 w-5 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <input type="password" id="password" name="password" required placeholder="••••••••"
                            class="block w-full pl-10 pr-3 py-3 border border-blue-600/50 rounded-xl leading-5 bg-blue-900/40 text-white placeholder-blue-300/60 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:bg-blue-900/60 transition duration-150 ease-in-out sm:text-sm">
                    </div>
                    @error('password')
                    <p class="text-xs text-red-300 mt-1">{{ $message }}</p>
                    @enderror
                </div>

                <button type="submit" class="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-500 hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-900 focus:ring-blue-400 transition-all transform hover:-translate-y-0.5">
                    Sign In to Dashboard
                </button>
            </form>
        </div>

        <div class="mt-8 text-center">
            <div class="inline-block px-6 py-3 rounded-lg border border-blue-600/50 bg-blue-900/40 backdrop-blur-sm">
                <p class="text-xs font-bold text-blue-200 uppercase tracking-widest mb-2">Demo Access</p>
                <div class="flex items-center justify-center gap-6 text-sm text-blue-100">
                    <span>admin@aqua.com</span>
                    <span class="w-1 h-1 rounded-full bg-blue-400"></span>
                    <span>admin123</span>
                </div>
            </div>
        </div>

    </div>
</div>
@endsection