<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title', 'Aqua Admin')</title>

    <script>
        tailwind.config = {
          theme: {
            extend: {
              colors: {
                aqua: '#1E3A8A',
                'aqua-light': '#3B82F6'
              }
            }
          }
        }
    </script>
    <script src="https://cdn.tailwindcss.com"></script>

  <style>
    /* Fallback styles used if Tailwind CDN fails to load (keeps layout usable offline) */
    html,body{height:100%;}
    body { margin:0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .card { background:#fff; border-radius:12px; box-shadow:0 10px 20px rgba(2,6,23,0.08); border:1px solid #E5E7EB; }
    .text-aqua { color: #1E3A8A; }
    .bg-aqua { background: linear-gradient(90deg,#1E3A8A,#3B82F6); color: #fff; }
    input[type="email"], input[type="password"], input, textarea, select { width:100%; padding:10px 12px; border:1px solid #D1D5DB; border-radius:8px; background:#F9FAFB; box-sizing:border-box; }
    input:focus { outline: none; border-color: #1E3A8A; background:#fff; }
    button { cursor:pointer; }
  </style>
</head>
<body class="min-h-screen bg-gradient-to-br from-aqua to-aqua-light text-gray-900">
    <div class="min-h-screen flex items-center justify-center p-6">
        <div class="w-full max-w-md">
            @yield('content')
        </div>
    </div>
</body>
</html>
