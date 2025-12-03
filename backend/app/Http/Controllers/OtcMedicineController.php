<?php

namespace App\Http\Controllers;

use App\Models\OtcMedicine;
use Illuminate\Http\Request;

class OtcMedicineController extends Controller
{
    /**
     * Search for medicines
     */
    public function search(Request $request)
    {
        $query = $request->input('query', '');

        if (empty($query)) {
            return response()->json([
                'medicines' => []
            ]);
        }

        $medicines = OtcMedicine::search($query, 20);

        return response()->json([
            'medicines' => $medicines
        ]);
    }

    /**
     * Get all medicines (optional)
     */
    public function index(Request $request)
    {
        $category = $request->input('category');
        $ageGroup = $request->input('age_group');

        $query = OtcMedicine::query();

        if ($category) {
            $query->where('category', $category);
        }

        if ($ageGroup) {
            $query->where('age_group', $ageGroup);
        }

        $medicines = $query->orderBy('is_popular', 'desc')
            ->orderBy('name', 'asc')
            ->paginate(50);

        return response()->json($medicines);
    }

    /**
     * Get a single medicine
     */
    public function show($id)
    {
        $medicine = OtcMedicine::findOrFail($id);
        return response()->json($medicine);
    }
}
