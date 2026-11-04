import React, { useState } from 'react';
import {
  BookOpen,
  Zap,
  Globe2,
  ThermometerSun,
  Car,
  Trash2,
  Apple,
  Wind,
  Lightbulb,
  ShoppingBag,
  Search,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  X
} from 'lucide-react';

interface Topic {
  id: string;
  category: 'energy' | 'climate' | 'transport' | 'waste' | 'lifestyle';
  title: string;
  shortDesc: string;
  icon: any;
  color: string;
  keyFacts: string[];
  practicalTips: string[];
  realWorldExample: string;
  relatedChallenge: string;
}

const TOPICS: Topic[] = [
  {
    id: 'carbon-footprint',
    category: 'climate',
    title: 'What Is a Carbon Footprint?',
    shortDesc: 'The total volume of greenhouse gases—principally carbon dioxide and methane—emitted directly or indirectly by our daily human activities.',
    icon: Globe2,
    color: 'from-emerald-600 to-teal-700',
    keyFacts: [
      'Expresses emissions in carbon dioxide equivalent (CO2e) units to encompass methane, nitrous oxide, and fluorinated gases.',
      'Global average per capita footprint is ~4.7 tonnes CO2e/year; in India it averages ~1.9 tonnes per capita, but varies sharply across urban and rural lifestyles.',
      'Individual lifestyle interventions can directly influence 25-30% of global emissions reductions.'
    ],
    practicalTips: [
      'Conduct regular personal audits using CarbonCalculator at the start of each month.',
      'Prioritize high-impact areas: electricity conservation and shared transportation.',
      'Discuss footprint concepts with family and classmates to initiate collective shifts.'
    ],
    realWorldExample: 'Switching a single household from incandescent bulbs to LEDs saves ~75 kWh annually, preventing over 50 kg of thermal grid emissions.',
    relatedChallenge: 'Peer Awareness: Explain Carbon Footprint to a Friend'
  },
  {
    id: 'global-warming',
    category: 'climate',
    title: 'Global Warming & Greenhouse Effect',
    shortDesc: 'How heat-trapping gases in the Earth’s troposphere act like a blanket, driving temperature rises and destabilizing weather patterns.',
    icon: ThermometerSun,
    color: 'from-amber-600 to-orange-700',
    keyFacts: [
      'Atmospheric CO2 levels have exceeded 420 ppm, higher than any point in the last 2 million years.',
      'The global average temperature has already warmed by ~1.15°C above pre-industrial baselines.',
      'The ocean absorbs over 90% of excess planetary heat, causing coral bleaching and thermal expansion.'
    ],
    practicalTips: [
      'Lower home air conditioning reliance by optimizing cross-ventilation during cool morning hours.',
      'Plant shade trees near southern and western building walls to naturally cool rooms.',
      'Advocate for renewable energy adoption in your school or college campus.'
    ],
    realWorldExample: 'The Western Ghats of Kerala are experiencing altered rainfall intensity distributions, with more concentrated bursts causing landslips and localized flooding.',
    relatedChallenge: 'Banish Phantom Loads: Unplug Unused Chargers'
  },
  {
    id: 'kerala-climate',
    category: 'climate',
    title: 'Climate Realities in Kerala & South Asia',
    shortDesc: 'Analyzing localized vulnerabilities: erratic monsoons, coastal erosion, water table fluctuation, and agricultural seasonality.',
    icon: Wind,
    color: 'from-sky-600 to-blue-700',
    keyFacts: [
      'Kerala’s extensive 590 km coastline is highly vulnerable to sea-level rise and coastal storm surges.',
      'Changing monsoon patterns directly impact hydel reservoir levels like Idukki and Sabarigiri, forcing higher reliance on coal-fired central power.',
      'Extreme rainfall events (exceeding 200 mm in 24 hours) have surged threefold across the Western Ghats over the past decade.'
    ],
    practicalTips: [
      'Participate in rainwater harvesting and rooftop recharge structures.',
      'Preserve local wetlands and mangroves that serve as natural flood buffers.',
      'Support campus disaster preparedness and NSS environmental volunteer cells.'
    ],
    realWorldExample: 'Vidya NSS volunteers played pivotal roles during the 2018 Kerala floods in rehabilitation and the flagship Punarjjani public asset restoration campaign.',
    relatedChallenge: 'Nurture Nature: Plant or Care for Native Trees'
  },
  {
    id: 'energy-conservation',
    category: 'energy',
    title: 'Energy Conservation in Campus & Home',
    shortDesc: 'Why negawatts—energy saved through efficiency—are the cleanest and cheapest form of environmental action.',
    icon: Zap,
    color: 'from-yellow-600 to-amber-700',
    keyFacts: [
      'Saving 1 kWh of electricity prevents ~0.716 kg CO2e from thermal power plants.',
      'BEE 5-star rated inverter air conditioners consume up to 35% less power than non-inverter models.',
      'Energy conservation directly lowers monthly college and household utility bills.'
    ],
    practicalTips: [
      'Set AC thermostats to 24°C–26°C instead of 18°C; every degree higher saves 6% electricity.',
      'Keep refrigerator door seals clean and avoid placing hot food directly into the fridge.',
      'Turn off classroom fans and lights when moving to labs or leaving for the day.'
    ],
    realWorldExample: 'APJAKTU NSS Energy Cell conducts campus energy audits across KTU engineering colleges, systematically identifying idle power losses.',
    relatedChallenge: 'Weekly 10-Minute Energy Audit'
  },
  {
    id: 'phantom-loads',
    category: 'energy',
    title: 'Phantom Loads & Vampire Power',
    shortDesc: 'Understanding the standby power continuously drawn by electronics even when switched off or not charging.',
    icon: Lightbulb,
    color: 'from-purple-600 to-indigo-700',
    keyFacts: [
      'Standby power accounts for 5% to 10% of total residential electricity consumption.',
      'Laptop chargers, television set-top boxes, Wi-Fi routers, and microwave clocks draw power 24/7 if left plugged in.',
      'Eliminating vampire load in an average home saves ~50 to 120 kWh per year.'
    ],
    practicalTips: [
      'Use master power strips with individual switches for your computer workstation.',
      'Unplug phone and electric bicycle chargers once battery hits full capacity.',
      'Switch off power at the primary wall socket rather than solely using remote controls.'
    ],
    realWorldExample: 'A smartphone charger left plugged into the wall draws ~0.25 watts continuously—scaled across 1 billion mobile users, that equals an entire mid-sized power station.',
    relatedChallenge: 'Banish Phantom Loads: Unplug Unused Chargers'
  },
  {
    id: 'renewable-energy',
    category: 'energy',
    title: 'Renewable Energy: Solar & Rooftop Power',
    shortDesc: 'Harnessing abundant tropical sunlight to decarbonize educational campuses, homes, and public infrastructure.',
    icon: Sparkles,
    color: 'from-emerald-600 to-green-700',
    keyFacts: [
      'A 1 kWp rooftop solar plant in Kerala generates ~4 units (kWh) of clean electricity daily.',
      'Over a 25-year operational life, a 3 kWp home solar installation offsets ~75 tonnes of CO2e.',
      'Cochin International Airport (CIAL) is the world’s first fully solar-powered airport, serving as a global benchmark in Kerala.'
    ],
    practicalTips: [
      'Explore KSEB Soura scheme subsidies for rooftop solar installation on residences.',
      'Keep solar panels clean of dust and bird droppings to maintain peak photovoltaic generation.',
      'Advocate for rooftop solar arrays on your engineering college buildings.'
    ],
    realWorldExample: 'Vidya Academy of Science and Technology operates rooftop solar arrays contributing green power to campus laboratories and administrative blocks.',
    relatedChallenge: 'Fresh Air Hours: Cool with Natural Breeze'
  },
  {
    id: 'sustainable-transport',
    category: 'transport',
    title: 'Sustainable Commute & Active Mobility',
    shortDesc: 'Shifting from solo private fossil vehicles to shared buses, electric traction trains, and walking/cycling.',
    icon: Car,
    color: 'from-blue-600 to-cyan-700',
    keyFacts: [
      'A typical petrol car emits ~142 grams CO2e per passenger-km compared to just 32 grams on a public bus and 16 grams on an electric train.',
      'Walking and cycling produce zero operational emissions and improve cardiovascular health.',
      'Electric 2-wheelers reduce per-km emissions by over 60% compared to petrol scooters even under India’s current grid mix.'
    ],
    practicalTips: [
      'Form student carpools or bike-shares for campus transit.',
      'Walk or bicycle for local neighborhood grocery errands within 1 to 2 km.',
      'Opt for KSRTC or Indian Railways for intercity weekend journeys.'
    ],
    realWorldExample: 'Indian Railways is aiming for Mission 100% Electrification, making rail travel one of the lowest-emission long-distance options in the world.',
    relatedChallenge: 'Sustainable Commute: Walk, Cycle, or Ride Public Transit'
  },
  {
    id: 'plastic-pollution',
    category: 'waste',
    title: 'Plastic Pollution & Petrochemical Impact',
    shortDesc: 'The lifecycle footprint of single-use plastics from crude oil refining to microplastic accumulation in marine food webs.',
    icon: ShoppingBag,
    color: 'from-pink-600 to-rose-700',
    keyFacts: [
      'Over 99% of modern plastics are synthesized from fossil petrochemicals (crude oil and natural gas).',
      'A plastic bottle requires over 450 years to decompose, breaking into toxic microplastic fragments.',
      'Single-use packaging constitutes over 40% of all plastics manufactured annually.'
    ],
    practicalTips: [
      'Carry a reusable stainless steel or copper water bottle to avoid single-use PET bottles.',
      'Keep a foldable cloth tote bag in your college backpack for impromptu shopping.',
      'Decline single-use plastic straws, disposable cutlery, and thermocol plates.'
    ],
    realWorldExample: 'Kerala’s Haritha Karma Sena collects segregated non-biodegradable plastics from households across all local bodies for shredding and road-tarring applications.',
    relatedChallenge: 'Carry a Reusable Water Bottle: Zero Single-Use Plastic'
  },
  {
    id: 'food-waste',
    category: 'lifestyle',
    title: 'Food Waste & Agricultural Footprint',
    shortDesc: 'Addressing the vast upstream land, water, and fuel resources wasted when edible food is thrown into landfills.',
    icon: Apple,
    color: 'from-red-600 to-amber-700',
    keyFacts: [
      'If food waste were a country, it would be the third-largest emitter of greenhouse gases globally after China and the US.',
      'Discarded food decomposing in anaerobic open dumpsites generates methane, a gas 28x more potent than CO2.',
      'Producing 1 kg of beef generates ~60 kg CO2e, while 1 kg of pulses or vegetables generates under 1-2 kg CO2e.'
    ],
    practicalTips: [
      'Order or serve only what you will eat; zero plate waste at hostel mess or home.',
      'Store cooked leftovers properly in airtight containers for your next meal.',
      'Adopt plant-rich meals featuring local pulses, jackfruit, and seasonal vegetables.'
    ],
    realWorldExample: 'Campus hostel mess initiatives that weigh daily plate waste and post notices have been proven to reduce food waste by over 40% in engineering colleges.',
    relatedChallenge: 'Clean Plate Club: Zero Food Wastage Across All Meals'
  },
  {
    id: 'waste-management',
    category: 'waste',
    title: 'Decentralized Waste Management & Composting',
    shortDesc: 'Segregating waste at source and transforming organic kitchen scraps into rich garden soil conditioner.',
    icon: Trash2,
    color: 'from-emerald-700 to-teal-800',
    keyFacts: [
      'Over 60% of municipal solid waste in Kerala is organic and biodegradable.',
      'Decentralized aerobic composting eliminates the diesel transport emissions of hauling wet garbage to distant landfills.',
      'Compost improves soil aeration, water retention, and eliminates chemical fertilizer requirements.'
    ],
    practicalTips: [
      'Maintain separate wet and dry dustbins at home and in campus corridors.',
      'Install a pipe compost or bio-bin in your home garden for vegetable scraps.',
      'Ensure dry recyclable materials like paper and cardboard are clean and unsoiled.'
    ],
    realWorldExample: 'Alappuzha municipality won the UNEP Clean City Award for its pioneering zero-landfill decentralized waste management and community biogas systems.',
    relatedChallenge: 'Source Segregation: Separate Wet Kitchen & Dry Waste'
  },
  {
    id: 'lifestyle-habits',
    category: 'lifestyle',
    title: 'Sustainable Living: Small Multipliers',
    shortDesc: 'Adopting conscious consumerism, minimalism, repairing rather than replacing, and building a circular lifestyle.',
    icon: CheckCircle2,
    color: 'from-teal-600 to-emerald-700',
    keyFacts: [
      'Extending the life of a smartphone or laptop by just two years reduces its lifetime carbon intensity by ~50%.',
      'The fashion industry accounts for ~10% of global carbon emissions—more than international flights and maritime shipping combined.',
      'Shared community libraries and repair cafes prevent tons of electronic and physical waste.'
    ],
    practicalTips: [
      'Repair broken electronic appliances, fans, and furniture before replacing them.',
      'Avoid fast-fashion impulse purchases; choose durable, repairable garments.',
      'Gift native saplings, books, or experiences rather than plastic items.'
    ],
    realWorldExample: 'Vidya NSS Unit’s Punarjjani scheme restores discarded hospital equipment and campus furniture, saving millions of rupees and tons of scrap metal.',
    relatedChallenge: 'Peer Awareness: Explain Carbon Footprint to a Friend'
  },
  {
    id: 'water-footprint',
    category: 'lifestyle',
    title: 'Water Footprint & Pumping Energy',
    shortDesc: 'Understanding the intimate link between water pumping, overhead tank motors, purification, and energy consumption.',
    icon: Globe2,
    color: 'from-sky-600 to-indigo-700',
    keyFacts: [
      'Running a 1 HP domestic water pump for 1 hour consumes ~0.75 kWh of electricity.',
      'Overhead tank overflows are a major source of wasted electricity and potable groundwater in Kerala households.',
      'Drip irrigation in campus gardens cuts water usage by over 50% compared to flood watering.'
    ],
    practicalTips: [
      'Install an automatic water-level controller to prevent overhead tank overflows.',
      'Fix dripping taps immediately; a slow drip wastes over 20 litres of water daily.',
      'Harvest rooftop rainwater for gardening and groundwater well recharging.'
    ],
    realWorldExample: 'Campus rainwater recharge wells built by NSS volunteers raise local water tables, ensuring well water availability during dry summer months.',
    relatedChallenge: 'Weekly 10-Minute Energy Audit'
  }
];

interface LearnPageProps {
  setActiveTab: (tab: string) => void;
}

export const LearnPage: React.FC<LearnPageProps> = ({ setActiveTab }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalTopic, setActiveModalTopic] = useState<Topic | null>(null);

  const categories = [
    { id: 'all', label: 'All Topics' },
    { id: 'energy', label: 'Energy & Power' },
    { id: 'climate', label: 'Climate Science' },
    { id: 'transport', label: 'Mobility' },
    { id: 'waste', label: 'Waste & Plastic' },
    { id: 'lifestyle', label: 'Sustainable Living' },
  ];

  const filteredTopics = TOPICS.filter(t => {
    const matchesCat = selectedCategory === 'all' || t.category === selectedCategory;
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.shortDesc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10 text-left">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-800 text-xs font-semibold">
          <BookOpen className="w-3.5 h-3.5 text-sky-600" />
          <span>Environmental Education & Awareness</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Learn & Explore
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Comprehensive, accessible sustainability knowledge curated for school students, NSS volunteers, and eco-conscious citizens.
        </p>
      </div>

      {/* Search and Category Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search topics or concepts..."
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === c.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTopics.map((topic) => {
          const Icon = topic.icon;
          return (
            <div
              key={topic.id}
              onClick={() => setActiveModalTopic(topic)}
              className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer flex flex-col justify-between group space-y-4"
            >
              <div className="space-y-3">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${topic.color} text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {topic.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {topic.shortDesc}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs font-semibold text-emerald-600 border-t border-slate-100">
                <span>Read detailed guide</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Topic Detail Modal */}
      {activeModalTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setActiveModalTopic(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${activeModalTopic.color} text-white flex items-center justify-center`}>
                <activeModalTopic.icon className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                  {activeModalTopic.category}
                </span>
                <h2 className="text-xl font-bold text-slate-900">{activeModalTopic.title}</h2>
              </div>
            </div>

            {/* Content Body */}
            <p className="text-sm text-slate-700 leading-relaxed">
              {activeModalTopic.shortDesc}
            </p>

            {/* Key Facts */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Key Facts & Data:
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-600">
                {activeModalTopic.keyFacts.map((fact, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Practical Tips */}
            <div className="p-4 bg-emerald-50/70 border border-emerald-100 rounded-2xl space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-950">
                Practical Action Steps:
              </h4>
              <ul className="space-y-1.5 text-xs text-emerald-900">
                {activeModalTopic.practicalTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Real World Example */}
            <div className="text-xs text-slate-600 space-y-1">
              <span className="font-bold text-slate-900 block">Real-World Context:</span>
              <p className="italic text-slate-700">{activeModalTopic.realWorldExample}</p>
            </div>

            {/* Related Challenge Link */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">Related Green Action:</span>
              <button
                onClick={() => {
                  setActiveModalTopic(null);
                  setActiveTab('challenges');
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800"
              >
                <span>Take Challenge</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
