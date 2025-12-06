@extends('layouts.auth')

@section('title', 'Forgot Password')

@section('content')
<style>
    /* Wave animations */
    @keyframes wave1 {

        0%,
        100% {
            d: path('M0,100 Q250,50 500,100 T1000,100 L1000,0 L0,0 Z');
        }

        50% {
            d: path('M0,120 Q250,40 500,120 T1000,120 L1000,0 L0,0 Z');
        }
    }

    @keyframes wave2 {

        0%,
        100% {
            d: path('M0,130 Q250,80 500,130 T1000,130 L1000,0 L0,0 Z');
        }

        50% {
            d: path('M0,110 Q250,60 500,110 T1000,110 L1000,0 L0,0 Z');
        }
    }

    @keyframes wave3 {

        0%,
        100% {
            d: path('M0,150 Q250,100 500,150 T1000,150 L1000,0 L0,0 Z');
        }

        50% {
            d: path('M0,130 Q250,80 500,130 T1000,130 L1000,0 L0,0 Z');
        }
    }

    @keyframes float {

        0%,
        100% {
            transform: translateY(0px);
        }

        50% {
            transform: translateY(-20px);
        }
    }

    .wave-container {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 300px;
        overflow: hidden;
    }

    .wave {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-size: 500px 120px;
    }

    .wave svg {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: auto;
    }

    .wave-1 {
        bottom: 0;
        opacity: 0.8;
    }

    .wave-1 path {
        animation: wave1 8s linear infinite;
        fill: rgba(30, 58, 138, 0.6);
    }

    .wave-2 {
        bottom: 20px;
        opacity: 0.6;
    }

    .wave-2 path {
        animation: wave2 10s linear infinite;
        fill: rgba(25, 45, 109, 0.5);
    }

    .wave-3 {
        bottom: 40px;
        opacity: 0.4;
    }

    .wave-3 path {
        animation: wave3 12s linear infinite;
        fill: rgba(20, 35, 80, 0.4);
    }

    .floating-shape {
        position: absolute;
        border-radius: 50%;
        animation: float 4s ease-in-out infinite;
        opacity: 0.25;
    }

    .shape-1 {
        width: 120px;
        height: 120px;
        background: rgba(99, 102, 241, 0.25);
        top: 20%;
        left: 10%;
        animation-delay: 0s;
    }

    .shape-2 {
        width: 80px;
        height: 80px;
        background: rgba(59, 130, 246, 0.2);
        top: 15%;
        right: 15%;
        animation-delay: 1s;
    }

    .shape-3 {
        width: 100px;
        height: 100px;
        background: rgba(37, 99, 235, 0.15);
        top: 50%;
        left: 5%;
        animation-delay: 2s;
    }

    .shape-4 {
        width: 90px;
        height: 90px;
        background: rgba(29, 78, 216, 0.2);
        bottom: 150px;
        right: 10%;
        animation-delay: 1.5s;
    }
</style>

<style>
    /* Autofill visibility fix for dark inputs */
    input:-webkit-autofill,
    input:-webkit-autofill:hover,
    input:-webkit-autofill:focus,
    textarea:-webkit-autofill,
    select:-webkit-autofill {
        -webkit-text-fill-color: #ffffff !important;
        caret-color: #ffffff !important;
        transition: background-color 5000s ease-in-out 0s;
        box-shadow: 0 0 0px 1000px rgba(30, 41, 59, 1) inset !important;
        /* slate-800 */
    }
</style>

<div class="fixed inset-0 z-50 bg-gradient-to-b from-blue-700 via-blue-800 to-blue-900 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">

    <!-- Wave Background -->
    <div class="wave-container">
        <div class="wave wave-1">
            <svg viewBox="0 0 1000 160" preserveAspectRatio="none">
                <path d="M0,100 Q250,50 500,100 T1000,100 L1000,0 L0,0 Z"></path>
            </svg>
        </div>
        <div class="wave wave-2">
            <svg viewBox="0 0 1000 160" preserveAspectRatio="none">
                <path d="M0,130 Q250,80 500,130 T1000,130 L1000,0 L0,0 Z"></path>
            </svg>
        </div>
        <div class="wave wave-3">
            <svg viewBox="0 0 1000 160" preserveAspectRatio="none">
                <path d="M0,150 Q250,100 500,150 T1000,150 L1000,0 L0,0 Z"></path>
            </svg>
        </div>
    </div>

    <!-- Floating shapes -->
    <div class="floating-shape shape-1"></div>
    <div class="floating-shape shape-2"></div>
    <div class="floating-shape shape-3"></div>
    <div class="floating-shape shape-4"></div>

    <div class="w-full max-w-sm relative z-10 flex-1 flex items-center">

        <!-- Form Card -->
        <div class="bg-slate-900/90 backdrop-blur-md rounded-3xl shadow-2xl p-6 border border-slate-700/50 w-full">

            <div class="text-center mb-6">
                <div class="flex justify-center mb-4">
                    <img src="{{ asset('images/mainlogo.png') }}" alt="AQUATAB Logo" class="h-20 w-auto">
                </div>
                <h1 class="text-2xl font-bold text-white tracking-tight">Reset Password</h1>
            </div>

            @if ($errors->any())
            <div class="mb-6 p-3 bg-red-900/20 border border-red-600/30 rounded-lg flex items-start gap-2">
                <svg class="w-5 h-5 text-red-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                    <h3 class="text-sm font-semibold text-red-300">Error</h3>
                    <p class="text-xs text-red-400 mt-1">
                        @foreach ($errors->all() as $error)
                        {{ $error }}<br>
                        @endforeach
                    </p>
                </div>
            </div>
            @endif

            @if (session('status'))
            <div class="mb-6 p-3 bg-green-900/20 border border-green-600/30 rounded-lg flex items-start gap-2">
                <svg class="w-5 h-5 text-green-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                    <h3 class="text-sm font-semibold text-green-300">Success</h3>
                    <p class="text-xs text-green-400 mt-1">{{ session('status') }}</p>
                </div>
            </div>
            @endif

            <form method="POST" action="{{ route('admin.password.email') }}" class="space-y-4">
                @csrf

                <!-- Email -->
                <div class="space-y-2">
                    <label for="email" class="text-sm font-semibold text-slate-200">Email Address</label>
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 w-10 flex items-center justify-center pointer-events-none">
                            <svg class="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <input type="email" id="email" name="email" value="{{ old('email') }}" required autofocus
                            placeholder="admin@aqua.com"
                            class="block w-full pl-14 pr-4 py-3 border border-gray-300 rounded-xl bg-white text-black placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm">
                    </div>
                    @error('email')
                    <p class="text-xs text-red-400 mt-1">{{ $message }}</p>
                    @enderror
                </div>

                <!-- Submit -->
                <button type="submit" id="submitBtn" class="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed">
                    <span id="submitText">Send Reset Link</span>
                </button>

                <!-- Back to Login -->
                <div class="text-center mt-6">
                    <a href="{{ route('admin.login') }}" class="text-sm text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                        ← Back to Login
                    </a>
                </div>
            </form>
        </div>
    </div>

    <!-- Footer -->
    <div class="absolute bottom-0 left-0 right-0 py-4 text-center text-white/70 text-xs">
        <p>&copy; 2025 AQUATAB Health Management System. All rights reserved.</p>
    </div>
</div>

<script>
    // Loading state on form submit
    (function() {
        const form = document.querySelector('form[action*="admin.password.email"]');
        const button = document.getElementById('submitBtn');
        const buttonText = document.getElementById('submitText');

        if (form && button && buttonText) {
            form.addEventListener('submit', function(e) {
                if (button.disabled) {
                    e.preventDefault();
                    return;
                }

                button.disabled = true;
                buttonText.textContent = 'Sending…';

                const spinner = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                spinner.setAttribute('class', 'animate-spin h-5 w-5 text-white');
                spinner.setAttribute('fill', 'none');
                spinner.setAttribute('viewBox', '0 0 24 24');

                const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circle.setAttribute('class', 'opacity-25');
                circle.setAttribute('cx', '12');
                circle.setAttribute('cy', '12');
                circle.setAttribute('r', '10');
                circle.setAttribute('stroke', 'currentColor');
                circle.setAttribute('stroke-width', '4');

                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path.setAttribute('class', 'opacity-75');
                path.setAttribute('fill', 'currentColor');
                path.setAttribute('d', 'M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z');

                spinner.appendChild(circle);
                spinner.appendChild(path);

                button.insertBefore(spinner, buttonText);
            });
        }
    })();
</script>
@endsection