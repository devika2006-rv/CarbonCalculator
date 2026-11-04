import express from 'express';
import db from '../db.js';
import { authenticateToken, optionalToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/calculator/factors
router.get('/factors', (req, res) => {
  try {
    const factors = db.prepare('SELECT * FROM emission_factors ORDER BY category, name').all();
    res.json({ factors });
  } catch (error) {
    console.error('Fetch factors error:', error);
    res.status(500).json({ error: 'Failed to retrieve emission factors' });
  }
});

// Calculation helper function using documented emission factors
export function computeEmissions(inputs) {
  // 1. Electricity
  const gridFactor = inputs.gridRegion === 'kerala' ? 0.58 : 0.716; // kg CO2e / kWh
  const monthlyKwh = Number(inputs.electricityKwh) || 0;
  const electricity_co2_kg = monthlyKwh * gridFactor;

  // 2. Transportation (inputs in km/week converted to monthly * 4.33)
  const weeksPerMonth = 4.33;
  const carPetrolKm = (Number(inputs.carPetrolKm) || 0) * weeksPerMonth;
  const carDieselKm = (Number(inputs.carDieselKm) || 0) * weeksPerMonth;
  const twoWheelerPetrolKm = (Number(inputs.twoWheelerPetrolKm) || 0) * weeksPerMonth;
  const twoWheelerEvKm = (Number(inputs.twoWheelerEvKm) || 0) * weeksPerMonth;
  const carEvKm = (Number(inputs.carEvKm) || 0) * weeksPerMonth;
  const busKm = (Number(inputs.busKm) || 0) * weeksPerMonth;
  const trainKm = (Number(inputs.trainKm) || 0) * weeksPerMonth;

  const transport_co2_kg =
    carPetrolKm * 0.142 +
    carDieselKm * 0.165 +
    twoWheelerPetrolKm * 0.045 +
    twoWheelerEvKm * 0.018 +
    carEvKm * 0.086 +
    busKm * 0.032 +
    trainKm * 0.016;

  // 3. Food Habits (Daily factors * 30.4 days)
  let dietDailyKg = 3.2; // default vegetarian
  if (inputs.dietType === 'heavy_meat') dietDailyKg = 7.2;
  else if (inputs.dietType === 'medium_nonveg') dietDailyKg = 4.8;
  else if (inputs.dietType === 'vegetarian') dietDailyKg = 3.2;
  else if (inputs.dietType === 'vegan') dietDailyKg = 2.1;

  let foodWasteMultiplier = 1.0;
  if (inputs.foodWasteFrequency === 'daily') foodWasteMultiplier = 1.25;
  else if (inputs.foodWasteFrequency === 'weekly') foodWasteMultiplier = 1.12;
  else if (inputs.foodWasteFrequency === 'rarely') foodWasteMultiplier = 1.04;
  else if (inputs.foodWasteFrequency === 'never') foodWasteMultiplier = 0.96;

  const food_co2_kg = dietDailyKg * 30.4 * foodWasteMultiplier;

  // 4. Plastic and Shopping (Monthly)
  const singleUseItemsPerWeek = Number(inputs.singleUsePlasticCount) || 0;
  const singleUseItemsMonthly = singleUseItemsPerWeek * weeksPerMonth;
  const onlineOrdersMonthly = Number(inputs.onlineOrdersMonthly) || 0;

  // Single use: 0.06 kg CO2e per item; Online orders (packaging + last-mile logistics): ~1.8 kg CO2e
  let plastic_co2_kg = (singleUseItemsMonthly * 0.06) + (onlineOrdersMonthly * 1.8);
  if (inputs.usesReusableBags) plastic_co2_kg = Math.max(0, plastic_co2_kg - 2.5);

  // 5. Waste Management (Monthly)
  // Base household waste: ~12 kg / person / month
  const baseWasteKg = 12;
  let wasteEmissionFactor = 0.45; // unsegregated landfill
  if (inputs.wasteSegregation === 'full') wasteEmissionFactor *= 0.6;
  else if (inputs.wasteSegregation === 'partial') wasteEmissionFactor *= 0.85;

  let waste_co2_kg = baseWasteKg * wasteEmissionFactor;
  if (inputs.practicesComposting) {
    // Aerobic composting diverts organic methane emission
    waste_co2_kg *= 0.35;
  }
  if (inputs.practicesRecycling) {
    waste_co2_kg *= 0.75;
  }

  // 6. Lifestyle & Household
  const lpgCylindersPerMonth = Number(inputs.lpgCylindersPerMonth) || 0;
  const householdMembers = Math.max(1, Number(inputs.householdMembers) || 1);
  const personalLpgShare = (lpgCylindersPerMonth * 42.6) / householdMembers;

  const pumpHoursPerDay = Number(inputs.waterPumpHoursPerDay) || 0;
  const waterPumpMonthlyKwh = pumpHoursPerDay * 0.75 * 30.4; // 1HP pump ~0.75 kW
  const waterPumpCo2 = (waterPumpMonthlyKwh * gridFactor) / householdMembers;

  const lifestyle_co2_kg = personalLpgShare + waterPumpCo2;

  // Totals
  const monthly_co2_kg = Number((
    electricity_co2_kg +
    transport_co2_kg +
    food_co2_kg +
    plastic_co2_kg +
    waste_co2_kg +
    lifestyle_co2_kg
  ).toFixed(2));

  const daily_co2_kg = Number((monthly_co2_kg / 30.4).toFixed(2));
  const annual_co2_tonnes = Number(((monthly_co2_kg * 12) / 1000).toFixed(2));

  // Category shares
  const categories = [
    { name: 'Electricity', key: 'electricity', co2_kg: Number(electricity_co2_kg.toFixed(2)) },
    { name: 'Transportation', key: 'transport', co2_kg: Number(transport_co2_kg.toFixed(2)) },
    { name: 'Food Habits', key: 'food', co2_kg: Number(food_co2_kg.toFixed(2)) },
    { name: 'Plastic & Shopping', key: 'plastic', co2_kg: Number(plastic_co2_kg.toFixed(2)) },
    { name: 'Waste Management', key: 'waste', co2_kg: Number(waste_co2_kg.toFixed(2)) },
    { name: 'Lifestyle & Cooking', key: 'lifestyle', co2_kg: Number(lifestyle_co2_kg.toFixed(2)) }
  ];

  // Suggestions based on highest contributors
  const suggestions = [];
  if (electricity_co2_kg > 80) {
    suggestions.push({
      category: 'Electricity',
      title: 'Optimize Household Cooling & Standby Power',
      tip: 'Electricity is your largest contributor. Setting AC temperatures to 24-26°C and unplugging idle electronic chargers can reduce monthly electricity by 15-25%.'
    });
  }
  if (transport_co2_kg > 50) {
    suggestions.push({
      category: 'Transportation',
      title: 'Shift to Public Bus or Electric Mobility',
      tip: 'Using public buses or suburban rail for 2 days a week cuts transport emissions by up to 40% compared to solo motorcycle/car driving.'
    });
  }
  if (food_co2_kg > 120) {
    suggestions.push({
      category: 'Food',
      title: 'Incorporate More Plant-Based Protein Meals',
      tip: 'Replacing two non-vegetarian meals a week with lentils, chickpeas, or seasonal vegetables reduces food-related emissions by ~20 kg CO2e each month.'
    });
  }
  if (plastic_co2_kg > 10) {
    suggestions.push({
      category: 'Plastic',
      title: 'Adopt Zero Single-Use Bottles & Bags',
      tip: 'Carrying a reusable copper/steel bottle and cloth tote bag permanently prevents dozens of disposable plastic items from entering landfills.'
    });
  }
  if (waste_co2_kg > 4) {
    suggestions.push({
      category: 'Waste',
      title: 'Segregate at Source & Practice Composting',
      tip: 'Segregating wet waste for home composting prevents anaerobic methane emissions at municipal dump yards and creates rich garden fertilizer.'
    });
  }

  if (suggestions.length === 0) {
    suggestions.push({
      category: 'General',
      title: 'Excellent Sustainable Habits!',
      tip: 'Your estimated carbon footprint is remarkably balanced. Continue participating in daily challenges and inspire peers to follow your lead.'
    });
  }

  return {
    daily_co2_kg,
    monthly_co2_kg,
    annual_co2_tonnes,
    categories,
    suggestions,
    breakdown: {
      electricity_co2_kg: Number(electricity_co2_kg.toFixed(2)),
      transport_co2_kg: Number(transport_co2_kg.toFixed(2)),
      food_co2_kg: Number(food_co2_kg.toFixed(2)),
      plastic_co2_kg: Number(plastic_co2_kg.toFixed(2)),
      waste_co2_kg: Number(waste_co2_kg.toFixed(2)),
      lifestyle_co2_kg: Number(lifestyle_co2_kg.toFixed(2))
    }
  };
}

// POST /api/calculator/calculate
router.post('/calculate', (req, res) => {
  try {
    const inputs = req.body || {};
    const result = computeEmissions(inputs);
    res.json(result);
  } catch (error) {
    console.error('Calculation error:', error);
    res.status(500).json({ error: 'Failed to calculate emissions' });
  }
});

// POST /api/calculator/save
router.post('/save', authenticateToken, (req, res) => {
  try {
    const inputs = req.body || {};
    const result = computeEmissions(inputs);

    const stmt = db.prepare(`
      INSERT INTO carbon_calculations (
        user_id, daily_co2_kg, monthly_co2_kg, annual_co2_tonnes,
        electricity_co2_kg, transport_co2_kg, food_co2_kg,
        plastic_co2_kg, waste_co2_kg, lifestyle_co2_kg,
        inputs_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertResult = stmt.run(
      req.user.id,
      result.daily_co2_kg,
      result.monthly_co2_kg,
      result.annual_co2_tonnes,
      result.breakdown.electricity_co2_kg,
      result.breakdown.transport_co2_kg,
      result.breakdown.food_co2_kg,
      result.breakdown.plastic_co2_kg,
      result.breakdown.waste_co2_kg,
      result.breakdown.lifestyle_co2_kg,
      JSON.stringify(inputs)
    );

    // Award badge for first calculation
    const count = db.prepare('SELECT COUNT(*) as count FROM carbon_calculations WHERE user_id = ?').get(req.user.id).count;
    let newBadgeAwarded = null;
    if (count === 1) {
      db.prepare(`
        INSERT OR IGNORE INTO user_badges (user_id, badge_id, badge_name, badge_description)
        VALUES (?, 'first_footprint', 'Carbon Conscious', 'Completed first carbon footprint calculation')
      `).run(req.user.id);
      newBadgeAwarded = {
        id: 'first_footprint',
        name: 'Carbon Conscious',
        description: 'Completed first carbon footprint calculation'
      };
    }

    res.status(201).json({
      message: 'Calculation saved successfully to your profile',
      id: insertResult.lastInsertRowid,
      result,
      newBadgeAwarded
    });
  } catch (error) {
    console.error('Save calculation error:', error);
    res.status(500).json({ error: 'Failed to save calculation history' });
  }
});

// GET /api/calculator/history
router.get('/history', authenticateToken, (req, res) => {
  try {
    const records = db.prepare(`
      SELECT * FROM carbon_calculations
      WHERE user_id = ?
      ORDER BY calculated_at DESC
      LIMIT 20
    `).all(req.user.id);

    const formatted = records.map(r => ({
      ...r,
      inputs: JSON.parse(r.inputs_json || '{}')
    }));

    res.json({ history: formatted });
  } catch (error) {
    console.error('Fetch history error:', error);
    res.status(500).json({ error: 'Failed to fetch calculation history' });
  }
});

export default router;
