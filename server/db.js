import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, 'carboncalculator.db');
const db = new Database(dbPath);

// Enable WAL mode for high concurrency & performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  db.exec(`
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user', -- 'user' or 'admin'
      category TEXT NOT NULL DEFAULT 'Student', -- 'Student', 'NSS Volunteer', 'Teacher', 'General Public', 'Other'
      institution_name TEXT DEFAULT '',
      institution_type TEXT DEFAULT 'College', -- 'School', 'College', 'Other'
      district TEXT DEFAULT 'Thrissur',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login_at DATETIME DEFAULT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_institution ON users(institution_name);
    CREATE INDEX IF NOT EXISTS idx_users_district ON users(district);
    CREATE INDEX IF NOT EXISTS idx_users_category ON users(category);

    -- Carbon calculations history
    CREATE TABLE IF NOT EXISTS carbon_calculations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      daily_co2_kg REAL NOT NULL,
      monthly_co2_kg REAL NOT NULL,
      annual_co2_tonnes REAL NOT NULL,
      electricity_co2_kg REAL NOT NULL DEFAULT 0,
      transport_co2_kg REAL NOT NULL DEFAULT 0,
      food_co2_kg REAL NOT NULL DEFAULT 0,
      plastic_co2_kg REAL NOT NULL DEFAULT 0,
      waste_co2_kg REAL NOT NULL DEFAULT 0,
      lifestyle_co2_kg REAL NOT NULL DEFAULT 0,
      inputs_json TEXT NOT NULL,
      calculated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_calc_user_id ON carbon_calculations(user_id);
    CREATE INDEX IF NOT EXISTS idx_calc_date ON carbon_calculations(calculated_at);

    -- Daily Green Challenges catalogue
    CREATE TABLE IF NOT EXISTS challenges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      environmental_benefit TEXT NOT NULL,
      difficulty TEXT NOT NULL, -- 'Easy', 'Medium', 'Hard'
      category TEXT NOT NULL DEFAULT 'daily', -- 'daily' or 'weekly'
      points INTEGER NOT NULL DEFAULT 20,
      action_steps TEXT NOT NULL,
      badge_award TEXT DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- User challenge completions
    CREATE TABLE IF NOT EXISTS user_challenge_completions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      challenge_id INTEGER NOT NULL,
      points_earned INTEGER NOT NULL,
      notes TEXT DEFAULT '',
      completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_completions_user_id ON user_challenge_completions(user_id);
    CREATE INDEX IF NOT EXISTS idx_completions_challenge_id ON user_challenge_completions(challenge_id);
    CREATE INDEX IF NOT EXISTS idx_completions_date ON user_challenge_completions(completed_at);

    -- User Points summary
    CREATE TABLE IF NOT EXISTS user_points (
      user_id INTEGER PRIMARY KEY,
      total_points INTEGER NOT NULL DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- User Badges earned
    CREATE TABLE IF NOT EXISTS user_badges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      badge_id TEXT NOT NULL,
      badge_name TEXT NOT NULL,
      badge_description TEXT NOT NULL,
      awarded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, badge_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Emission Factors configuration & documentation
    CREATE TABLE IF NOT EXISTS emission_factors (
      key TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      value REAL NOT NULL,
      unit TEXT NOT NULL,
      category TEXT NOT NULL,
      source TEXT NOT NULL,
      assumptions TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Feedback and Enquiries
    CREATE TABLE IF NOT EXISTS enquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'General', -- 'Feedback', 'Suggestion', 'Collaboration', 'General'
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'new',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- User Login Audit Logs
    CREATE TABLE IF NOT EXISTS user_login_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      email TEXT NOT NULL,
      name TEXT NOT NULL,
      auth_method TEXT DEFAULT 'email', -- 'email', 'google', 'admin'
      ip_address TEXT DEFAULT '',
      user_agent TEXT DEFAULT '',
      logged_in_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_login_logs_user_id ON user_login_logs(user_id);
    CREATE INDEX IF NOT EXISTS idx_login_logs_date ON user_login_logs(logged_in_at);

    -- Challenge Submissions (Photo Proof Workflow)
    CREATE TABLE IF NOT EXISTS challenge_submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      challenge_id INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'submitted', -- 'submitted', 'verifying', 'verified', 'needs_review', 'rejected', 'failed'
      image_paths_json TEXT NOT NULL,
      image_hashes_json TEXT NOT NULL,
      user_notes TEXT DEFAULT '',
      evidence_confirmed INTEGER NOT NULL DEFAULT 1,
      ai_status TEXT DEFAULT 'pending', -- 'passed', 'flagged', 'failed', 'skipped'
      ai_confidence REAL DEFAULT 0,
      ai_relevance TEXT DEFAULT 'unknown', -- 'high', 'medium', 'low', 'irrelevant'
      ai_quality TEXT DEFAULT 'unknown', -- 'clear', 'blurry', 'dark', 'unusable'
      ai_reason TEXT DEFAULT '',
      ai_raw_json TEXT DEFAULT '',
      reviewer_id INTEGER DEFAULT NULL,
      review_decision TEXT DEFAULT NULL, -- 'approved', 'rejected', 'resubmission_requested'
      review_reason TEXT DEFAULT '',
      reviewed_at DATETIME DEFAULT NULL,
      points_awarded INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE,
      FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_sub_user_id ON challenge_submissions(user_id);
    CREATE INDEX IF NOT EXISTS idx_sub_challenge_id ON challenge_submissions(challenge_id);
    CREATE INDEX IF NOT EXISTS idx_sub_status ON challenge_submissions(status);
    CREATE INDEX IF NOT EXISTS idx_sub_created ON challenge_submissions(created_at);

    -- Verification Audit Events
    CREATE TABLE IF NOT EXISTS verification_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      submission_id INTEGER NOT NULL,
      event_type TEXT NOT NULL, -- 'submitted', 'ai_verified', 'ai_flagged', 'ai_rejected', 'manual_approved', 'manual_rejected', 'resubmission_requested'
      from_status TEXT,
      to_status TEXT,
      reason TEXT,
      metadata_json TEXT DEFAULT '{}',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (submission_id) REFERENCES challenge_submissions(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_events_submission_id ON verification_events(submission_id);

    -- Green Points Ledger (Transparent points accounting)
    CREATE TABLE IF NOT EXISTS points_ledger (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      challenge_id INTEGER,
      submission_id INTEGER,
      points INTEGER NOT NULL,
      transaction_type TEXT NOT NULL DEFAULT 'challenge_completion', -- 'challenge_completion', 'badge_bonus', 'admin_adjustment'
      description TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE SET NULL,
      FOREIGN KEY (submission_id) REFERENCES challenge_submissions(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_ledger_user_id ON points_ledger(user_id);

    -- Review Records
    CREATE TABLE IF NOT EXISTS review_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      submission_id INTEGER NOT NULL,
      reviewer_id INTEGER NOT NULL,
      decision TEXT NOT NULL,
      reason TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (submission_id) REFERENCES challenge_submissions(id) ON DELETE CASCADE,
      FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Migrate columns in challenges table if missing
  const challengeCols = db.prepare("PRAGMA table_info(challenges)").all().map(c => c.name);
  if (!challengeCols.includes('evidence_guidance')) {
    db.prepare("ALTER TABLE challenges ADD COLUMN evidence_guidance TEXT DEFAULT ''").run();
  }
  if (!challengeCols.includes('acceptable_evidence')) {
    db.prepare("ALTER TABLE challenges ADD COLUMN acceptable_evidence TEXT DEFAULT ''").run();
  }
  if (!challengeCols.includes('recommended_photos')) {
    db.prepare("ALTER TABLE challenges ADD COLUMN recommended_photos INTEGER DEFAULT 1").run();
  }
  if (!challengeCols.includes('privacy_guidance')) {
    db.prepare("ALTER TABLE challenges ADD COLUMN privacy_guidance TEXT DEFAULT ''").run();
  }

  // Seed Emission Factors with Authoritative Indian & International Standards
  const factorsCount = db.prepare('SELECT COUNT(*) as count FROM emission_factors').get().count;
  if (factorsCount === 0) {
    const insertFactor = db.prepare(`
      INSERT INTO emission_factors (key, name, value, unit, category, source, assumptions)
      VALUES (@key, @name, @value, @unit, @category, @source, @assumptions)
    `);

    const factors = [
      {
        key: 'elec_india_grid',
        name: 'Indian National Electricity Grid Average',
        value: 0.716,
        unit: 'kg CO2e / kWh',
        category: 'electricity',
        source: 'Central Electricity Authority (CEA), CO2 Baseline Database for the Indian Power Sector, Version 19.0 (2024)',
        assumptions: 'Combined Margin (CM) grid emission factor accounting for current thermal-heavy generation and growing renewable feed-in.'
      },
      {
        key: 'elec_kerala_grid',
        name: 'Kerala State Mixed Hydro-Grid Average',
        value: 0.58,
        unit: 'kg CO2e / kWh',
        category: 'electricity',
        source: 'KSEB Annual Resource & Energy Audit / CEA Regional Mix',
        assumptions: 'Reflects Kerala internal hydel generation blended with central thermal drawal.'
      },
      {
        key: 'trans_car_petrol',
        name: 'Petrol Passenger Car',
        value: 0.142,
        unit: 'kg CO2e / passenger-km',
        category: 'transportation',
        source: 'Automotive Research Association of India (ARAI) & CPCB Fuel Economy Standards',
        assumptions: 'Average compact/hatchback petrol car (14 km/L fuel efficiency, 2.3 kg CO2/L fuel).'
      },
      {
        key: 'trans_car_diesel',
        name: 'Diesel Passenger Car',
        value: 0.165,
        unit: 'kg CO2e / passenger-km',
        category: 'transportation',
        source: 'ARAI & Central Pollution Control Board (CPCB)',
        assumptions: 'Average compact/mid-size diesel car (16 km/L efficiency, 2.68 kg CO2/L fuel).'
      },
      {
        key: 'trans_two_wheeler_petrol',
        name: 'Petrol Two-Wheeler (Motorcycle / Scooter)',
        value: 0.045,
        unit: 'kg CO2e / passenger-km',
        category: 'transportation',
        source: 'ARAI Indian Driving Cycle Test Protocol & GHG Protocol India',
        assumptions: 'Average commuter motorcycle/scooter with 45-50 km/L fuel economy.'
      },
      {
        key: 'trans_two_wheeler_ev',
        name: 'Electric Two-Wheeler',
        value: 0.018,
        unit: 'kg CO2e / passenger-km',
        category: 'transportation',
        source: 'WRI India Electric Vehicle Life Cycle Assessment',
        assumptions: 'Consumes ~0.025 kWh per km charged via Indian baseline grid electricity.'
      },
      {
        key: 'trans_car_ev',
        name: 'Electric Passenger Car',
        value: 0.086,
        unit: 'kg CO2e / passenger-km',
        category: 'transportation',
        source: 'WRI India EV Grid Transition Studies',
        assumptions: 'Consumes ~0.12 kWh per km charged on CEA standard grid mix.'
      },
      {
        key: 'trans_bus_public',
        name: 'Public Bus (State Transport / City Bus)',
        value: 0.032,
        unit: 'kg CO2e / passenger-km',
        category: 'transportation',
        source: 'KSRTC / GHG Protocol India Transport Guidelines',
        assumptions: 'Diesel city/intercity bus with typical 60% average passenger occupancy.'
      },
      {
        key: 'trans_train',
        name: 'Suburban / Express Train (Electric Traction)',
        value: 0.016,
        unit: 'kg CO2e / passenger-km',
        category: 'transportation',
        source: 'Indian Railways Mission 41k & BEE Rail Energy Intensity',
        assumptions: 'Average passenger-km on 100% electrified broad-gauge network.'
      },
      {
        key: 'food_diet_heavy_meat',
        name: 'High Non-Vegetarian Diet (Daily Meat/Poultry)',
        value: 7.2,
        unit: 'kg CO2e / person / day',
        category: 'food',
        source: 'IPCC AR6 Working Group III & Poore and Nemecek (Science 2018)',
        assumptions: 'Daily consumption of ruminant and poultry meat with high agricultural footprint.'
      },
      {
        key: 'food_diet_avg_nonveg',
        name: 'Medium Non-Vegetarian Diet (2-3 times/week)',
        value: 4.8,
        unit: 'kg CO2e / person / day',
        category: 'food',
        source: 'ICMR-NIN Dietary Assessment & IPCC Food Systems Data',
        assumptions: 'Moderate non-veg consumption typical of South Indian household patterns.'
      },
      {
        key: 'food_diet_veg',
        name: 'Vegetarian Diet (Lacto-Vegetarian)',
        value: 3.2,
        unit: 'kg CO2e / person / day',
        category: 'food',
        source: 'Poore and Nemecek (Science 2018) & Centre for Science and Environment (CSE)',
        assumptions: 'Plant-based diet supplemented with moderate dairy and pulses.'
      },
      {
        key: 'food_diet_vegan',
        name: 'Strict Plant-Based / Vegan Diet',
        value: 2.1,
        unit: 'kg CO2e / person / day',
        category: 'food',
        source: 'Poore and Nemecek (Science 2018)',
        assumptions: '100% plant-based with local seasonal agricultural produce.'
      },
      {
        key: 'cooking_lpg_cylinder',
        name: 'Domestic LPG Cooking Cylinder (14.2 kg)',
        value: 42.6,
        unit: 'kg CO2e / 14.2kg cylinder',
        category: 'lifestyle',
        source: 'Ministry of Petroleum and Natural Gas (MoPNG) & IPCC EFDB',
        assumptions: '3.0 kg CO2e per kg of LPG combusted including upstream refining.'
      },
      {
        key: 'plastic_single_use',
        name: 'Single-Use Plastic Packaging',
        value: 0.06,
        unit: 'kg CO2e / single-use item',
        category: 'plastic',
        source: 'UNEP Single-Use Plastics LCA & CIEL (Center for International Environmental Law)',
        assumptions: 'Lifecycle production, polymer refining, and uncollected municipal disposal.'
      },
      {
        key: 'waste_unsegregated',
        name: 'Unsegregated Landfill Municipal Solid Waste',
        value: 0.45,
        unit: 'kg CO2e / kg waste',
        category: 'waste',
        source: 'IPCC Waste Model & Swachh Bharat Urban Solid Waste Assessment',
        assumptions: 'Anaerobic decomposition in open dumps producing methane.'
      }
    ];

    const insertMany = db.transaction((rows) => {
      for (const row of rows) insertFactor.run(row);
    });
    insertMany(factors);
  }

  // Seed & Update Engaging Daily Green Challenges with Photo Proof Guidelines
  const challenges = [
    {
      slug: 'switch-off-standby',
      title: 'Banish Phantom Loads: Unplug Unused Chargers & Standby Devices',
      description: 'Vampire power from plugged-in laptop chargers, TV boxes, and microwave standby displays consumes 5-10% of household electricity without doing any useful work.',
      environmental_benefit: 'Saves 0.3 - 0.7 kWh of electricity per day and prevents ~0.5 kg CO2e grid emissions.',
      difficulty: 'Easy',
      category: 'daily',
      points: 15,
      action_steps: 'Inspect your bedroom/study desk; switch off power strips and unplug phone/laptop chargers when not actively charging.',
      badge_award: 'energy_saver',
      evidence_guidance: 'Submit a photo clearly showing switched-off power strips, unplugged laptop/phone chargers, or appliances disconnected at the wall outlet.',
      acceptable_evidence: 'Power strip switch in the OFF position, unplugged charging bricks on a desk, or TV entertainment unit with wall switch toggled off.',
      recommended_photos: 1,
      privacy_guidance: 'Do not include computer screens displaying confidential personal emails, passwords, or identification documents.'
    },
    {
      slug: 'reusable-water-bottle',
      title: 'Carry a Reusable Water Bottle: Zero Single-Use Plastic Today',
      description: 'Single-use PET bottles generate immense fossil fuel refining emissions and break down into microplastics that pollute rivers and marine ecosystems.',
      environmental_benefit: 'Eliminates 2-3 single-use plastic bottles, saving ~150g of plastic waste and 0.4 kg CO2e.',
      difficulty: 'Easy',
      category: 'daily',
      points: 20,
      action_steps: 'Fill your personal steel, copper, or reusable bottle before heading to college, school, or work. Refill at campus water points.',
      badge_award: 'plastic_free_pioneer',
      evidence_guidance: 'Submit a photo of your reusable water bottle (stainless steel, copper, glass, or durable BPA-free plastic) being carried or refilled for daily use.',
      acceptable_evidence: 'Personal reusable bottle beside study/work desk, refilling at campus water dispenser, or reusable cloth/jute shopping bag.',
      recommended_photos: 1,
      privacy_guidance: 'Focus the photo on the reusable bottle or bag; do not include close-up faces or personal ID cards.'
    },
    {
      slug: 'active-mobility-or-bus',
      title: 'Sustainable Commute: Walk, Cycle, or Ride Public Transit',
      description: 'Short car and solo scooter rides produce the highest per-passenger emission rates. Taking public buses, trains, or walking promotes cleaner air.',
      environmental_benefit: 'Replaces ~5-10 km of solo motorcycle or car ride, saving 0.4 - 1.2 kg CO2e.',
      difficulty: 'Medium',
      category: 'daily',
      points: 25,
      action_steps: 'Choose public bus/train for your daily commute or walk/cycle for local neighborhood errands within 1.5 km.',
      badge_award: 'green_commuter',
      evidence_guidance: 'Submit safe evidence of sustainable commuting: your bicycle parked at campus/destination, a valid public bus or train ticket, or a daily step-counter summary.',
      acceptable_evidence: 'Bicycle parked in a rack, public transit ticket/pass, suburban train platform/carriage, or fitness step-count screenshot (5,000+ steps).',
      recommended_photos: 1,
      privacy_guidance: 'SAFETY FIRST: Never take photos while actively riding a bicycle or operating any vehicle. Blur or crop any passenger faces or private ticket barcode details.'
    },
    {
      slug: 'zero-food-plate-waste',
      title: 'Clean Plate Club: Zero Food Wastage Across All Meals',
      description: 'Wasted food represents wasted irrigation water, fertilizers, diesel transportation, and anaerobic methane emissions in municipal dump yards.',
      environmental_benefit: 'Prevents 300g of wasted organic matter and avoids ~0.8 kg CO2e embedded agricultural footprint.',
      difficulty: 'Easy',
      category: 'daily',
      points: 20,
      action_steps: 'Take sensible portion sizes during breakfast, lunch, and dinner. Finish everything on your plate or pack leftovers safely.',
      badge_award: 'mindful_eater',
      evidence_guidance: 'Submit a photo of your clean dining plate or tiffin box after completing your meal, showing zero edible food discarded.',
      acceptable_evidence: 'Empty dining plate or college mess tiffin box with zero leftover food, or safely packaged meal portions stored in reusable containers.',
      recommended_photos: 1,
      privacy_guidance: 'Frame photo strictly on the dining plate or tiffin container.'
    },
    {
      slug: 'household-source-segregation',
      title: 'Source Segregation: Separate Wet Kitchen & Dry Recyclable Waste',
      description: 'Unsegregated waste rots in open dumpsites releasing methane. Segregating at home enables decentralized composting and high-value dry recycling.',
      environmental_benefit: 'Diverts 1.5 kg of waste from open dumping, supporting Haritha Karma Sena / municipal recycling.',
      difficulty: 'Medium',
      category: 'daily',
      points: 25,
      action_steps: 'Maintain two separate bins at home: Green for organic peels/food scraps, Blue for clean dry paper, plastic, and cardboard.',
      badge_award: 'waste_warrior',
      evidence_guidance: 'Submit a photo showing segregated waste collection bins: separated wet biodegradable kitchen waste and clean dry recyclables.',
      acceptable_evidence: 'Two distinct bins (green for organic kitchen peels and blue for dry paper/plastics), or segregated bags prepared for municipal Haritha Karma Sena collection.',
      recommended_photos: 1,
      privacy_guidance: 'Do not photograph addressed postal envelopes, bank statements, or utility bills containing private addresses.'
    },
    {
      slug: 'natural-ventilation-day',
      title: 'Fresh Air Hours: Cool with Natural Breeze & Fans Instead of AC',
      description: 'Air conditioners are the largest electricity consumers in modern homes. Using natural cross-ventilation during morning and evening slashes load.',
      environmental_benefit: 'Saves 3-6 kWh of cooling power, averting 2.2 - 4.3 kg CO2e in hot seasons.',
      difficulty: 'Medium',
      category: 'daily',
      points: 25,
      action_steps: 'Open windows for cross breeze during pleasant hours, set ceiling fan to comfortable speeds, and keep AC off.',
      badge_award: 'cool_conserver',
      evidence_guidance: 'Submit a photo showing an open window allowing natural breeze and daylight, with ceiling fan in operation and AC turned off.',
      acceptable_evidence: 'Room window opened for natural ventilation with ceiling fan running, AC wall switch in OFF position, or AC remote set to 24°C+ Eco Mode.',
      recommended_photos: 1,
      privacy_guidance: 'Keep photo framed towards the window, fan, or switchboard. Avoid capturing personal living space clutter.'
    },
    {
      slug: 'room-energy-audit-weekly',
      title: 'Weekly 10-Minute Energy Audit: Campus Classroom or Home',
      description: 'NSS volunteers and students inspect unoccupied classrooms, corridors, labs, or rooms at home to turn off unnecessary lights and humming fans.',
      environmental_benefit: 'Identifies faulty appliances and prevents 5+ kWh of wasteful classroom/household idle electricity.',
      difficulty: 'Medium',
      category: 'weekly',
      points: 35,
      action_steps: 'Walk through your department, floor, or home. Switch off idle lighting/fans. Check if refrigerator door gaskets seal tightly.',
      badge_award: 'nss_energy_auditor',
      evidence_guidance: 'Submit a photo of an unoccupied classroom, lab, or home room with all light switches and fan controls switched off.',
      acceptable_evidence: 'Vacant classroom or study room with switched-off lighting board, or inspected power distribution board with idle circuits turned off.',
      recommended_photos: 1,
      privacy_guidance: 'Ensure no students or colleagues are inadvertently included in the photo without their consent.'
    },
    {
      slug: 'spread-sustainability-word',
      title: 'Peer Awareness: Explain Carbon Footprint to a Friend or Family',
      description: 'Individual action multiplies when shared. Introducing one peer, family member, or classmate to CarbonCalculator triggers widespread community habit changes.',
      environmental_benefit: 'Creates ripple awareness, inspiring peers to calculate their baseline emissions and join green challenges.',
      difficulty: 'Easy',
      category: 'weekly',
      points: 30,
      action_steps: 'Show the CarbonCalculator platform to a classmate or family member and guide them through their first footprint estimation.',
      badge_award: 'eco_advocate',
      evidence_guidance: 'Submit a photo of the CarbonCalculator website open on a screen while sharing it with a peer, or educational notes from an awareness discussion.',
      acceptable_evidence: 'CarbonCalculator footprint result screen being shown on a laptop/phone, or a brief NSS group discussion on carbon reduction.',
      recommended_photos: 1,
      privacy_guidance: 'Focus the photo on the screen or educational chart. Do not capture identifiable portraits of friends without consent.'
    },
    {
      slug: 'decentralized-composting',
      title: 'Home Composting: Divert Kitchen Scraps to Bio-Bin or Garden',
      description: 'Organic kitchen waste rich in nitrogen and moisture turns into nutrient-dense humus when aerobically composted instead of releasing landfill methane.',
      environmental_benefit: 'Permanently eliminates methane emission from 5 kg of household organic waste per week.',
      difficulty: 'Hard',
      category: 'weekly',
      points: 40,
      action_steps: 'Deposit kitchen vegetable cuttings, coffee grounds, and dry leaves into a home pipe-compost, bio-bin, or garden mulch bed.',
      badge_award: 'earth_restorer',
      evidence_guidance: 'Submit a photo of your household pipe-compost unit, bio-bin, vermicompost bin, or organic kitchen scraps added to garden mulch.',
      acceptable_evidence: 'Compost bin with vegetable peel deposits, home aerated bio-bin, or nutrient-rich finished compost being applied to plants.',
      recommended_photos: 1,
      privacy_guidance: 'Focus on the composting receptacle or garden bed.'
    },
    {
      slug: 'sapling-care-or-greenery',
      title: 'Nurture Nature: Plant or Care for Native Trees & Campus Greenery',
      description: 'Trees act as natural carbon sinks, sequestering atmospheric CO2, providing shade cooling, improving soil water retention, and supporting biodiversity.',
      environmental_benefit: 'A mature tree absorbs ~20-22 kg of CO2 per year over its lifetime.',
      difficulty: 'Medium',
      category: 'weekly',
      points: 35,
      action_steps: 'Water campus saplings, tend your home balcony plants, or plant a native fruit/shade sapling in your community.',
      badge_award: 'green_guardian',
      evidence_guidance: 'Submit a photo of planting a native sapling, watering campus trees, or tending potted balcony plants.',
      acceptable_evidence: 'Freshly planted or watered tree sapling, tending home balcony medicinal/flowering plants, or mulching young plants.',
      recommended_photos: 1,
      privacy_guidance: 'Focus on the plant, soil, and watering can or gardening tools.'
    }
  ];

  const challengesCount = db.prepare('SELECT COUNT(*) as count FROM challenges').get().count;
  if (challengesCount === 0) {
    const insertChallenge = db.prepare(`
      INSERT INTO challenges (
        slug, title, description, environmental_benefit, difficulty, category, points,
        action_steps, badge_award, evidence_guidance, acceptable_evidence, recommended_photos, privacy_guidance
      )
      VALUES (
        @slug, @title, @description, @environmental_benefit, @difficulty, @category, @points,
        @action_steps, @badge_award, @evidence_guidance, @acceptable_evidence, @recommended_photos, @privacy_guidance
      )
    `);

    const insertChallenges = db.transaction((rows) => {
      for (const row of rows) insertChallenge.run(row);
    });
    insertChallenges(challenges);
  } else {
    // Update existing challenges with guidance and evidence requirements
    const updateGuidance = db.prepare(`
      UPDATE challenges
      SET evidence_guidance = @evidence_guidance,
          acceptable_evidence = @acceptable_evidence,
          recommended_photos = @recommended_photos,
          privacy_guidance = @privacy_guidance
      WHERE slug = @slug
    `);

    const updateAll = db.transaction((rows) => {
      for (const row of rows) updateGuidance.run(row);
    });
    updateAll(challenges);
  }

  // Ensure login_count column exists
  try {
    db.prepare('ALTER TABLE users ADD COLUMN login_count INTEGER DEFAULT 0').run();
  } catch {}

  // Ensure default secure admin user exists if not already present
  const adminExists = db.prepare('SELECT id FROM users WHERE role = ?').get('admin');
  if (!adminExists) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync('vastEnergyCell@2026', salt);
    db.prepare(`
      INSERT INTO users (name, email, password_hash, role, category, institution_name, institution_type, district)
      VALUES (?, ?, ?, 'admin', 'NSS Volunteer', 'Vidya Academy of Science and Technology', 'College', 'Thrissur')
    `).run('VAST Energy Cell Admin', 'admin@vastenergycell.in', hash);
  }
}

export default db;
