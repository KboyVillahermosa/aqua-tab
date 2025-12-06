@extends('layouts.auth')

@section('title', 'Reset Password')

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
        <div class="w-full bg-slate-900/90 backdrop-blur-md rounded-3xl shadow-2xl p-6 border border-slate-700/50">

            <!-- Logo -->
            <div class="flex justify-center mb-6">
                <img src="{{ asset('images/mainlogo.png') }}" alt="Aqua Logo" class="h-16">
            </div>

            <h1 class="text-2xl font-bold text-white mb-1 text-center">Set New Password</h1>
            <p class="text-slate-300 text-sm text-center mb-6">Create a new password for your admin account</p>

            <!-- Error Messages -->
            @if ($errors->any())
            <div class="mb-4 p-3 bg-red-900/20 border border-red-600/30 rounded-lg flex items-start gap-2">
                <svg class="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 5.5H2m16 5H2m16 5H2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 9a1 1 0 11-2 0 1 1 0 012 0zm1 7a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
                </svg>
                <ul class="text-sm text-red-400 space-y-1">
                    @foreach ($errors->all() as $error)
                    <li>{{ $error }}</li>
                    @endforeach
                </ul>
            </div>
            @endif

            <form method="POST" action="{{ route('admin.password.update') }}" id="resetForm" class="space-y-4">
                @csrf

                <!-- Hidden Token and Email -->
                <input type="hidden" name="token" value="{{ $token }}">
                <input type="hidden" name="email" value="{{ $email ?? old('email') }}">

                <!-- Email Display (read-only) -->
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 w-10 flex items-center justify-center pointer-events-none">
                        <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <input type="email" id="email_display" value="{{ $email ?? old('email') }}" readonly
                        class="block w-full pl-14 pr-4 py-3 border border-gray-600 rounded-xl bg-slate-800 text-white cursor-not-allowed focus:outline-none text-sm">
                </div>

                <!-- New Password -->
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 w-10 flex items-center justify-center pointer-events-none">
                        <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <input type="password" id="password" name="password" required placeholder="••••••••"
                        class="block w-full pl-14 pr-12 py-3 border border-gray-600 rounded-xl bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                    <button type="button" id="togglePassword"
                        class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none">
                        <svg id="eyeOpen" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <svg id="eyeClosed" class="h-5 w-5 hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </button>
                </div>
                <p class="text-xs text-slate-400">Minimum 8 characters</p>

                <!-- Confirm Password -->
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 w-10 flex items-center justify-center pointer-events-none">
                        <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <input type="password" id="password_confirmation" name="password_confirmation" required placeholder="••••••••"
                        class="block w-full pl-14 pr-12 py-3 border border-gray-600 rounded-xl bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                    <button type="button" id="togglePasswordConfirmation"
                        class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none">
                        <svg id="eyeOpenConfirm" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <svg id="eyeClosedConfirm" class="h-5 w-5 hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </button>
                </div>

                <!-- Submit Button -->
                <button type="submit" id="submitBtn"
                    class="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-slate-900 transition-all transform hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed">
                    Reset Password
                </button>

                <!-- Back to Login -->
                <div class="text-center">
                    <a href="{{ route('admin.login') }}" class="text-sm text-blue-400 hover:text-blue-300 transition">
                        ← Back to Login
                    </a>
                </div>
            </form>
        </div>
    </div>

    <!-- Footer -->
    <div class="absolute bottom-0 left-0 right-0 py-4 text-center text-white/70 text-xs">
        <p>Aqua Admin Panel © {{ date('Y') }}</p>

    </div>
</div>

<script>
    // Toggle password visibility
    document.getElementById('togglePassword').addEventListener('click', function() {
        const passwordInput = document.getElementById('password');
        const eyeOpen = document.getElementById('eyeOpen');
        const eyeClosed = document.getElementById('eyeClosed');

        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            eyeOpen.classList.add('hidden');
            eyeClosed.classList.remove('hidden');
        } else {
            passwordInput.type = 'password';
            eyeOpen.classList.remove('hidden');
            eyeClosed.classList.add('hidden');
        }
    });

    // Toggle password confirmation visibility
    document.getElementById('togglePasswordConfirmation').addEventListener('click', function() {
        const passwordInput = document.getElementById('password_confirmation');
        const eyeOpen = document.getElementById('eyeOpenConfirm');
        const eyeClosed = document.getElementById('eyeClosedConfirm');

        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            eyeOpen.classList.add('hidden');
            eyeClosed.classList.remove('hidden');
        } else {
            passwordInput.type = 'password';
            eyeOpen.classList.remove('hidden');
            eyeClosed.classList.add('hidden');
        }
    });

    // Loading state on submit
    document.getElementById('resetForm').addEventListener('submit', function(e) {
        const btn = document.getElementById('submitBtn');
        btn.disabled = true;
        btn.classList.add('opacity-70');

        // Create spinner SVG
        const spinner = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        spinner.setAttribute('class', 'animate-spin h-5 w-5');
        spinner.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
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

        btn.innerHTML = '';
        btn.appendChild(spinner);

        const span = document.createElement('span');
        span.textContent = 'Resetting Password...';
        btn.appendChild(span);
    });
</script>
@endsection