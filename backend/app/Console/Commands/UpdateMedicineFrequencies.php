<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class UpdateMedicineFrequencies extends Command
{
    protected $signature = 'medicines:update-frequencies';
    protected $description = 'Update medicine frequencies based on dosage patterns';

    public function handle()
    {
        // Four times daily (every 6 hours)
        DB::table('otc_medicines')
            ->where('dosage', 'LIKE', '%6 hours%')
            ->update(['frequency' => 'four_times_daily']);

        // Three times daily (every 8 hours)
        DB::table('otc_medicines')
            ->where('dosage', 'LIKE', '%8 hours%')
            ->update(['frequency' => 'three_times_daily']);

        // Twice daily (every 12 hours)
        DB::table('otc_medicines')
            ->where('dosage', 'LIKE', '%12 hours%')
            ->update(['frequency' => 'twice_daily']);

        // Three times daily (3 times)
        DB::table('otc_medicines')
            ->where('dosage', 'LIKE', '%3 times%')
            ->update(['frequency' => 'three_times_daily']);

        // As needed
        DB::table('otc_medicines')
            ->where('dosage', 'LIKE', '%as needed%')
            ->orWhere('dosage', 'LIKE', '%when needed%')
            ->update(['frequency' => 'as_needed']);

        // Default: once daily
        DB::table('otc_medicines')
            ->whereNull('frequency')
            ->update(['frequency' => 'once_daily']);

        $this->info('Medicine frequencies updated successfully!');
        return 0;
    }
}
