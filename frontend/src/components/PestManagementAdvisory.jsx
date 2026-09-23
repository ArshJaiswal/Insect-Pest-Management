import React from 'react';

const PestManagementAdvisory = ({ pest, confidence }) => {
  // Safely extract pest entity whether passed directly or wrapped in primaryMatch
  const actualPest = pest?.pest ? pest.pest : (pest || {});
  const pestName = actualPest.name || pest?.name || 'Identified Pest';
  const scientificName = actualPest.scientificName || pest?.scientificName || '';
  const affectedCrops = actualPest.affectedCrops || pest?.affectedCrops || [];
  const roundedConfidence = Math.round(Number(confidence) || 85);

  // Enhanced pest data with detailed management information
  const getDetailedManagement = (name, entity) => {
    const managementData = {
      'Aphids': {
        lifeCycle: 'Incomplete metamorphosis (egg → nymph → adult). 15–20 generations per season under warm conditions.',
        damageSymptoms: [
          'Yellowing and curling of leaf margins',
          'Sticky honeydew secretion with black sooty mold',
          'Stunted terminal shoot growth',
          'Transmission of viral diseases (e.g. BYDV, CMV)'
        ],
        culturalControl: [
          'Remove alternative weed hosts from field borders',
          'Avoid excessive synthetic nitrogen applications',
          'Intercrop with companion plants (mustard, coriander, marigold)',
          'Utilize reflective silver plastic mulches'
        ],
        mechanicalControl: [
          'Dislodge clusters with high-pressure water spray',
          'Install yellow sticky cards at canopy height (10-15 per acre)',
          'Hand-prune heavily infested shoots early in infestation'
        ],
        biologicalControl: [
          'Conserve natural predators: Ladybird beetles, Lacewings, Hoverflies',
          'Foliar spray of 5% Neem Seed Kernel Extract (NSKE) or Neem oil (1500 ppm)',
          'Apply entomopathogenic fungi (Verticillium lecanii)'
        ],
        chemicalControl: [
          'Acetamiprid 20% SP (0.5g/L water)',
          'Imidacloprid 17.8% SL (0.3ml/L water)',
          'Flonicamid 50% WG for resistant populations',
          '⚠️ Rotate chemical groups to prevent pesticide resistance'
        ]
      },
      'Colorado Potato Beetle': {
        lifeCycle: 'Complete metamorphosis (egg → larva → pupa → adult). 2-3 generations per year; adults overwinter in soil.',
        damageSymptoms: [
          'Extensive leaf skeletonization and defoliation',
          'Egg masses on underside of leaves',
          'Severe reduction in tuber bulk and yield',
          'Seedling destruction in early season'
        ],
        culturalControl: [
          'Rotate solanaceous crops with cereals or grasses',
          'Deep autumn plowing to expose overwintering beetles',
          'Plant certified resistant cultivars',
          'Sanitize crop residues immediately post-harvest'
        ],
        mechanicalControl: [
          'Hand-collect adults and egg clusters in smaller plots',
          'Install plastic-lined trench barriers around field perimeters',
          'Use floating row covers before emergence'
        ],
        biologicalControl: [
          'Apply Bacillus thuringiensis tenebrionis (Bt) against young larvae',
          'Release spined soldier bugs (Podisus maculiventris)',
          'Apply Beauveria bassiana bio-insecticide'
        ],
        chemicalControl: [
          'Spinosad (0.4ml/L water)',
          'Chlorantraniliprole 18.5% SC',
          'Thiamethoxam 25% WG',
          '⚠️ Target young larvae early in the season for highest efficacy'
        ]
      },
      'Armyworm': {
        lifeCycle: 'Complete metamorphosis (egg → larva → pupa → adult). Nocturnal feeding habit; 3-5 generations annually.',
        damageSymptoms: [
          'Ragged, chewed leaf margins and defoliation',
          'Stems cut at ground level on tender seedlings',
          'Large quantities of frass (droppings) in plant whorls',
          'Marching habit across fields when food source is depleted'
        ],
        culturalControl: [
          'Deep summer plowing to destroy pupae in soil',
          'Early synchronous sowing to escape peak flights',
          'Maintain clean field bunds free of grassy weeds'
        ],
        mechanicalControl: [
          'Erect pheromone traps (5 traps/acre) for flight monitoring',
          'Install light traps to capture nocturnal moths',
          'Dig trenches around uninfested fields to stop advancing larvae'
        ],
        biologicalControl: [
          'Apply Bacillus thuringiensis kurstaki (Bt) @ 2g/L',
          'Spray Nuclear Polyhedrosis Virus (NPV) @ 250 LE/acre',
          'Release Trichogramma egg parasitoids (50,000/acre)'
        ],
        chemicalControl: [
          'Chlorantraniliprole 18.5% SC (0.4ml/L water)',
          'Emamectin Benzoate 5% SG (0.4g/L water)',
          'Spinetoram 11.7% SC',
          '⚠️ Spray in late afternoon when larvae become active on upper leaves'
        ]
      },
      'Cotton Bollworm': {
        lifeCycle: 'Egg → larva (6 instars) → pupa → moth. Caterpillars bore into fruiting structures.',
        damageSymptoms: [
          'Bored holes in buds, flowers, and bolls with frass accumulation',
          'Premature flare-square and dropping of squares/bolls',
          'Internal destruction of developing seeds and lint'
        ],
        culturalControl: [
          'Grow trap crops like marigold or pigeon pea around fields',
          'Avoid excessive vegetative growth from high nitrogen',
          'Prompt destruction of crop stalks after harvest'
        ],
        mechanicalControl: [
          'Install pheromone traps (Helilure) @ 5/acre',
          'Manual clipping and destruction of infested bolls early on'
        ],
        biologicalControl: [
          'Trichogramma chilonis egg releases (3-4 times at weekly intervals)',
          'HaNPV @ 250 LE/acre + 0.1% jaggery/molasses',
          'Neem formulations (Azadirachtin 10000 ppm @ 1ml/L)'
        ],
        chemicalControl: [
          'Flubendiamide 39.35% SC (0.2ml/L water)',
          'Indoxacarb 14.5% SC (1ml/L water)',
          'Chlorantraniliprole 18.5% SC (0.3ml/L water)',
          '⚠️ Alternate mode of action to safeguard natural parasitoids'
        ]
      },
      'Whitefly': {
        lifeCycle: 'Egg → nymph → pupa → adult. Life cycle completes in 15-25 days; high reproductive rate.',
        damageSymptoms: [
          'Foliage chlorosis, yellowing, and downward curling',
          'Heavy honeydew secretion with black sooty mold coating',
          'Vector for Cotton Leaf Curl Virus (CLCuV) and Yellow Mosaic Virus'
        ],
        culturalControl: [
          'Eliminate host weeds like Abutilon and Parthenium',
          'Ensure optimum spacing to avoid humid microclimates'
        ],
        mechanicalControl: [
          'Install yellow sticky traps (15-20 per acre) at crop height'
        ],
        biologicalControl: [
          'Conserve Encarsia and Eretmocerus parasitic wasps',
          'Spray Verticillium lecanii or Beauveria bassiana (5g/L)'
        ],
        chemicalControl: [
          'Diafenthiuron 50% WP (1g/L water)',
          'Pyriproxyfen 10% EC (1.5ml/L water)',
          'Spiromesifen 22.9% SC (1ml/L water)',
          '⚠️ Ensure thorough spray coverage on the underside of leaves'
        ]
      },
      'Brown Planthopper': {
        lifeCycle: 'Egg → nymph (5 stages) → adult. Thrives in flooded, densely planted fields.',
        damageSymptoms: [
          'Classic "hopper burn" patches of drying, brown rice plants',
          'Plant lodging and total collapse of affected circular patches',
          'Vector for Rice Ragged Stunt and Grassy Stunt viruses'
        ],
        culturalControl: [
          'Alternate wetting and drying (AWD) irrigation; avoid continuous flooding',
          'Provide alleyways (30cm spacing every 2 meters) for aeration',
          'Apply balanced potash and avoid excessive urea'
        ],
        mechanicalControl: [
          'Drain field water completely for 3–4 days to desiccate nymphs'
        ],
        biologicalControl: [
          'Conserve mirid bugs (Cyrtorhinus lividipennis) and wolf spiders',
          'Spray Metarhizium anisopliae biopesticide'
        ],
        chemicalControl: [
          'Pymetrozine 50% WG (0.6g/L water)',
          'Trifiumezoquin 10% SC (0.5ml/L water)',
          'Dinotefuran 20% SG (0.4g/L water)',
          '⚠️ Direct spray nozzles strictly to the base of the plant canopy'
        ]
      },
      'Cockroach': {
        lifeCycle: 'Incomplete metamorphosis (egg case/ootheca → nymph stages → adult). Nocturnal scavenger thriving in warm, damp, dark harborages.',
        damageSymptoms: [
          'Visual sighting of insects scurrying in dark or moist locations',
          'Fecal droppings resembling black pepper granules or dark smears',
          'Pungent, musty aggregation pheromone odor in enclosed areas',
          'Contamination of food storage, packaging, grains, and kitchen surfaces'
        ],
        culturalControl: [
          'Sanitation: Wipe counters, eliminate food debris, and store grains/produce in airtight containers',
          'Moisture Control: Fix plumbing leaks, repair dripping faucets, and eliminate standing water',
          'Food waste management: Dispose of organic refuse daily in sealed trash bins',
          'Inspect incoming cardboard boxes and storage crates before bringing them indoors'
        ],
        mechanicalControl: [
          'Exclusion: Seal wall voids, baseboards, pipe penetrations, and door sweeps with silicone caulk',
          'Deploy non-toxic insect sticky glue boards along walls, under sinks, and behind appliances',
          'Vacuum congregating harborages using a HEPA-filtered vacuum'
        ],
        biologicalControl: [
          'Apply food-grade Diatomaceous Earth (DE) in wall voids and dry crevices (destroys cuticle naturally)',
          'Utilize boric acid powder in thin, barely visible layers inside hidden crevices and voids',
          'Avoid broad-spectrum chemical sprays that scatter colonies deeper into wall cavities'
        ],
        chemicalControl: [
          'Targeted Gel Baits: Apply pea-sized dots of Fipronil 0.05%, Indoxacarb 0.6%, or Hydramethylnon gel',
          'Insect Growth Regulators (IGR): Pyriproxyfen or Hydroprene to arrest nymph molting and sterilize adults',
          '⚠️ Place baits strictly in hidden crevices out of reach of children and domestic animals'
        ]
      },
      'Ladybird': {
        lifeCycle: 'Complete metamorphosis (egg → alligator-like larva → pupa → adult). Both larvae and adults are voracious aphid predators.',
        damageSymptoms: [
          '✅ Zero crop damage — Beneficial predator organism!',
          'Active feeding on aphid colonies, mealybugs, scales, and mites',
          'Presence of beneficial yellow clustered eggs on leaf undersides'
        ],
        culturalControl: [
          'Plant flowering companion crops (marigold, dill, fennel, alyssum) to attract adult beetles',
          'Avoid broad-spectrum synthetic pyrethroids that destroy beneficial insect populations',
          'Maintain natural vegetative mulch for beetle overwintering habitat'
        ],
        mechanicalControl: [
          'Do not disturb clusters of ladybirds overwintering in mulch or field edges',
          'Transfer ladybird larvae to aphid-dense branches by hand or soft brush'
        ],
        biologicalControl: [
          'Conserve existing wild populations as primary biological defense against soft-bodied pests',
          'Supplemental release of Hippodamia convergens or Coccinella septempunctata in greenhouses'
        ],
        chemicalControl: [
          '🛑 NO CHEMICAL CONTROL RECOMMENDED: This is a beneficial insect, not a pest!',
          'If target pests (e.g. aphids) require intervention, use selective biopesticides like cold-pressed Neem oil (0.5%)',
          'Ensure spray applications occur during dawn or dusk when ladybirds are less active'
        ]
      }
    };

    // Find match by exact name or substring
    const foundKey = Object.keys(managementData).find(k => 
      name.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(name.toLowerCase())
    );

    if (foundKey) {
      return managementData[foundKey];
    }

    // Dynamic generation from MongoDB entity if available
    const customSymptoms = (entity.symptoms && entity.symptoms.length > 0)
      ? entity.symptoms
      : [
          'Leaf chlorosis and localized feeding punctures',
          'Reduced plant photosynthetic capacity and vigor',
          'Stunted growth or early foliage senescence',
          'Secondary fungal pathogens entering through feeding wounds'
        ];

    const customManagement = entity.management || '';

    return {
      lifeCycle: 'Seasonal life cycle dependent on host crop phenology and ambient temperature. Regular field monitoring advised.',
      damageSymptoms: customSymptoms,
      culturalControl: [
        'Practice seasonal crop rotation with non-host species',
        'Maintain clean field borders and sanitize pruning shears',
        'Avoid excess nitrogen application which promotes soft vegetative growth',
        'Monitor weekly during early vegetative and flowering stages'
      ],
      mechanicalControl: [
        'Prune and destroy heavily infested plant parts',
        'Use appropriate colored sticky traps (yellow for flies/aphids, blue for thrips)',
        'Erect insect-proof exclusion netting on nursery beds'
      ],
      biologicalControl: [
        'Conserve generalist predators like ladybird beetles and spiders',
        'Apply cold-pressed Neem oil (5ml/L water) with emulsifier every 7–10 days',
        'Incorporate entomopathogenic bio-agents (Trichoderma, Beauveria)'
      ],
      chemicalControl: [
        customManagement ? customManagement : 'Apply approved selective insecticides when economic threshold level (ETL) is reached',
        'Consult local agricultural extension service for registered formulations',
        'Observe recommended pre-harvest intervals (PHI)',
        '⚠️ Always follow label safety precautions and wear protective gear'
      ]
    };
  };

  const managementInfo = getDetailedManagement(pestName, actualPest);

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm mb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl shadow-xs">
            🛡️
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Pest Management Advisory
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              Integrated pest management (IPM) guidelines & recommendations
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-sm font-bold w-fit shadow-2xs">
          <span>🎯</span>
          <span>{roundedConfidence}% Match</span>
        </span>
      </div>

      {/* Pest Information & Symptoms Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Pest Info Card */}
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200/80">
            <span className="text-base">📋</span>
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Pest Profile
            </h4>
          </div>

          <div className="space-y-3.5 text-xs sm:text-sm">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-0.5">Pest Name:</span>
              <p className="text-base font-bold text-slate-900">{pestName}</p>
            </div>

            {scientificName && (
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-0.5">Scientific Name:</span>
                <p className="font-serif italic text-emerald-700">{scientificName}</p>
              </div>
            )}

            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-0.5">Life Cycle:</span>
              <p className="text-slate-700 leading-relaxed">{managementInfo.lifeCycle}</p>
            </div>

            {affectedCrops.length > 0 && (
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Vulnerable Crops:</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {affectedCrops.map((crop, idx) => (
                    <span key={crop._id || idx} className="bg-emerald-100/70 text-emerald-800 px-2.5 py-0.5 rounded-md text-xs font-semibold">
                      {crop.name || crop}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Damage Symptoms Card */}
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200/80">
            <span className="text-base">⚠️</span>
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Observable Symptoms
            </h4>
          </div>

          <ul className="space-y-2.5 text-xs sm:text-sm">
            {managementInfo.damageSymptoms.map((symptom, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-slate-700 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0"></span>
                <span>{symptom}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Control Measures Section */}
      <div className="bg-slate-50/70 rounded-2xl p-5 sm:p-6 border border-slate-200/80">
        <div className="flex items-center gap-2 mb-5 pb-3 border-b border-slate-200">
          <span className="text-base">🧪</span>
          <h4 className="text-base font-bold text-slate-900">
            Targeted Control Measures
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Cultural Control */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs">
            <h5 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <span>🌾</span>
              <span>Cultural & Agronomic</span>
            </h5>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
              {managementInfo.culturalControl.map((method, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>{method}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Mechanical Control */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs">
            <h5 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <span>🔧</span>
              <span>Mechanical & Physical</span>
            </h5>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
              {managementInfo.mechanicalControl.map((method, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>{method}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Biological Control */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs">
            <h5 className="text-xs font-bold text-purple-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <span>🦋</span>
              <span>Biological & Organic</span>
            </h5>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
              {managementInfo.biologicalControl.map((method, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">✓</span>
                  <span>{method}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Chemical Control */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs">
            <h5 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <span>⚗️</span>
              <span>Chemical Control</span>
            </h5>
            <ul className="space-y-2 text-xs sm:text-sm">
              {managementInfo.chemicalControl.map((method, idx) => {
                const isWarning = method.includes('⚠️');
                const cleanMethod = method.replace(/⚠️/g, '').trim();
                return (
                  <li key={idx} className="flex items-start gap-2">
                    <span className={`shrink-0 ${isWarning ? 'text-amber-600' : 'text-orange-500 font-bold'}`}>
                      {isWarning ? '⚠️' : '✓'}
                    </span>
                    <span className={isWarning ? 'text-amber-900 font-semibold' : 'text-slate-700'}>
                      {cleanMethod}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Safety Warning */}
        <div className="mt-5 bg-amber-50/90 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
          <span className="text-base shrink-0">🛡️</span>
          <p>
            <strong>Safety Notice:</strong> Always read and observe official pesticide labels, personal protective equipment (PPE) recommendations, and required pre-harvest intervals (PHI) before handling any chemical solutions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PestManagementAdvisory;