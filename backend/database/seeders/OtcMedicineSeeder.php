<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\OtcMedicine;

class OtcMedicineSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $medicines = $this->getMedicines();

        foreach ($medicines as $medicine) {
            OtcMedicine::create($medicine);
        }
    }

    private function getMedicines()
    {
        return [
            // Pain Relievers
            ['name' => 'Biogesic', 'generic_name' => 'Paracetamol', 'brand' => 'Biogesic', 'category' => 'Pain Relief', 'age_group' => 'All', 'description' => 'For fever and pain relief', 'dosage' => '500mg every 6 hours', 'is_popular' => true],
            ['name' => 'Paracetamol', 'generic_name' => 'Paracetamol', 'brand' => null, 'category' => 'Pain Relief', 'age_group' => 'All', 'description' => 'Generic pain reliever', 'dosage' => '500mg every 6 hours', 'is_popular' => true],
            ['name' => 'Medicol', 'generic_name' => 'Ibuprofen', 'brand' => 'Medicol', 'category' => 'Pain Relief', 'age_group' => 'Adults', 'description' => 'Anti-inflammatory pain reliever', 'dosage' => '200-400mg every 6-8 hours', 'is_popular' => true],
            ['name' => 'Mefenamic Acid', 'generic_name' => 'Mefenamic Acid', 'brand' => null, 'category' => 'Pain Relief', 'age_group' => 'Adults', 'description' => 'For moderate to severe pain', 'dosage' => '500mg every 8 hours', 'is_popular' => true],
            ['name' => 'Advil', 'generic_name' => 'Ibuprofen', 'brand' => 'Advil', 'category' => 'Pain Relief', 'age_group' => 'Adults', 'description' => 'Fast-acting pain relief', 'dosage' => '200-400mg every 4-6 hours', 'is_popular' => true],
            ['name' => 'Alaxan FR', 'generic_name' => 'Ibuprofen + Paracetamol', 'brand' => 'Alaxan', 'category' => 'Pain Relief', 'age_group' => 'Adults', 'description' => 'Fast relief for headache, toothache, muscle pain', 'dosage' => '1 capsule every 6 hours', 'is_popular' => true],
            ['name' => 'Tempra', 'generic_name' => 'Paracetamol', 'brand' => 'Tempra', 'category' => 'Pain Relief', 'age_group' => 'Kids', 'description' => 'Fever and pain relief for children', 'dosage' => 'Based on weight and age', 'is_popular' => true],
            ['name' => 'Dolfenal', 'generic_name' => 'Mefenamic Acid', 'brand' => 'Dolfenal', 'category' => 'Pain Relief', 'age_group' => 'Adults', 'description' => 'For headache and body pains', 'dosage' => '500mg every 8 hours', 'is_popular' => true],
            ['name' => 'Ponstan', 'generic_name' => 'Mefenamic Acid', 'brand' => 'Ponstan', 'category' => 'Pain Relief', 'age_group' => 'Adults', 'description' => 'For moderate pain relief', 'dosage' => '500mg every 8 hours', 'is_popular' => true],
            ['name' => 'Nafarin', 'generic_name' => 'Naproxen Sodium', 'brand' => 'Nafarin', 'category' => 'Pain Relief', 'age_group' => 'Adults', 'description' => 'For pain and inflammation', 'dosage' => '220-550mg every 12 hours', 'is_popular' => true],

            // Cough & Cold  
            ['name' => 'Neozep', 'generic_name' => 'Phenylephrine + Paracetamol', 'brand' => 'Neozep', 'category' => 'Cough & Cold', 'age_group' => 'Adults', 'description' => 'For relief of colds and flu symptoms', 'dosage' => '1 tablet every 6 hours', 'is_popular' => true],
            ['name' => 'Bioflu', 'generic_name' => 'Phenylephrine + Chlorphenamine + Paracetamol', 'brand' => 'Bioflu', 'category' => 'Cough & Cold', 'age_group' => 'Adults', 'description' => 'Complete flu relief', 'dosage' => '1 tablet every 6 hours', 'is_popular' => true],
            ['name' => 'Decolgen', 'generic_name' => 'Phenylephrine + Chlorphenamine + Paracetamol', 'brand' => 'Decolgen', 'category' => 'Cough & Cold', 'age_group' => 'Adults', 'description' => 'Relieves cold symptoms', 'dosage' => '1 tablet every 6 hours', 'is_popular' => true],
            ['name' => 'Tuseran Forte', 'generic_name' => 'Dextromethorphan + Phenylephrine + Paracetamol', 'brand' => 'Tuseran', 'category' => 'Cough & Cold', 'age_group' => 'Adults', 'description' => 'For dry cough and cold symptoms', 'dosage' => '1 capsule every 6 hours', 'is_popular' => true],
            ['name' => 'Solmux', 'generic_name' => 'Carbocisteine', 'brand' => 'Solmux', 'category' => 'Cough & Cold', 'age_group' => 'Adults', 'description' => 'Mucus reliever for wet cough', 'dosage' => '500mg 3 times daily', 'is_popular' => true],
            ['name' => 'Solmux Kids', 'generic_name' => 'Carbocisteine', 'brand' => 'Solmux', 'category' => 'Cough & Cold', 'age_group' => 'Kids', 'description' => 'Mucus reliever for children', 'dosage' => 'Based on age', 'is_popular' => true],
            ['name' => 'Ambrolex', 'generic_name' => 'Ambroxol', 'brand' => 'Ambrolex', 'category' => 'Cough & Cold', 'age_group' => 'All', 'description' => 'Helps loosen mucus', 'dosage' => '30mg 3 times daily', 'is_popular' => true],
            ['name' => 'Robitussin', 'generic_name' => 'Dextromethorphan', 'brand' => 'Robitussin', 'category' => 'Cough & Cold', 'age_group' => 'All', 'description' => 'Cough suppressant', 'dosage' => 'As directed on label', 'is_popular' => true],
            ['name' => 'Ascof Lagundi', 'generic_name' => 'Lagundi', 'brand' => 'Ascof', 'category' => 'Cough & Cold', 'age_group' => 'Adults', 'description' => 'Herbal cough remedy', 'dosage' => '600mg 3 times daily', 'is_popular' => true],
            ['name' => 'Ascof Lagundi Kids', 'generic_name' => 'Lagundi', 'brand' => 'Ascof', 'category' => 'Cough & Cold', 'age_group' => 'Kids', 'description' => 'Herbal cough remedy for children', 'dosage' => 'Based on age', 'is_popular' => true],
            ['name' => 'Strepsils', 'generic_name' => 'Amylmetacresol + Dichlorobenzyl alcohol', 'brand' => 'Strepsils', 'category' => 'Cough & Cold', 'age_group' => 'Adults', 'description' => 'Throat lozenges for sore throat', 'dosage' => '1 lozenge every 2-3 hours', 'is_popular' => true],
            ['name' => 'Mucotussin', 'generic_name' => 'Guaifenesin', 'brand' => 'Mucotussin', 'category' => 'Cough & Cold', 'age_group' => 'All', 'description' => 'Expectorant for productive cough', 'dosage' => 'As directed on label', 'is_popular' => true],
            ['name' => 'Bactidol', 'generic_name' => 'Hexetidine', 'brand' => 'Bactidol', 'category' => 'Cough & Cold', 'age_group' => 'Adults', 'description' => 'Antibacterial gargle for sore throat', 'dosage' => 'Gargle 15ml for 30 seconds', 'is_popular' => true],
            ['name' => 'Vicks VapoRub', 'generic_name' => 'Camphor + Menthol + Eucalyptus', 'brand' => 'Vicks', 'category' => 'Cough & Cold', 'age_group' => 'All', 'description' => 'Topical cough suppressant', 'dosage' => 'Apply to chest and throat', 'is_popular' => true],
            ['name' => 'Sudafed', 'generic_name' => 'Pseudoephedrine', 'brand' => 'Sudafed', 'category' => 'Cough & Cold', 'age_group' => 'Adults', 'description' => 'Nasal decongestant', 'dosage' => '60mg every 4-6 hours', 'is_popular' => true],

            // Digestive
            ['name' => 'Kremil-S', 'generic_name' => 'Aluminum Hydroxide + Magnesium Hydroxide + Simeticone', 'brand' => 'Kremil-S', 'category' => 'Digestive', 'age_group' => 'Adults', 'description' => 'For hyperacidity and heartburn', 'dosage' => '1-2 tablets after meals', 'is_popular' => true],
            ['name' => 'Gaviscon', 'generic_name' => 'Sodium Alginate + Potassium Bicarbonate', 'brand' => 'Gaviscon', 'category' => 'Digestive', 'age_group' => 'Adults', 'description' => 'For heartburn and indigestion', 'dosage' => '10-20ml after meals', 'is_popular' => true],
            ['name' => 'Diatabs', 'generic_name' => 'Loperamide', 'brand' => 'Diatabs', 'category' => 'Digestive', 'age_group' => 'Adults', 'description' => 'For acute diarrhea', 'dosage' => '2mg after each loose stool', 'is_popular' => true],
            ['name' => 'Imodium', 'generic_name' => 'Loperamide', 'brand' => 'Imodium', 'category' => 'Digestive', 'age_group' => 'Adults', 'description' => 'Anti-diarrheal', 'dosage' => '2mg after each loose stool', 'is_popular' => true],
            ['name' => 'Buscopan', 'generic_name' => 'Hyoscine Butylbromide', 'brand' => 'Buscopan', 'category' => 'Digestive', 'age_group' => 'Adults', 'description' => 'For stomach cramps and pain', 'dosage' => '10mg 3 times daily', 'is_popular' => true],
            ['name' => 'Hydrite', 'generic_name' => 'Oral Rehydration Salts', 'brand' => 'Hydrite', 'category' => 'Digestive', 'age_group' => 'All', 'description' => 'Rehydration solution for diarrhea', 'dosage' => 'As needed for hydration', 'is_popular' => true],
            ['name' => 'Smecta', 'generic_name' => 'Diosmectite', 'brand' => 'Smecta', 'category' => 'Digestive', 'age_group' => 'All', 'description' => 'For acute and chronic diarrhea', 'dosage' => '1 sachet 3 times daily', 'is_popular' => true],
            ['name' => 'Dulcolax', 'generic_name' => 'Bisacodyl', 'brand' => 'Dulcolax', 'category' => 'Digestive', 'age_group' => 'Adults', 'description' => 'Laxative for constipation', 'dosage' => '5-10mg at bedtime', 'is_popular' => true],
            ['name' => 'Lactezin', 'generic_name' => 'Lactoferrin + Vitamin E + Zinc', 'brand' => 'Lactezin', 'category' => 'Digestive', 'age_group' => 'Teens', 'description' => 'For acne management', 'dosage' => '1 capsule twice daily', 'is_popular' => true],
            ['name' => 'Erceflora', 'generic_name' => 'Bacillus clausii', 'brand' => 'Erceflora', 'category' => 'Digestive', 'age_group' => 'All', 'description' => 'Probiotic for diarrhea and gut health', 'dosage' => '1 bottle daily', 'is_popular' => true],

            // Wound Care & Topicals
            ['name' => 'Betadine', 'generic_name' => 'Povidone Iodine', 'brand' => 'Betadine', 'category' => 'Wound Care', 'age_group' => 'All', 'description' => 'Antiseptic for wounds and cuts', 'dosage' => 'Apply to affected area', 'is_popular' => true],
            ['name' => 'Efficascent Oil', 'generic_name' => 'Methyl Salicylate + Menthol + Camphor', 'brand' => 'Efficascent', 'category' => 'Topical', 'age_group' => 'All', 'description' => 'For body aches and muscle pain', 'dosage' => 'Apply and massage affected area', 'is_popular' => true],
            ['name' => 'Tiger Balm', 'generic_name' => 'Camphor + Menthol', 'brand' => 'Tiger Balm', 'category' => 'Topical', 'age_group' => 'All', 'description' => 'For muscle and joint pain', 'dosage' => 'Apply to affected area', 'is_popular' => true],
            ['name' => 'Katinko', 'generic_name' => 'Menthol + Camphor', 'brand' => 'Katinko', 'category' => 'Topical', 'age_group' => 'All', 'description' => 'Relieves headache and muscle pain', 'dosage' => 'Apply to temples or affected area', 'is_popular' => true],
            ['name' => 'Zonrox Bleach', 'generic_name' => 'Sodium Hypochlorite', 'brand' => 'Zonrox', 'category' => 'Wound Care', 'age_group' => 'All', 'description' => 'Diluted for wound cleaning', 'dosage' => 'Dilute and use externally only', 'is_popular' => false],
            ['name' => 'Salonpas', 'generic_name' => 'Methyl Salicylate + Menthol', 'brand' => 'Salonpas', 'category' => 'Topical', 'age_group' => 'Adults', 'description' => 'Pain relief patch', 'dosage' => 'Apply patch to affected area', 'is_popular' => true],
            ['name' => 'Omega Pain Killer', 'generic_name' => 'Methyl Salicylate', 'brand' => 'Omega', 'category' => 'Topical', 'age_group' => 'Adults', 'description' => 'Topical pain relief', 'dosage' => 'Apply to affected area', 'is_popular' => true],

            // Adult Vitamins
            ['name' => 'Centrum', 'generic_name' => 'Multivitamins + Minerals', 'brand' => 'Centrum', 'category' => 'Vitamins', 'age_group' => 'Adults', 'description' => 'Complete multivitamin for adults', 'dosage' => '1 tablet daily', 'is_popular' => true],
            ['name' => 'Enervon', 'generic_name' => 'Multivitamins + Minerals', 'brand' => 'Enervon', 'category' => 'Vitamins', 'age_group' => 'Adults', 'description' => 'Energy multivitamins', 'dosage' => '1 tablet daily', 'is_popular' => true],
            ['name' => 'Revicon Forte', 'generic_name' => 'Multivitamins + Minerals', 'brand' => 'Revicon', 'category' => 'Vitamins', 'age_group' => 'Adults', 'description' => 'For energy and stamina', 'dosage' => '1 capsule daily', 'is_popular' => true],
            ['name' => 'Berocca', 'generic_name' => 'B Complex + Vitamin C + Zinc', 'brand' => 'Berocca', 'category' => 'Vitamins', 'age_group' => 'Adults', 'description' => 'Energy and immunity booster', 'dosage' => '1 tablet daily', 'is_popular' => true],
            ['name' => 'Fern-C', 'generic_name' => 'Vitamin C + Zinc', 'brand' => 'Fern-C', 'category' => 'Vitamins', 'age_group' => 'All', 'description' => 'Sodium ascorbate for immunity', 'dosage' => '1 capsule daily', 'is_popular' => true],
            ['name' => 'Cecon', 'generic_name' => 'Vitamin C', 'brand' => 'Cecon', 'category' => 'Vitamins', 'age_group' => 'All', 'description' => 'Ascorbic acid supplement', 'dosage' => '500mg daily', 'is_popular' => true],
            ['name' => 'B Complex', 'generic_name' => 'B Vitamins', 'brand' => null, 'category' => 'Vitamins', 'age_group' => 'Adults', 'description' => 'For energy metabolism', 'dosage' => '1 tablet daily', 'is_popular' => true],
            ['name' => 'Conzace', 'generic_name' => 'Vitamin A + C + E + Zinc', 'brand' => 'Conzace', 'category' => 'Vitamins', 'age_group' => 'Adults', 'description' => 'For healthy skin and immunity', 'dosage' => '1 capsule daily', 'is_popular' => true],
            ['name' => 'Pharmaton', 'generic_name' => 'Multivitamins + Ginseng', 'brand' => 'Pharmaton', 'category' => 'Vitamins', 'age_group' => 'Adults', 'description' => 'Energy and vitality supplement', 'dosage' => '1 capsule daily', 'is_popular' => true],
            ['name' => 'Stresstabs', 'generic_name' => 'B Complex + Vitamin C + E', 'brand' => 'Stresstabs', 'category' => 'Vitamins', 'age_group' => 'Adults', 'description' => 'For stress and energy', 'dosage' => '1 tablet daily', 'is_popular' => true],
            ['name' => 'Poten-Cee', 'generic_name' => 'Vitamin C + Zinc', 'brand' => 'Poten-Cee', 'category' => 'Vitamins', 'age_group' => 'All', 'description' => 'Immunity booster', 'dosage' => '1 tablet daily', 'is_popular' => true],
            ['name' => 'Myra E', 'generic_name' => 'Vitamin E', 'brand' => 'Myra', 'category' => 'Vitamins', 'age_group' => 'Adults', 'description' => 'For healthy skin', 'dosage' => '1 capsule daily', 'is_popular' => true],
            ['name' => 'Immunpro', 'generic_name' => 'Vitamin C + Zinc + CM Glucan', 'brand' => 'Immunpro', 'category' => 'Vitamins', 'age_group' => 'All', 'description' => 'Immunity support', 'dosage' => '1 capsule daily', 'is_popular' => true],

            // Teen Vitamins
            ['name' => 'Growee Teens', 'generic_name' => 'Multivitamins + Minerals + Chlorella', 'brand' => 'Growee', 'category' => 'Vitamins', 'age_group' => 'Teens', 'description' => 'Growth vitamins for teenagers', 'dosage' => '2 capsules daily', 'is_popular' => true],
            ['name' => 'Cherifer Premium', 'generic_name' => 'CGF + Taurine + Zinc', 'brand' => 'Cherifer', 'category' => 'Vitamins', 'age_group' => 'Teens', 'description' => 'Height and growth supplement', 'dosage' => '1 capsule daily', 'is_popular' => true],
            ['name' => 'Centrum for Teens', 'generic_name' => 'Multivitamins + Minerals', 'brand' => 'Centrum', 'category' => 'Vitamins', 'age_group' => 'Teens', 'description' => 'Complete nutrition for teens', 'dosage' => '1 tablet daily', 'is_popular' => true],
            ['name' => 'Enervon Prime', 'generic_name' => 'Multivitamins + Minerals', 'brand' => 'Enervon', 'category' => 'Vitamins', 'age_group' => 'Teens', 'description' => 'Energy for active teens', 'dosage' => '1 tablet daily', 'is_popular' => true],
            ['name' => 'Propan TLC', 'generic_name' => 'Lysine + Vitamins', 'brand' => 'Propan', 'category' => 'Vitamins', 'age_group' => 'Teens', 'description' => 'For appetite and growth', 'dosage' => '1 capsule twice daily', 'is_popular' => true],

            // Kids Vitamins
            ['name' => 'Cherifer Drops', 'generic_name' => 'CGF + Taurine', 'brand' => 'Cherifer', 'category' => 'Vitamins', 'age_group' => 'Kids', 'description' => 'Growth vitamins for infants', 'dosage' => '1ml daily', 'is_popular' => true],
            ['name' => 'Cherifer Syrup', 'generic_name' => 'CGF + Taurine + Lysine', 'brand' => 'Cherifer', 'category' => 'Vitamins', 'age_group' => 'Kids', 'description' => 'Growth vitamins for kids', 'dosage' => '5ml twice daily', 'is_popular' => true],
            ['name' => 'Growee Syrup', 'generic_name' => 'Chlorella + Vitamins', 'brand' => 'Growee', 'category' => 'Vitamins', 'age_group' => 'Kids', 'description' => 'Growth supplement for children', 'dosage' => '5ml daily', 'is_popular' => true],
            ['name' => 'Propan TLC Syrup', 'generic_name' => 'Lysine + Vitamins', 'brand' => 'Propan', 'category' => 'Vitamins', 'age_group' => 'Kids', 'description' => 'Appetite stimulant for kids', 'dosage' => '5ml twice daily', 'is_popular' => true],
            ['name' => 'Ceelin', 'generic_name' => 'Ascorbic Acid', 'brand' => 'Ceelin', 'category' => 'Vitamins', 'age_group' => 'Kids', 'description' => 'Vitamin C for kids', 'dosage' => '1ml daily', 'is_popular' => true],
            ['name' => "Scott's Emulsion", 'generic_name' => 'Cod Liver Oil + Vitamins', 'brand' => "Scott's", 'category' => 'Vitamins', 'age_group' => 'Kids', 'description' => 'For healthy bones and immunity', 'dosage' => '5-10ml daily', 'is_popular' => true],
            ['name' => 'Flintstones Vitamins', 'generic_name' => 'Multivitamins', 'brand' => 'Flintstones', 'category' => 'Vitamins', 'age_group' => 'Kids', 'description' => 'Chewable multivitamins for kids', 'dosage' => '1 tablet daily', 'is_popular' => true],
            ['name' => 'Pedzinc', 'generic_name' => 'Zinc Sulfate', 'brand' => 'Pedzinc', 'category' => 'Vitamins', 'age_group' => 'Kids', 'description' => 'For diarrhea management and immunity', 'dosage' => '10-20mg daily', 'is_popular' => true],
            ['name' => 'Nutri10', 'generic_name' => 'Lysine + Vitamins', 'brand' => 'Nutri10', 'category' => 'Vitamins', 'age_group' => 'Kids', 'description' => 'Nutritional supplement for kids', 'dosage' => '5ml twice daily', 'is_popular' => true],
            ['name' => 'Tiki-Tiki', 'generic_name' => 'Multivitamins', 'brand' => 'Tiki-Tiki', 'category' => 'Vitamins', 'age_group' => 'Kids', 'description' => 'Drops for infants and toddlers', 'dosage' => '1ml daily', 'is_popular' => true],
            ['name' => 'Pediasure', 'generic_name' => 'Complete Nutrition', 'brand' => 'Pediasure', 'category' => 'Vitamins', 'age_group' => 'Kids', 'description' => 'Complete nutrition drink for kids', 'dosage' => '1-2 servings daily', 'is_popular' => true],
            ['name' => 'Enfagrow', 'generic_name' => 'Powdered Milk + DHA', 'brand' => 'Enfagrow', 'category' => 'Vitamins', 'age_group' => 'Kids', 'description' => 'Nutrition for brain development', 'dosage' => 'As directed on package', 'is_popular' => true],
            ['name' => 'Ceelin Plus', 'generic_name' => 'Vitamin C + Zinc', 'brand' => 'Ceelin', 'category' => 'Vitamins', 'age_group' => 'Kids', 'description' => 'Immunity booster for kids', 'dosage' => '1ml daily', 'is_popular' => true],
            ['name' => 'Calciumade', 'generic_name' => 'Calcium + Vitamins', 'brand' => 'Calciumade', 'category' => 'Vitamins', 'age_group' => 'Kids', 'description' => 'For strong bones and teeth', 'dosage' => '5ml daily', 'is_popular' => true],
            ['name' => 'Sangobion Kids', 'generic_name' => 'Iron + Vitamins', 'brand' => 'Sangobion', 'category' => 'Vitamins', 'age_group' => 'Kids', 'description' => 'For anemia prevention', 'dosage' => '5ml daily', 'is_popular' => true],

            // Additional OTC Medicines
            ['name' => 'Allerkid', 'generic_name' => 'Cetirizine', 'brand' => 'Allerkid', 'category' => 'Allergy', 'age_group' => 'Kids', 'description' => 'Antihistamine for kids', 'dosage' => 'Based on age', 'is_popular' => true],
            ['name' => 'Alnix', 'generic_name' => 'Cetirizine', 'brand' => 'Alnix', 'category' => 'Allergy', 'age_group' => 'Adults', 'description' => 'For allergic rhinitis', 'dosage' => '10mg once daily', 'is_popular' => true],
            ['name' => 'Clarityne', 'generic_name' => 'Loratadine', 'brand' => 'Clarityne', 'category' => 'Allergy', 'age_group' => 'Adults', 'description' => 'Non-drowsy antihistamine', 'dosage' => '10mg once daily', 'is_popular' => true],
            ['name' => 'Claritin', 'generic_name' => 'Loratadine', 'brand' => 'Claritin', 'category' => 'Allergy', 'age_group' => 'Adults', 'description' => 'For allergy relief', 'dosage' => '10mg once daily', 'is_popular' => true],
            ['name' => 'Benadryl', 'generic_name' => 'Diphenhydramine', 'brand' => 'Benadryl', 'category' => 'Allergy', 'age_group' => 'Adults', 'description' => 'Antihistamine for allergies', 'dosage' => '25-50mg every 4-6 hours', 'is_popular' => true],
            ['name' => 'Sangobion', 'generic_name' => 'Iron + Folic Acid + Vitamins', 'brand' => 'Sangobion', 'category' => 'Vitamins', 'age_group' => 'Adults', 'description' => 'For iron deficiency anemia', 'dosage' => '1 capsule daily', 'is_popular' => true],
            ['name' => 'Ferrous Sulfate', 'generic_name' => 'Ferrous Sulfate', 'brand' => null, 'category' => 'Vitamins', 'age_group' => 'Adults', 'description' => 'Iron supplement', 'dosage' => '325mg daily', 'is_popular' => true],
            ['name' => 'Calcium + Vitamin D', 'generic_name' => 'Calcium Carbonate + Vitamin D3', 'brand' => null, 'category' => 'Vitamins', 'age_group' => 'Adults', 'description' => 'For bone health', 'dosage' => '1 tablet daily', 'is_popular' => true],
            ['name' => 'Omega-3', 'generic_name' => 'Fish Oil', 'brand' => null, 'category' => 'Vitamins', 'age_group' => 'Adults', 'description' => 'For heart and brain health', 'dosage' => '1-2 capsules daily', 'is_popular' => true],
            ['name' => 'Collagen', 'generic_name' => 'Hydrolyzed Collagen', 'brand' => null, 'category' => 'Vitamins', 'age_group' => 'Adults', 'description' => 'For skin and joint health', 'dosage' => 'As directed', 'is_popular' => true],
            ['name' => 'Glucosamine', 'generic_name' => 'Glucosamine Sulfate', 'brand' => null, 'category' => 'Vitamins', 'age_group' => 'Adults', 'description' => 'For joint health', 'dosage' => '1500mg daily', 'is_popular' => true],
            ['name' => 'Calci-Care', 'generic_name' => 'Calcium + Vitamin D', 'brand' => 'Calci-Care', 'category' => 'Vitamins', 'age_group' => 'All', 'description' => 'Calcium supplement', 'dosage' => '1 tablet daily', 'is_popular' => true],
            ['name' => 'Biogesic for Kids', 'generic_name' => 'Paracetamol', 'brand' => 'Biogesic', 'category' => 'Pain Relief', 'age_group' => 'Kids', 'description' => 'Pain and fever relief for children', 'dosage' => 'Based on weight', 'is_popular' => true],
            ['name' => 'Calpol', 'generic_name' => 'Paracetamol', 'brand' => 'Calpol', 'category' => 'Pain Relief', 'age_group' => 'Kids', 'description' => 'Fever reducer for babies and kids', 'dosage' => 'Based on age', 'is_popular' => true],
            ['name' => 'Nurofen', 'generic_name' => 'Ibuprofen', 'brand' => 'Nurofen', 'category' => 'Pain Relief', 'age_group' => 'All', 'description' => 'Fast pain relief', 'dosage' => '200-400mg every 4-6 hours', 'is_popular' => true],
            ['name' => 'Saridon', 'generic_name' => 'Paracetamol + Propyphenazone + Caffeine', 'brand' => 'Saridon', 'category' => 'Pain Relief', 'age_group' => 'Adults', 'description' => 'For headache relief', 'dosage' => '1-2 tablets as needed', 'is_popular' => true],
            ['name' => 'Midol', 'generic_name' => 'Ibuprofen + Pamabrom', 'brand' => 'Midol', 'category' => 'Pain Relief', 'age_group' => 'Adults', 'description' => 'For menstrual cramps', 'dosage' => 'As directed', 'is_popular' => true],
            ['name' => 'Flanax', 'generic_name' => 'Naproxen Sodium', 'brand' => 'Flanax', 'category' => 'Pain Relief', 'age_group' => 'Adults', 'description' => 'For muscle and joint pain', 'dosage' => '220-550mg every 12 hours', 'is_popular' => true],
            ['name' => 'Aspirin', 'generic_name' => 'Acetylsalicylic Acid', 'brand' => null, 'category' => 'Pain Relief', 'age_group' => 'Adults', 'description' => 'Pain reliever and anti-inflammatory', 'dosage' => '325-650mg every 4 hours', 'is_popular' => true],
            ['name' => 'Voltaren', 'generic_name' => 'Diclofenac', 'brand' => 'Voltaren', 'category' => 'Topical', 'age_group' => 'Adults', 'description' => 'Topical anti-inflammatory gel', 'dosage' => 'Apply to affected area', 'is_popular' => true],
            ['name' => 'Deep Heat', 'generic_name' => 'Methyl Salicylate + Menthol', 'brand' => 'Deep Heat', 'category' => 'Topical', 'age_group' => 'Adults', 'description' => 'Warming pain relief', 'dosage' => 'Apply to affected area', 'is_popular' => true],
            ['name' => 'Counterpain', 'generic_name' => 'Methyl Salicylate + Menthol + Eugenol', 'brand' => 'Counterpain', 'category' => 'Topical', 'age_group' => 'Adults', 'description' => 'For muscle pain', 'dosage' => 'Apply to affected area', 'is_popular' => true],
            ['name' => 'Zam-Buk', 'generic_name' => 'Camphor + Thymol', 'brand' => 'Zam-Buk', 'category' => 'Topical', 'age_group' => 'All', 'description' => 'Antiseptic balm', 'dosage' => 'Apply to affected area', 'is_popular' => true],
            ['name' => 'White Flower', 'generic_name' => 'Wintergreen Oil + Menthol', 'brand' => 'White Flower', 'category' => 'Topical', 'age_group' => 'All', 'description' => 'For headache and dizziness', 'dosage' => 'Apply to temples', 'is_popular' => true],
            ['name' => 'Hydrogen Peroxide', 'generic_name' => 'Hydrogen Peroxide', 'brand' => null, 'category' => 'Wound Care', 'age_group' => 'All', 'description' => 'Wound disinfectant', 'dosage' => 'Apply to affected area', 'is_popular' => true],
            ['name' => 'Alcohol 70%', 'generic_name' => 'Isopropyl Alcohol', 'brand' => null, 'category' => 'Wound Care', 'age_group' => 'All', 'description' => 'Antiseptic and disinfectant', 'dosage' => 'Apply to skin', 'is_popular' => true],
            ['name' => 'Cotton Buds', 'generic_name' => 'Cotton Swabs', 'brand' => null, 'category' => 'Wound Care', 'age_group' => 'All', 'description' => 'For wound cleaning', 'dosage' => 'Single use', 'is_popular' => false],
            ['name' => 'Band-Aid', 'generic_name' => 'Adhesive Bandage', 'brand' => 'Band-Aid', 'category' => 'Wound Care', 'age_group' => 'All', 'description' => 'Wound protection', 'dosage' => 'Apply to clean wound', 'is_popular' => true],
            ['name' => 'Mopiko', 'generic_name' => 'Camphor + Menthol', 'brand' => 'Mopiko', 'category' => 'Topical', 'age_group' => 'All', 'description' => 'For insect bites and itching', 'dosage' => 'Apply to affected area', 'is_popular' => true],
            ['name' => 'Calamine Lotion', 'generic_name' => 'Calamine + Zinc Oxide', 'brand' => null, 'category' => 'Topical', 'age_group' => 'All', 'description' => 'For itchy skin and rashes', 'dosage' => 'Apply to affected area', 'is_popular' => true],
            ['name' => 'Nizoral', 'generic_name' => 'Ketoconazole', 'brand' => 'Nizoral', 'category' => 'Topical', 'age_group' => 'Adults', 'description' => 'Anti-dandruff shampoo', 'dosage' => 'Use 2-3 times weekly', 'is_popular' => true],
            ['name' => 'Head & Shoulders', 'generic_name' => 'Pyrithione Zinc', 'brand' => 'Head & Shoulders', 'category' => 'Topical', 'age_group' => 'All', 'description' => 'Anti-dandruff shampoo', 'dosage' => 'Use as regular shampoo', 'is_popular' => true],
            ['name' => 'Canesten', 'generic_name' => 'Clotrimazole', 'brand' => 'Canesten', 'category' => 'Topical', 'age_group' => 'Adults', 'description' => 'Antifungal cream', 'dosage' => 'Apply twice daily', 'is_popular' => true],
            ['name' => 'Terbinafine', 'generic_name' => 'Terbinafine', 'brand' => null, 'category' => 'Topical', 'age_group' => 'Adults', 'description' => 'For fungal infections', 'dosage' => 'Apply once or twice daily', 'is_popular' => true],
            ['name' => 'Dequadin', 'generic_name' => 'Dequalinium Chloride', 'brand' => 'Dequadin', 'category' => 'Cough & Cold', 'age_group' => 'Adults', 'description' => 'Throat lozenges', 'dosage' => '1 lozenge every 2 hours', 'is_popular' => true],
            ['name' => 'Difflam', 'generic_name' => 'Benzydamine', 'brand' => 'Difflam', 'category' => 'Cough & Cold', 'age_group' => 'Adults', 'description' => 'Throat spray for pain', 'dosage' => '4-8 sprays every 2-3 hours', 'is_popular' => true],
            ['name' => 'Fisherman\'s Friend', 'generic_name' => 'Menthol', 'brand' => 'Fisherman\'s Friend', 'category' => 'Cough & Cold', 'age_group' => 'Adults', 'description' => 'Extra strong lozenges', 'dosage' => '1 lozenge as needed', 'is_popular' => true],
            ['name' => 'Halls', 'generic_name' => 'Menthol', 'brand' => 'Halls', 'category' => 'Cough & Cold', 'age_group' => 'All', 'description' => 'Soothing throat lozenges', 'dosage' => '1 lozenge every 2 hours', 'is_popular' => true],
            ['name' => 'Vicks Inhaler', 'generic_name' => 'Levmetamfetamine', 'brand' => 'Vicks', 'category' => 'Cough & Cold', 'age_group' => 'All', 'description' => 'Nasal decongestant', 'dosage' => '2 inhalations per nostril', 'is_popular' => true],
            ['name' => 'Salinase', 'generic_name' => 'Sodium Chloride', 'brand' => 'Salinase', 'category' => 'Cough & Cold', 'age_group' => 'All', 'description' => 'Nasal spray for congestion', 'dosage' => '2-3 sprays per nostril', 'is_popular' => true],
            ['name' => 'Oralyte', 'generic_name' => 'Oral Rehydration Salts', 'brand' => 'Oralyte', 'category' => 'Digestive', 'age_group' => 'All', 'description' => 'For rehydration', 'dosage' => 'Dissolve in water as directed', 'is_popular' => true],
            ['name' => 'Pedialyte', 'generic_name' => 'Oral Electrolyte Solution', 'brand' => 'Pedialyte', 'category' => 'Digestive', 'age_group' => 'Kids', 'description' => 'Rehydration for children', 'dosage' => 'As needed', 'is_popular' => true],
            ['name' => 'Lomotil', 'generic_name' => 'Diphenoxylate + Atropine', 'brand' => 'Lomotil', 'category' => 'Digestive', 'age_group' => 'Adults', 'description' => 'For diarrhea', 'dosage' => '2 tablets initially then 1 after each stool', 'is_popular' => true],
            ['name' => 'Mylanta', 'generic_name' => 'Aluminum Hydroxide + Magnesium Hydroxide + Simethicone', 'brand' => 'Mylanta', 'category' => 'Digestive', 'age_group' => 'Adults', 'description' => 'For heartburn and gas', 'dosage' => '10-20ml as needed', 'is_popular' => true],
            ['name' => 'Tums', 'generic_name' => 'Calcium Carbonate', 'brand' => 'Tums', 'category' => 'Digestive', 'age_group' => 'Adults', 'description' => 'Antacid for heartburn', 'dosage' => '2-4 tablets as needed', 'is_popular' => true],
            ['name' => 'Pepto Bismol', 'generic_name' => 'Bismuth Subsalicylate', 'brand' => 'Pepto Bismol', 'category' => 'Digestive', 'age_group' => 'Adults', 'description' => 'For upset stomach and diarrhea', 'dosage' => '30ml every 30-60 minutes', 'is_popular' => true],
        ];
    }
}
