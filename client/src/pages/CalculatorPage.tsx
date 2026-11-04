import React, { useState, useEffect } from 'react';
import {
  Zap,
  Car,
  Utensils,
  ShoppingBag,
  Trash2,
  Home,
  RotateCcw,
  Save,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  TrendingDown,
  Info,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CalculationInputs, CalculationResult, CalculationRecord } from '../types';

const INITIAL_INPUTS: CalculationInputs = {
  gridRegion: 'india',
  electricityKwh: 120,
  carPetrolKm: 20,
  carDieselKm: 0,
  twoWheelerPetrolKm: 35,
  twoWheelerEvKm: 0,
  carEvKm: 0,
  busKm: 25,
  trainKm: 15,
  dietType: 'vegetarian',
  foodWasteFrequency: 'rarely',
  singleUsePlasticCount: 4,
  onlineOrdersMonthly: 2,
  usesReusableBags: true,
  wasteSegregation: 'partial',
  practicesComposting: false,
  practicesRecycling: true,
  lpgCylindersPerMonth: 1,
  householdMembers: 4,
  waterPumpHoursPerDay: 0.5
};

const CATEGORY_COLORS: Record<string, string> = {
  Electricity: '#F59E0B', // Amber
  Transportation: '#0284C7', // Sky Blue
  'Food Habits': '#10B981', // Emerald
  'Plastic & Shopping': '#EC4899', // Pink
  'Waste Management': '#8B5CF6', // Purple
  'Lifestyle & Cooking': '#14B8A6' // Teal
};

interface CalculatorPageProps {
  setActiveTab: (tab: string) => void;
}

export const CalculatorPage: React.FC<CalculatorPageProps> = ({ setActiveTab }) => {
  const { user, refreshUser } = useAuth();
  const [inputs, setInputs] = useState<CalculationInputs>(INITIAL_INPUTS);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [history, setHistory] = useState<CalculationRecord[]>([]);
  const [showMethodology, setShowMethodology] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Compute live on mount with initial inputs
  useEffect(() => {
    handleCalculate();
    if (user) {
      api.calculator.getHistory()
        .then(res => setHistory(res.history))
        .catch(() => {});
    }
  }, [user]);

  const handleInputChange = (field: keyof CalculationInputs, value: any) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const handleCalculate = async () => {
    setIsCalculating(true);
    try {
      const res = await api.calculator.calculate(inputs);
      setResult(res);
      setSaveStatus(null);
    } catch (err) {
      console.error('Calculation error:', err);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleReset = () => {
    setInputs(INITIAL_INPUTS);
    setSaveStatus(null);
    setActiveStep(0);
    api.calculator.calculate(INITIAL_INPUTS).then(res => setResult(res));
  };

  const handleSave = async () => {
    if (!user) {
      setActiveTab('auth');
      return;
    }

    try {
      setSaveStatus('saving');
      const res = await api.calculator.save(inputs);
      setSaveStatus('saved');
      await refreshUser();
      api.calculator.getHistory().then(h => setHistory(h.history));
      setTimeout(() => setSaveStatus(null), 4000);
    } catch (err: any) {
      setSaveStatus(`Error: ${err.message || 'Could not save'}`);
    }
  };

  const steps = [
    { id: 'electricity', label: 'Electricity', icon: Zap },
    { id: 'transport', label: 'Transport', icon: Car },
    { id: 'food', label: 'Food Habits', icon: Utensils },
    { id: 'plastic', label: 'Plastic & Shopping', icon: ShoppingBag },
    { id: 'waste', label: 'Waste Management', icon: Trash2 },
    { id: 'lifestyle', label: 'Lifestyle & Cooking', icon: Home },
  ];

  const chartData = result ? result.categories.map(c => ({
    name: c.name,
    value: c.co2_kg,
    color: CATEGORY_COLORS[c.name] || '#10B981'
  })) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Scientific & Transparent Emission Estimation</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Everyday Carbon Footprint Calculator
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Estimate your greenhouse gas emissions across six essential daily categories. Guided by the Central Electricity Authority (CEA) v19 and IPCC standards.
        </p>
      </div>

      {/* Guided Category Navigator */}
      <div className="flex items-center justify-between overflow-x-auto pb-2 gap-2 border-b border-slate-200">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          const isActive = activeStep === idx;
          return (
            <button
              key={s.id}
              onClick={() => setActiveStep(idx)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{s.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Grid: Inputs Form & Results View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Inputs (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6 text-left">
          {/* Category 1: Electricity Consumption */}
          {activeStep === 0 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500" />
                  Category 1: Electricity Consumption
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Electricity generation accounts for significant thermal emissions. Enter your monthly household usage.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Select Power Grid Model
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleInputChange('gridRegion', 'india')}
                      className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                        inputs.gridRegion === 'india'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <p className="font-bold">Indian National Grid Average</p>
                      <span className="text-[11px] text-slate-500 font-normal">0.716 kg CO2e / kWh (CEA v19)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleInputChange('gridRegion', 'kerala')}
                      className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                        inputs.gridRegion === 'kerala'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <p className="font-bold">Kerala State Grid (Hydel Mix)</p>
                      <span className="text-[11px] text-slate-500 font-normal">0.580 kg CO2e / kWh (KSEB / Regional)</span>
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Monthly Electricity Usage (kWh / Units)
                    </label>
                    <span className="text-xs font-bold text-emerald-700">{inputs.electricityKwh || 0} kWh</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="600"
                    step="5"
                    value={inputs.electricityKwh || 0}
                    onChange={(e) => handleInputChange('electricityKwh', Number(e.target.value))}
                    className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                    <span>10 kWh (Modest)</span>
                    <span>120 kWh (Typical)</span>
                    <span>300 kWh (High / AC)</span>
                    <span>600 kWh</span>
                  </div>
                </div>

                <div className="p-3.5 bg-amber-50/70 border border-amber-200/60 rounded-xl text-xs text-amber-900 leading-relaxed">
                  💡 <span className="font-bold">Pro Tip:</span> Check your latest KSEB or electricity bill. 1 unit on the bill corresponds exactly to 1 kWh.
                </div>
              </div>
            </div>
          )}

          {/* Category 2: Transportation */}
          {activeStep === 1 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Car className="w-5 h-5 text-sky-500" />
                  Category 2: Transportation & Commute
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Enter estimated weekly travel distances (in km/week) for each mode.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Two-Wheeler (Petrol Scooter/Bike)
                  </label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      min="0"
                      value={inputs.twoWheelerPetrolKm}
                      onChange={(e) => handleInputChange('twoWheelerPetrolKm', e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      placeholder="km/week"
                    />
                    <span className="ml-2 text-xs text-slate-500 font-medium whitespace-nowrap">km/week</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Electric Two-Wheeler (EV Scooter)
                  </label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      min="0"
                      value={inputs.twoWheelerEvKm}
                      onChange={(e) => handleInputChange('twoWheelerEvKm', e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      placeholder="km/week"
                    />
                    <span className="ml-2 text-xs text-slate-500 font-medium whitespace-nowrap">km/week</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Petrol Passenger Car
                  </label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      min="0"
                      value={inputs.carPetrolKm}
                      onChange={(e) => handleInputChange('carPetrolKm', e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      placeholder="km/week"
                    />
                    <span className="ml-2 text-xs text-slate-500 font-medium whitespace-nowrap">km/week</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Diesel Passenger Car
                  </label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      min="0"
                      value={inputs.carDieselKm}
                      onChange={(e) => handleInputChange('carDieselKm', e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      placeholder="km/week"
                    />
                    <span className="ml-2 text-xs text-slate-500 font-medium whitespace-nowrap">km/week</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Public Bus (KSRTC / City Bus)
                  </label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      min="0"
                      value={inputs.busKm}
                      onChange={(e) => handleInputChange('busKm', e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      placeholder="km/week"
                    />
                    <span className="ml-2 text-xs text-slate-500 font-medium whitespace-nowrap">km/week</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Electric Train / Metro
                  </label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      min="0"
                      value={inputs.trainKm}
                      onChange={(e) => handleInputChange('trainKm', e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      placeholder="km/week"
                    />
                    <span className="ml-2 text-xs text-slate-500 font-medium whitespace-nowrap">km/week</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Category 3: Food Habits */}
          {activeStep === 2 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-emerald-500" />
                  Category 3: Food Habits & Nutrition
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Agricultural lifecycle and dietary choices have a massive impact on land, water, and methane output.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Primary Dietary Pattern
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { id: 'heavy_meat', label: 'High Meat / Poultry', sub: 'Daily non-veg (~7.2 kg CO2e/day)' },
                      { id: 'medium_nonveg', label: 'Moderate Non-Veg', sub: '2-3 times/week (~4.8 kg CO2e/day)' },
                      { id: 'vegetarian', label: 'Lacto-Vegetarian', sub: 'Plant & dairy (~3.2 kg CO2e/day)' },
                      { id: 'vegan', label: 'Strict Vegan / Plant', sub: '100% plant-based (~2.1 kg CO2e/day)' },
                    ].map(d => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => handleInputChange('dietType', d.id)}
                        className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                          inputs.dietType === d.id
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <p className="font-bold">{d.label}</p>
                        <span className="text-[11px] text-slate-500 font-normal">{d.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Food Waste Frequency
                  </label>
                  <select
                    value={inputs.foodWasteFrequency}
                    onChange={(e) => handleInputChange('foodWasteFrequency', e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="never">Never (Zero plate waste)</option>
                    <option value="rarely">Rarely (Occasional food scraps)</option>
                    <option value="weekly">Weekly (1-2 discarded portions per week)</option>
                    <option value="daily">Daily (Regular meal leftovers discarded)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Category 4: Plastic & Shopping */}
          {activeStep === 3 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-pink-500" />
                  Category 4: Plastic & Shopping
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Single-use polymer packaging and parcel delivery logistics generate direct petrochemical emissions.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Single-Use Plastic Items Used per Week (Bottles, disposable cups, carry bags)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={inputs.singleUsePlasticCount}
                    onChange={(e) => handleInputChange('singleUsePlasticCount', e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="e.g. 4 items"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Online E-Commerce Orders per Month (Amazon, Flipkart, Swiggy, etc.)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={inputs.onlineOrdersMonthly}
                    onChange={(e) => handleInputChange('onlineOrdersMonthly', e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="e.g. 2 deliveries"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="reusableBags"
                    checked={inputs.usesReusableBags}
                    onChange={(e) => handleInputChange('usesReusableBags', e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500"
                  />
                  <label htmlFor="reusableBags" className="text-xs sm:text-sm text-slate-700 font-medium">
                    I regularly carry a cloth tote bag and reusable water bottle
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Category 5: Waste Management */}
          {activeStep === 4 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Trash2 className="w-5 h-5 text-purple-500" />
                  Category 5: Waste Management & Disposal
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Methane generation from dumpsites is 28x more potent than CO2. Segregating waste prevents dump fires and rotting.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Household Source Segregation (Wet vs Dry Waste)
                  </label>
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {[
                      { id: 'full', label: 'Strict Segregation', sub: 'Separate bins at home' },
                      { id: 'partial', label: 'Partial', sub: 'Sometimes separate' },
                      { id: 'none', label: 'No Segregation', sub: 'Mixed waste bin' },
                    ].map(w => (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => handleInputChange('wasteSegregation', w.id)}
                        className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                          inputs.wasteSegregation === w.id
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <p className="font-bold">{w.label}</p>
                        <span className="text-[10px] text-slate-500 font-normal block mt-0.5">{w.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="practicesComposting"
                      checked={inputs.practicesComposting}
                      onChange={(e) => handleInputChange('practicesComposting', e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500"
                    />
                    <label htmlFor="practicesComposting" className="text-xs sm:text-sm text-slate-700 font-medium">
                      Home composting (Bio-bin, pipe compost, or garden mulch)
                    </label>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="practicesRecycling"
                      checked={inputs.practicesRecycling}
                      onChange={(e) => handleInputChange('practicesRecycling', e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500"
                    />
                    <label htmlFor="practicesRecycling" className="text-xs sm:text-sm text-slate-700 font-medium">
                      Hand over dry paper/plastics to Haritha Karma Sena or scrap dealers
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Category 6: Lifestyle & Cooking */}
          {activeStep === 5 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Home className="w-5 h-5 text-teal-500" />
                  Category 6: Lifestyle & Cooking Fuel
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Domestic LPG cooking gas, household members, and overhead water pumping.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    LPG Cylinders Consumed per Month
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.25"
                    value={inputs.lpgCylindersPerMonth}
                    onChange={(e) => handleInputChange('lpgCylindersPerMonth', e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="e.g. 1 cylinder"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">~42.6 kg CO2e per 14.2 kg cylinder</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Number of Household Members
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={inputs.householdMembers}
                    onChange={(e) => handleInputChange('householdMembers', e.target.value === '' ? '' : Math.max(1, Number(e.target.value)))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="e.g. 4 people"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">Used to apportion shared cooking fuel</span>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Overhead Water Motor Pump (Hours per Day)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={inputs.waterPumpHoursPerDay}
                    onChange={(e) => handleInputChange('waterPumpHoursPerDay', e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="e.g. 0.5 hours (30 mins)"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">Assumes typical 1 HP motor (~0.75 kW power load)</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Navigation Buttons */}
          <div className="pt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>

              {activeStep > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveStep(prev => Math.max(0, prev - 1))}
                  className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Previous
                </button>
              )}
            </div>

            <div className="flex gap-2">
              {activeStep < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={() => { setActiveStep(prev => prev + 1); handleCalculate(); }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all"
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCalculate}
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm hover:shadow transition-all"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Update Footprint</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Calculator Output & Visual Analytics (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {result && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-6 text-left">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Your Estimated Footprint</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Defensible Estimate
                </span>
              </div>

              {/* Main Metric Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-100">
                  <span className="text-xs font-medium text-slate-500">Monthly CO2e</span>
                  <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                    {result.monthly_co2_kg}
                  </p>
                  <span className="text-[11px] font-semibold text-emerald-700">kg CO2e / month</span>
                </div>

                <div className="p-4 bg-sky-50/70 rounded-2xl border border-sky-100">
                  <span className="text-xs font-medium text-slate-500">Annual Footprint</span>
                  <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                    {result.annual_co2_tonnes}
                  </p>
                  <span className="text-[11px] font-semibold text-sky-700">tonnes CO2e / year</span>
                </div>
              </div>

              {/* Daily Reference */}
              <div className="text-xs text-slate-500 flex justify-between px-1">
                <span>Daily Average:</span>
                <span className="font-bold text-slate-800">{result.daily_co2_kg} kg CO2e / day</span>
              </div>

              {/* Category-Wise Donut Breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Category Breakdown
                </h4>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val: any) => [`${val} kg CO2e`, 'Monthly']}
                        contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend list */}
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  {result.categories.map((c) => (
                    <div key={c.key} className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: CATEGORY_COLORS[c.name] }}
                      ></span>
                      <span className="text-slate-600 truncate">{c.name}:</span>
                      <span className="font-bold text-slate-800 ml-auto">{c.co2_kg} kg</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons: Save & History */}
              <div className="pt-2 space-y-2 border-t border-slate-100">
                <button
                  onClick={handleSave}
                  disabled={saveStatus === 'saving'}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold rounded-xl shadow-xs transition-all text-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>
                    {user
                      ? (saveStatus === 'saving' ? 'Saving to Database...' : saveStatus === 'saved' ? 'Saved to Your History!' : 'Save My Result to Profile')
                      : 'Sign in to Save My Result'}
                  </span>
                </button>

                {user && history.length > 0 && (
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="w-full py-2 text-xs font-semibold text-emerald-700 hover:text-emerald-800 text-center"
                  >
                    {showHistory ? 'Hide Past Calculations' : `View My Past Calculations (${history.length})`}
                  </button>
                )}
              </div>

              {/* Suggestions */}
              {result.suggestions.length > 0 && (
                <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-2">
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                    Actionable Opportunity:
                  </span>
                  <p className="text-xs font-bold text-slate-900">{result.suggestions[0].title}</p>
                  <p className="text-xs text-slate-600 leading-relaxed">{result.suggestions[0].tip}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Past Calculations Drawer/Modal */}
      {showHistory && history.length > 0 && (
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm text-left space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="font-bold text-base text-slate-900">Your Calculation Timeline</h3>
            <button
              onClick={() => setShowHistory(false)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Close
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                  <th className="py-2">Date</th>
                  <th className="py-2">Monthly CO2e</th>
                  <th className="py-2">Annual CO2e</th>
                  <th className="py-2">Electricity</th>
                  <th className="py-2">Transport</th>
                  <th className="py-2">Diet</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50">
                    <td className="py-2 font-medium">{new Date(h.calculated_at).toLocaleDateString()}</td>
                    <td className="py-2 font-bold text-slate-800">{h.monthly_co2_kg} kg</td>
                    <td className="py-2 text-slate-700">{h.annual_co2_tonnes} t</td>
                    <td className="py-2 text-amber-700">{h.electricity_co2_kg} kg</td>
                    <td className="py-2 text-sky-700">{h.transport_co2_kg} kg</td>
                    <td className="py-2 text-emerald-700">{h.food_co2_kg} kg</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Expandable Section: Calculation Methodology & Official Emission Factors */}
      <section className="bg-slate-50 rounded-3xl border border-slate-200 p-6 sm:p-8 text-left space-y-4">
        <button
          onClick={() => setShowMethodology(!showMethodology)}
          className="w-full flex items-center justify-between text-left focus:outline-none"
        >
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Info className="w-5 h-5 text-emerald-600" />
              Calculation Methodology & Scientific Factors
            </h3>
            <p className="text-xs text-slate-500">
              Review formulas, emission baselines, and authoritative government/IPCC source citations.
            </p>
          </div>
          <div className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600">
            {showMethodology ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showMethodology && (
          <div className="pt-4 border-t border-slate-200/80 space-y-6 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <div className="p-4 bg-white rounded-xl border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-1">Scientific Integrity & Disclaimer:</h4>
              <p>
                Carbon footprint results provided by this platform are defensible approximations intended for environmental education and behavioral change. Individual footprints vary based on seasonal ambient temperatures, vehicle maintenance, and regional supply chains. Results are not legally binding carbon offsets.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-emerald-800 text-xs uppercase tracking-wide">1. Grid Electricity</span>
                <p>
                  <strong className="text-slate-800">0.716 kg CO2e / kWh:</strong> Central Electricity Authority (CEA), CO2 Baseline Database for the Indian Power Sector, Version 19.0 (2024). Represents the national Combined Margin (CM) factoring in thermal and renewable mix.
                </p>
                <p>
                  <strong className="text-slate-800">0.580 kg CO2e / kWh:</strong> Kerala Regional Mix factoring high hydroelectric base from Idukki/Sabarigiri alongside central grid imports.
                </p>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-sky-800 text-xs uppercase tracking-wide">2. Transportation</span>
                <p>
                  <strong className="text-slate-800">Petrol Car (0.142 kg/km), Diesel (0.165 kg/km):</strong> Automotive Research Association of India (ARAI) & CPCB Fuel Economy baseline.
                </p>
                <p>
                  <strong className="text-slate-800">2-Wheeler (0.045 kg/km), Bus (0.032 kg/p-km), Train (0.016 kg/p-km):</strong> GHG Protocol India & Indian Railways Mission 41k.
                </p>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-emerald-800 text-xs uppercase tracking-wide">3. Diet & Agriculture</span>
                <p>
                  <strong className="text-slate-800">IPCC AR6 WG-III & Poore & Nemecek (Science 2018):</strong> Dietary emissions incorporate fertilizer synthesis, enteric fermentation, deforestation, and cold storage logistics.
                </p>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-purple-800 text-xs uppercase tracking-wide">4. Waste & Cooking Fuel</span>
                <p>
                  <strong className="text-slate-800">Domestic LPG (42.6 kg CO2e/cylinder):</strong> Ministry of Petroleum and Natural Gas (MoPNG) stoichiometric combustion factors (3.0 kg CO2e/kg fuel).
                </p>
                <p>
                  <strong className="text-slate-800">Landfill MSW (0.45 kg CO2e/kg):</strong> IPCC Waste Model accounting for anaerobic methane decomposition in municipal dumpsites.
                </p>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
