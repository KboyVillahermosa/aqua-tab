<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Medication;

class MedicationPolicy
{
    public function view(User $user, Medication $medication)
    {
        return $user->id === $medication->user_id;
    }

    public function update(User $user, Medication $medication)
    {
        return $user->id === $medication->user_id;
    }

    public function delete(User $user, Medication $medication)
    {
        return $user->id === $medication->user_id;
    }
}
