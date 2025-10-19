<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HydrationEntry extends Model
{
    use HasFactory;
    protected $table = 'hydration_entries';
    protected $fillable = ['user_id', 'amount_ml', 'source', 'created_at'];
    public $timestamps = false;

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
