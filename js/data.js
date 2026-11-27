/* Static content: categories, deeds, vouchers, badges, articles, challenges and demo data.
   Impact figures are approximate prototype estimates, not audited values. */
window.GC = window.GC || {};
GC.screens = GC.screens || {};

GC.CATS = [
  { id: 'carbon', name: 'Carbon', icon: 'cloud', blurb: 'Travel, power and trees', examples: 'Walk instead of driving, switch off lights' },
  { id: 'water', name: 'Water', icon: 'drop', blurb: 'Save and reuse water', examples: 'Fix a leaking tap, collect rainwater' },
  { id: 'food', name: 'Food', icon: 'leaf', blurb: 'Waste less, share more', examples: 'Finish every meal, donate surplus food' },
  { id: 'farm', name: 'Farm', icon: 'sprout', blurb: 'Kind to soil and water', examples: 'Drip irrigation, mulching, no burning' }
];

GC.DEED_LEVELS = {
  basic: { name: 'Basic deed', points: 15, hint: 'A small everyday habit.' },
  good: { name: 'Really good deed', points: 25, hint: 'A bigger effort or one that takes planning.' },
  very: { name: 'Very good deed', points: 50, hint: 'A sustained effort or a clear change in routine.' },
  excellent: { name: 'Excellent deed', points: 100, hint: 'A major deed that lasts or helps many people.' }
};

/* unit, min = minimum amount, once = one-time deed (counts once ever).
   Impact per unit: co2 (kg), water (L), food (kg), irr (L irrigation), acres. */
GC.DEEDS = [
  // Carbon
  { id: 'c1', cat: 'carbon', name: 'Walk or cycle instead of driving', level: 'basic', unit: 'km', min: 1, co2: 0.2 },
  { id: 'c2', cat: 'carbon', name: 'Take a bus, metro or train instead of a car', level: 'basic', unit: 'km', min: 3, co2: 0.12 },
  { id: 'c3', cat: 'carbon', name: 'Share a ride (carpool)', level: 'good', unit: 'km', min: 3, co2: 0.1 },
  { id: 'c4', cat: 'carbon', name: 'Switch off lights and fans when not needed', level: 'basic', unit: 'hours', min: 1, co2: 0.07 },
  { id: 'c5', cat: 'carbon', name: 'Dry clothes in the sun, not a dryer', level: 'basic', unit: 'loads', min: 1, co2: 2 },
  { id: 'c6', cat: 'carbon', name: 'Plant a tree', level: 'very', unit: 'trees', min: 1, co2: 20 },
  { id: 'c7', cat: 'carbon', name: 'Use solar power for the day', level: 'very', unit: 'kWh', min: 1, co2: 0.7 },
  { id: 'c8', cat: 'carbon', name: 'Install rooftop solar or an LED lighting set', level: 'excellent', unit: 'systems', min: 1, co2: 250, once: true },
  // Water
  { id: 'w1', cat: 'water', name: 'Take a bucket bath or a shorter shower', level: 'basic', unit: 'litres saved', min: 10, water: 1 },
  { id: 'w2', cat: 'water', name: 'Fix a leaking tap or pipe', level: 'good', unit: 'taps', min: 1, water: 200 },
  { id: 'w3', cat: 'water', name: 'Reuse washing water for plants or cleaning', level: 'basic', unit: 'litres', min: 10, water: 1 },
  { id: 'w4', cat: 'water', name: 'Collect rainwater', level: 'very', unit: 'litres', min: 20, water: 1 },
  { id: 'w5', cat: 'water', name: 'Turn off the tap while brushing or shaving', level: 'basic', unit: 'times', min: 1, water: 6 },
  { id: 'w6', cat: 'water', name: 'Run the washing machine only with a full load', level: 'good', unit: 'loads', min: 1, water: 40 },
  { id: 'w7', cat: 'water', name: 'Report and repair a leak at a shared tap', level: 'very', unit: 'leaks', min: 1, water: 500 },
  { id: 'w8', cat: 'water', name: 'Set up rainwater harvesting', level: 'excellent', unit: 'systems', min: 1, water: 5000, once: true },
  // Food
  { id: 'f1', cat: 'food', name: 'Finish every meal with no leftovers', level: 'basic', unit: 'meals', min: 1, food: 0.3, co2: 0.75 },
  { id: 'f2', cat: 'food', name: 'Plan meals and buy only what you need', level: 'basic', unit: 'days', min: 1, food: 0.4, co2: 1 },
  { id: 'f3', cat: 'food', name: 'Compost kitchen waste', level: 'good', unit: 'kg', min: 0.5, food: 1, co2: 0.5 },
  { id: 'f4', cat: 'food', name: 'Donate surplus food to an NGO', level: 'very', unit: 'kg', min: 1, food: 1, co2: 2.5 },
  { id: 'f5', cat: 'food', name: 'Eat a plant-based meal', level: 'basic', unit: 'meals', min: 1, co2: 1.5 },
  { id: 'f6', cat: 'food', name: 'Turn leftovers into a new meal', level: 'good', unit: 'meals', min: 1, food: 0.3, co2: 0.75 },
  { id: 'f7', cat: 'food', name: 'Organise a food-sharing drive', level: 'excellent', unit: 'drives', min: 1, food: 10, co2: 25 },
  { id: 'f8', cat: 'food', name: 'Start a home or school kitchen garden', level: 'excellent', unit: 'gardens', min: 1, food: 5, co2: 10, once: true },
  // Farm
  { id: 'r1', cat: 'farm', name: 'Use drip or sprinkler irrigation', level: 'good', unit: 'acres', min: 0.1, irr: 3000, acres: 1 },
  { id: 'r2', cat: 'farm', name: 'Mulch the soil to hold moisture', level: 'good', unit: 'acres', min: 0.1, irr: 1500, acres: 1 },
  { id: 'r3', cat: 'farm', name: 'Return crop residue to the soil, no burning', level: 'very', unit: 'acres', min: 0.1, co2: 150, acres: 1 },
  { id: 'r4', cat: 'farm', name: 'Make and use compost or vermicompost', level: 'good', unit: 'kg', min: 5, co2: 0.3 },
  { id: 'r5', cat: 'farm', name: 'Rotate or intercrop your crops', level: 'very', unit: 'acres', min: 0.1, acres: 1 },
  { id: 'r6', cat: 'farm', name: 'Check soil moisture before watering', level: 'basic', unit: 'checks', min: 1, irr: 500 },
  { id: 'r7', cat: 'farm', name: 'Plant trees on the field boundary', level: 'very', unit: 'trees', min: 1, co2: 20 },
  { id: 'r8', cat: 'farm', name: 'Install a drip irrigation system', level: 'excellent', unit: 'systems', min: 1, irr: 20000, acres: 1, once: true }
];

/* Sensible limits for one entry (one deed, one day).
   max   = most that is believable in a day
   scale = the limit grows with household size (up to 50 people)
   int   = whole numbers only
   Deeds measured in acres can never be more than the land size saved in My farm. */
(function () {
  const L = {
    c1: { max: 60 }, c2: { max: 150 }, c3: { max: 150 }, c4: { max: 24, scale: 1 }, c5: { max: 6, scale: 1, int: 1 },
    c6: { max: 20, int: 1 }, c7: { max: 30, scale: 1 }, c8: { max: 1, int: 1 },
    w1: { max: 150, scale: 1 }, w2: { max: 5, int: 1 }, w3: { max: 200, scale: 1 }, w4: { max: 3000 }, w5: { max: 10, scale: 1, int: 1 },
    w6: { max: 3, scale: 1, int: 1 }, w7: { max: 3, int: 1 }, w8: { max: 1, int: 1 },
    f1: { max: 5, scale: 1, int: 1 }, f2: { max: 1, int: 1 }, f3: { max: 10, scale: 1 }, f4: { max: 100 }, f5: { max: 5, scale: 1, int: 1 },
    f6: { max: 3, scale: 1, int: 1 }, f7: { max: 2, int: 1 }, f8: { max: 1, int: 1 },
    r1: { acres: 1 }, r2: { acres: 1 }, r3: { acres: 1 }, r4: { max: 1000 }, r5: { acres: 1 }, r6: { max: 10, int: 1 }, r7: { max: 200, int: 1 }, r8: { max: 1, int: 1 }
  };
  GC.DEEDS.forEach((d) => { Object.assign(d, L[d.id] || {}); });
})();
GC.HOUSEHOLD_MAX = 500;      // hostels, ashrams and large joint families are allowed
GC.HOUSEHOLD_ASK = 25;       // above this we ask "is that right?"
GC.LAND_MAX = 5000;          // acres
GC.TRIPS_PER_DAY = 10;
GC.KWH_PER_PERSON_WEEK = 150;  GC.KWH_MIN_WEEK = 2;
GC.LITRES_PER_PERSON_WEEK = 3500; GC.LITRES_MIN_WEEK = 50;

GC.VOUCHERS = [
  { id: 'v1', name: 'Participation certificate', cost: 600, level: 'Beginner', desc: 'A certificate for your green habits.' },
  { id: 'v2', name: '5% shop discount', cost: 1000, level: 'Beginner', desc: 'A discount at a partner shop.' },
  { id: 'v3', name: 'Tree sapling pickup', cost: 1500, level: 'Beginner', desc: 'Collect a free sapling to plant.' },
  { id: 'v4', name: 'Free bus ride day', cost: 2000, level: 'Green', desc: 'A day of free local bus rides.' },
  { id: 'v5', name: 'Electricity bill discount', cost: 3500, level: 'Green', desc: 'A discount on one electricity bill.' },
  { id: 'v6', name: 'Water bill rebate', cost: 5000, level: 'Champion', desc: 'A rebate on one water bill.' },
  { id: 'v7', name: 'Property tax rebate (idea)', cost: 10000, level: 'Champion', desc: 'An idea for a future local-government partnership.' }
];

GC.BADGES = [
  { id: 'first', name: 'First log', desc: 'Log your first action.' },
  { id: 'streak7', name: '7-day streak', desc: 'Log something seven days in a row.' },
  { id: 'water', name: 'Water Saver', desc: 'Earn 300 net points in Water.' },
  { id: 'food', name: 'Food Rescuer', desc: 'Donate surplus food to an NGO.' },
  { id: 'carbon', name: 'Carbon Cutter', desc: 'Earn 300 net points in Carbon.' },
  { id: 'farm', name: 'Farm Steward', desc: 'Earn 300 net points in Farm.' },
  { id: 'green', name: 'Reached Green', desc: 'Reach 3,000 Green Credit.' },
  { id: 'champion', name: 'Reached Champion', desc: 'Reach 5,000 Green Credit.' }
];

GC.GOALS = {
  carbon: 'Walk, cycle or take public transport for one short trip today.',
  water: 'Turn off the tap while brushing and note the litres you saved.',
  food: 'Finish every meal today and log it.',
  farm: 'Check soil moisture before you water the field.'
};

GC.TIPS = [
  'A dripping tap can waste dozens of litres a day. Fixing it takes minutes.',
  'Short trips add up. Walking or cycling under two kilometres avoids a cold-start car trip.',
  'Switching off devices at the plug stops standby power from creeping up your bill.',
  'Plan three meals ahead and shop with a list to waste less food.',
  'Water plants early in the morning so less water evaporates.',
  'A full washing machine load uses water and power better than two half loads.',
  'Leftover rice and rotis can become tomorrow\'s breakfast.',
  'Mulch around plants to keep soil moist for longer.',
  'Dry clothes in the sun when you can. It is free and gentle on fabric.',
  'Collect the first rain of the season from a clean roof and reuse it for cleaning.',
  'Check soil moisture with your finger before turning on the pump.',
  'Share a ride to school or work once a week and see the difference.'
];

/* Learn articles. Each has a three-question quiz. a = index of the right answer. */
GC.ARTICLES = [
  { id: 'a1', cat: 'carbon', title: 'Short trips, big difference',
    body: 'Many everyday trips are short. Walking or cycling for these trips uses no fuel, keeps the air cleaner and costs nothing. When the trip is longer, a bus, metro or train carries many people for the fuel one car uses. Even sharing a car with one more person cuts the emissions per person.',
    quiz: [
      { q: 'What is the best way to make a one-kilometre trip?', o: ['Drive alone', 'Walk or cycle', 'Take an auto alone'], a: 1 },
      { q: 'Why is a bus often better than a car for the same trip?', o: ['It carries many people at once', 'It is faster', 'It uses no fuel'], a: 0 },
      { q: 'What does sharing a ride do?', o: ['Doubles the emissions', 'Cuts the emissions per person', 'Has no effect'], a: 1 }
    ] },
  { id: 'a2', cat: 'carbon', title: 'Switch off and save power',
    body: 'Lights, fans and chargers use power even when nobody needs them. Switching them off when you leave a room helps. Devices left on standby also draw a little power all day. LED bulbs give the same light while using far less electricity than old bulbs.',
    quiz: [
      { q: 'What should you do when you leave a room?', o: ['Leave the fan on', 'Switch off lights and fans', 'Open all the windows'], a: 1 },
      { q: 'What is standby power?', o: ['Power used by devices that are plugged in but idle', 'Power from solar panels', 'Power used only at night'], a: 0 },
      { q: 'Which bulb uses much less electricity?', o: ['LED', 'Old filament bulb', 'They are all the same'], a: 0 }
    ] },
  { id: 'a3', cat: 'water', title: 'Fix the drip',
    body: 'A tap that drips all day wastes a surprising amount of water. Fixing a washer is a small job. Turning off the tap while brushing your teeth or washing your face saves water every single day. Tell your family or building manager when you notice a leak.',
    quiz: [
      { q: 'What should you do when a tap keeps dripping?', o: ['Ignore it', 'Get it fixed soon', 'Turn it on fully'], a: 1 },
      { q: 'When can you turn the tap off to save water?', o: ['While brushing your teeth', 'Never', 'Only at night'], a: 0 },
      { q: 'Who should you tell about a leak in a shared pipe?', o: ['Nobody', 'The family or building manager', 'Only a friend'], a: 1 }
    ] },
  { id: 'a4', cat: 'water', title: 'Catch the rain',
    body: 'Rain that falls on a roof can be collected and stored, or guided into the ground so it refills groundwater. Let the first rain wash the roof before you collect, and keep the storage covered. Rainwater is good for gardens, cleaning and flushing.',
    quiz: [
      { q: 'Where does rainwater for collection usually come from?', o: ['The roof', 'The drain', 'The road'], a: 0 },
      { q: 'Why let the first rain pass before collecting?', o: ['It washes dirt off the roof', 'It is too heavy', 'It is hot'], a: 0 },
      { q: 'Collected rainwater is useful for:', o: ['Gardens and cleaning', 'Nothing', 'Only drinking without treatment'], a: 0 }
    ] },
  { id: 'a5', cat: 'food', title: 'Waste less food',
    body: 'Planning meals and shopping with a list helps you buy only what you need. Store vegetables properly and use older food first. Leftovers can become a new meal. Food that rots in a landfill gives off methane, a gas that warms the planet.',
    quiz: [
      { q: 'What helps you buy only what you need?', o: ['A shopping list', 'Shopping hungry', 'Buying in bulk always'], a: 0 },
      { q: 'What should you do with leftovers?', o: ['Throw them away', 'Turn them into a new meal', 'Leave them out all day'], a: 1 },
      { q: 'Food rotting in a landfill gives off:', o: ['Methane', 'Oxygen', 'Nothing'], a: 0 }
    ] },
  { id: 'a6', cat: 'food', title: 'Compost at home',
    body: 'Vegetable peels, tea leaves and garden waste can turn into compost, which feeds plants. Keep the heap or bin moist but not wet, and turn it now and then. Keep meat, oily food and dairy out of a simple home compost bin.',
    quiz: [
      { q: 'What can go in a simple home compost bin?', o: ['Vegetable peels', 'Meat', 'Plastic'], a: 0 },
      { q: 'Compost is mainly used to:', o: ['Feed plants and soil', 'Clean floors', 'Cook food'], a: 0 },
      { q: 'How should the compost be kept?', o: ['Moist but not wet', 'Completely dry', 'Full of water'], a: 0 }
    ] },
  { id: 'a7', cat: 'farm', title: 'Water the root, not the air',
    body: 'Drip irrigation puts water near the roots, so less is lost to evaporation and runoff. Mulch, such as straw or dry leaves, covers the soil and keeps it moist for longer. Checking soil moisture before watering avoids watering too much.',
    quiz: [
      { q: 'Where does drip irrigation put the water?', o: ['Near the roots', 'On the leaves only', 'On the path'], a: 0 },
      { q: 'What does mulch do?', o: ['Keeps soil moist longer', 'Dries the soil', 'Adds salt'], a: 0 },
      { q: 'What should you do before watering?', o: ['Check soil moisture', 'Water at noon', 'Skip the check'], a: 0 }
    ] },
  { id: 'a8', cat: 'farm', title: 'Do not burn the stubble',
    body: 'Burning crop residue fills the air with smoke and burns away nutrients the soil needs. Residue can be mixed into the soil, used as mulch or turned into compost. These options keep the soil healthy and the air cleaner for everyone nearby.',
    quiz: [
      { q: 'What does burning crop residue cause?', o: ['Smoke and air pollution', 'Cleaner air', 'More rain'], a: 0 },
      { q: 'What can you do with crop residue instead?', o: ['Use it as mulch or compost', 'Burn it faster', 'Throw it in a river'], a: 0 },
      { q: 'Healthy soil needs:', o: ['Nutrients and organic matter', 'Only chemicals', 'Nothing'], a: 0 }
    ] }
];

/* Challenges. type "days" counts distinct days with a matching log; "sum" counts a total amount. */
GC.CHALLENGES = [
  { id: 'ch1', title: '7 days with no food waste', desc: 'Log a food-saving deed on seven different days.', cat: 'food', type: 'days', target: 7, deeds: ['f1', 'f2', 'f6'] },
  { id: 'ch2', title: 'Water Week', desc: 'Log a water deed on seven different days.', cat: 'water', type: 'days', target: 7 },
  { id: 'ch3', title: 'Car-free Sunday', desc: 'Walk, cycle or use public transport on a Sunday.', cat: 'carbon', type: 'sunday', target: 1, deeds: ['c1', 'c2', 'c3'] },
  { id: 'ch4', title: 'Plant three trees', desc: 'Plant three trees and log them.', cat: 'carbon', type: 'sum', target: 3, deeds: ['c6', 'r7'] },
  { id: 'ch5', title: 'No crop-residue burning', desc: 'Return residue to the soil on five different days.', cat: 'farm', type: 'days', target: 5, deeds: ['r3'] }
];
GC.MAX_ACTIVE_CHALLENGES = 3;

GC.STATES = ['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'];

GC.PROFILE_TYPES = ['Household', 'Student', 'Farmer', 'Shop', 'School'];
GC.AGE_GROUPS = ['Under 18', '18 to 25', '26 to 40', '41 to 60', 'Over 60'];
GC.IRRIGATION = ['Rain-fed', 'Canal', 'Borewell or tube well', 'Drip', 'Sprinkler', 'Other'];

/* Demo community data. Clearly labelled "Demo community" in the app. */
GC.DEMO_PEOPLE = [
  { name: 'Meera P.', place: 'Ward 12', w: { carbon: 90, water: 60, food: 55, farm: 0 }, m: { carbon: 310, water: 240, food: 190, farm: 0 } },
  { name: 'Arjun K.', place: 'Green Valley', w: { carbon: 40, water: 80, food: 70, farm: 0 }, m: { carbon: 190, water: 260, food: 220, farm: 0 } },
  { name: 'Sana R.', place: 'Lotus Apartments', w: { carbon: 60, water: 50, food: 65, farm: 0 }, m: { carbon: 240, water: 190, food: 230, farm: 0 } },
  { name: 'Kabir D.', place: 'Hill View', w: { carbon: 20, water: 40, food: 30, farm: 90 }, m: { carbon: 90, water: 150, food: 120, farm: 330 } },
  { name: 'Lakshmi N.', place: 'Kisan Colony', w: { carbon: 10, water: 30, food: 20, farm: 100 }, m: { carbon: 60, water: 120, food: 90, farm: 380 } },
  { name: 'Rohan S.', place: 'Green Valley', w: { carbon: 55, water: 35, food: 40, farm: 0 }, m: { carbon: 200, water: 140, food: 170, farm: 0 } },
  { name: 'Fatima Z.', place: 'Ward 12', w: { carbon: 45, water: 45, food: 35, farm: 0 }, m: { carbon: 170, water: 180, food: 150, farm: 0 } },
  { name: 'Vikram T.', place: 'Lotus Apartments', w: { carbon: 30, water: 25, food: 45, farm: 0 }, m: { carbon: 130, water: 110, food: 160, farm: 0 } },
  { name: 'Priya M.', place: 'Hill View', w: { carbon: 25, water: 30, food: 25, farm: 20 }, m: { carbon: 100, water: 120, food: 100, farm: 80 } },
  { name: 'Imran A.', place: 'Kisan Colony', w: { carbon: 5, water: 20, food: 15, farm: 70 }, m: { carbon: 30, water: 90, food: 60, farm: 260 } }
];
GC.DEMO_GROUPS = [
  { name: 'Green Valley School', members: 120, w: 5400, m: 19800 },
  { name: 'Ward 12 Residents', members: 85, w: 4100, m: 15200 },
  { name: 'Lotus Apartments', members: 40, w: 2300, m: 8700 },
  { name: 'Kisan Mitra Group', members: 30, w: 2100, m: 8100 },
  { name: 'Hill View Colony', members: 55, w: 2200, m: 8000 }
];

GC.COMMUNITY_CODES = {
  'GREEN-SCH': { name: 'Green Valley School', role: 'member', kind: 'School' },
  'GREEN-SCH-ADMIN': { name: 'Green Valley School', role: 'admin', kind: 'School', shared: 'GREEN-SCH' },
  'WARD-12': { name: 'Ward 12 Residents', role: 'member', kind: 'Neighbourhood' },
  'KISAN-1': { name: 'Kisan Mitra Group', role: 'member', kind: 'Farm group' }
};

GC.FOOD_PARTNERS = [
  { name: 'Neighbourhood Food Bank', area: 'Collects cooked and packed food', hours: 'Daily, 10 am to 6 pm' },
  { name: 'Community Kitchen Trust', area: 'Serves meals at a central kitchen', hours: 'Daily, 9 am to 8 pm' },
  { name: 'Shared Meals Society', area: 'Picks up surplus from events', hours: 'On request' }
];

GC.DEVICE_TYPES = [
  { id: 'water-flow', name: 'Water flow sensor', unit: 'L', feeds: 'water', icon: 'drop' },
  { id: 'tank', name: 'Tank level sensor', unit: '%', feeds: null, icon: 'tank' },
  { id: 'power', name: 'Electricity meter', unit: 'kWh', feeds: 'electricity', icon: 'bolt' },
  { id: 'soil', name: 'Soil moisture sensor', unit: '%', feeds: null, icon: 'sprout' }
];

GC.GRID_KG_PER_KWH = 0.7;
GC.BASELINE_WEEKS = 4;
GC.DAILY_CAT_CAP = 200;
GC.DAILY_PENALTY_CAP = 50;
GC.START_SCORE = 2000;
GC.MAX_SCORE = 7000;
GC.LEVELS = [
  { name: 'Beginner', min: 0, max: 2999 },
  { name: 'Green', min: 3000, max: 4999 },
  { name: 'Champion', min: 5000, max: 7000 }
];
GC.EVERYDAY = { bucketL: 15, kmPerKgCO2: 1 / 0.12, mealKg: 0.4 };
GC.AVG_HOUSEHOLD_WEEK = { co2: 12, water: 350, food: 2 };
