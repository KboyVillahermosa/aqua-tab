<!doctype html>
<html lang="en">

<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Server Error</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
            padding: 2rem;
        }

        pre {
            background: #f6f8fa;
            padding: 1rem;
            border-radius: 6px;
            overflow: auto
        }
    </style>
</head>

<body>
    <h1>Server Error</h1>
    <p>We're sorry — something went wrong on our end.</p>

    @if (config('app.debug'))
    <h2>Exception</h2>
    <p><strong>{{ get_class($exception) }}</strong>: {{ $exception->getMessage() }}</p>
    <h3>Stack trace</h3>
    <pre>{{ $exception->getTraceAsString() }}</pre>
    @else
    <p>Please contact the site administrator.</p>
    @endif
</body>

</html>