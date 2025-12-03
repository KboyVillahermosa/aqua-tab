<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$histories = \App\Models\MedicationHistory::latest()->take(10)->get(['id', 'medication_id', 'status', 'time', 'created_at']);

echo "Total history entries: " . \App\Models\MedicationHistory::count() . "\n";
echo "\nLatest 10 entries:\n";
echo "=====================================\n";

foreach ($histories as $h) {
    echo "ID: {$h->id} | Med ID: {$h->medication_id} | Status: {$h->status} | Time: {$h->time} | Created: {$h->created_at}\n";
}

echo "\n";
