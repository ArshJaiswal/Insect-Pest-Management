const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Crop = require('./models/Crop');
const Pest = require('./models/Pest');

dotenv.config();

const crops = [
  {
    name: 'Rice',
    category: 'Cereal',
    description: 'Rice is a staple food crop grown in flooded fields and is the primary food source for over half the world\'s population. It requires warm temperatures (20-35°C) and abundant water supply. Rice cultivation involves transplanting seedlings in puddled fields with standing water. The crop is highly susceptible to various pests including stem borers, planthoppers, and leaf folders that can significantly reduce yield. Proper water management, balanced fertilization, and integrated pest management are crucial for successful rice production. Harvest typically occurs 3-6 months after planting depending on the variety.',
    image: 'http://localhost:5000/uploads/crop-images/Rice.jpg'
  },
  {
    name: 'Wheat',
    category: 'Cereal',
    description: 'Wheat is one of the world\'s most important cereal crops, primarily used for making flour, bread, and pasta. It thrives in temperate climates with moderate rainfall (300-1000mm annually) and temperatures between 12-25°C. Wheat is typically sown in autumn (winter wheat) or spring (spring wheat) and requires well-drained, fertile soils with pH 6.0-7.5. The crop faces challenges from various pests including aphids, armyworms, and Hessian flies at different growth stages. Proper crop rotation, timely sowing, and balanced nutrition help maintain healthy wheat crops. Harvest occurs when grain moisture content reaches 12-14%.',
    image: 'http://localhost:5000/uploads/crop-images/Wheat.jpg'
  },
  {
    name: 'Maize (Corn)',
    category: 'Cereal',
    description: 'Maize is a versatile cereal crop used for human food, animal feed, and industrial applications including biofuel production. It requires warm growing conditions (18-35°C) with adequate moisture during critical growth periods. Maize is typically planted in rows with proper spacing to ensure optimal light penetration and air circulation. The crop is vulnerable to numerous pest challenges including corn borers, armyworms, cutworms, and aphids that can cause significant yield losses. Modern maize production often involves hybrid varieties, precision planting, and integrated pest management strategies. The crop has a growing period of 90-120 days depending on variety and environmental conditions.',
    image: 'http://localhost:5000/uploads/crop-images/Maize.jpg'
  },
  {
    name: 'Cotton',
    category: 'Fiber',
    description: 'Cotton is the world\'s most important natural fiber crop, providing raw material for textile industry. It requires a long, warm growing season (180-220 frost-free days) with temperatures between 18-35°C and moderate rainfall (500-1200mm). Cotton plants are highly susceptible to bollworm complex, whiteflies, aphids, and thrips that can severely impact both fiber quality and yield. The crop benefits from well-drained, fertile soils with good organic matter content. Modern cotton production often utilizes Bt varieties for bollworm resistance and requires careful water management. Harvesting can be done manually or mechanically when bolls are fully mature and fiber moisture is optimal.',
    image: 'http://localhost:5000/uploads/crop-images/Cotton.jpg'
  },
  {
    name: 'Tomato',
    category: 'Vegetable',
    description: 'Tomatoes are widely cultivated warm-season vegetables rich in vitamins, minerals, and antioxidants like lycopene. They require temperatures between 18-29°C and are sensitive to frost. Tomatoes can be grown in open fields, greenhouses, or hydroponic systems depending on climate and market demands. The crop is highly susceptible to various insect pests including whiteflies, aphids, thrips, and fruit flies, as well as diseases like blight and mosaic viruses. Proper staking, pruning, and regular monitoring are essential for healthy tomato production. The crop requires consistent moisture but good drainage to prevent root diseases. Harvest timing is crucial for optimal flavor and shelf life.',
    image: 'http://localhost:5000/uploads/crop-images/Tomato.jpg'
  },
  {
    name: 'Potato',
    category: 'Vegetable',
    description: 'Potato is one of the world\'s most important food crops, serving as a staple food and source of carbohydrates for millions of people. It thrives in cool, moist climates with temperatures between 15-20°C and requires well-drained, loose soils with pH 5.0-6.5. Potatoes are grown from seed tubers and require hilling to prevent greening and improve tuber development. The crop faces significant challenges from Colorado potato beetle, aphids, cutworms, and various diseases affecting both foliage and tubers. Proper crop rotation, certified seed selection, and integrated pest management are crucial for successful potato production. Storage conditions must be carefully controlled to maintain quality and prevent sprouting.',
    image: 'http://localhost:5000/uploads/crop-images/Potato.jpg'
  },
  {
    name: 'Cabbage',
    category: 'Vegetable',
    description: 'Cabbage is a cool-season leafy vegetable crop belonging to the Brassica family, rich in vitamins C and K. It prefers temperatures between 15-20°C and can tolerate light frosts. Cabbage requires fertile, well-drained soils with consistent moisture and benefits from regular fertilization throughout the growing season. The crop is highly susceptible to caterpillar pests including cabbage worms, loopers, and aphid infestations that can cause significant damage to developing heads. Proper spacing, crop rotation with non-brassica crops, and timely pest monitoring are essential for quality cabbage production. Harvest occurs when heads are firm and compact, typically 70-120 days after transplanting.',
    image: 'http://localhost:5000/uploads/crop-images/Cabbage.jpg'
  },
  {
    name: 'Sugarcane',
    category: 'Cash Crop',
    description: 'Sugarcane is a major cash crop primarily grown for sugar production, biofuel, and various by-products. It requires tropical or subtropical climates with temperatures between 20-35°C and annual rainfall of 1000-1500mm. Sugarcane is a perennial crop that can be harvested multiple times (ratoons) from the same planting. The crop is affected by various pests including borers, scale insects, aphids, and whiteflies that can reduce both cane yield and sugar content. Proper field preparation, variety selection, and integrated pest management are crucial for profitable sugarcane production. The crop has a long growing cycle of 12-18 months and requires adequate irrigation during dry periods.',
    image: 'http://localhost:5000/uploads/crop-images/Sugarcane.jpg'
  },
  {
    name: 'Soybean',
    category: 'Legume',
    description: 'Soybean is an important protein-rich legume crop used for oil extraction, animal feed, and human consumption. It has the unique ability to fix atmospheric nitrogen through symbiotic relationship with Rhizobium bacteria, reducing fertilizer requirements. Soybeans prefer warm growing conditions (20-30°C) with adequate moisture during pod filling stages. The crop faces challenges from various defoliating insects including armyworms, aphids, whiteflies, and thrips that can significantly impact yield. Proper inoculation with appropriate Rhizobium strains, timely planting, and integrated pest management are essential for successful soybean production. The crop typically matures in 90-150 days depending on variety and growing conditions.',
    image: 'http://localhost:5000/uploads/crop-images/soyabean.jpg'
  },
  {
    name: 'Apple',
    category: 'Fruit',
    description: 'Apple is one of the most widely grown temperate fruit crops, requiring specific climatic conditions including cold winters (chill hours) and moderate summers. Apple trees are perennial and can be productive for many decades with proper care. The crop requires well-drained soils with pH 6.0-7.0 and benefits from regular pruning, thinning, and integrated orchard management. Apple orchards face numerous pest challenges including codling moth, aphids, mites, and scale insects that require careful monitoring and management to produce quality fruit. Modern apple production often involves dwarf rootstocks, high-density planting, and precision agriculture techniques. Harvest timing is critical for optimal fruit quality, storage life, and market value.',
    image: 'http://localhost:5000/uploads/crop-images/Apple.jpg'
  }
];

const pests = [
  {
    name: 'Brown Planthopper',
    scientificName: 'Nilaparvata lugens',
    description: 'A major pest of rice that sucks sap from plants causing hopper burn.',
    symptoms: ['Yellowing of leaves', 'Stunted growth', 'Hopper burn appearance', 'Plant wilting'],
    management: 'Use resistant varieties, maintain proper water management, apply neem-based pesticides, and encourage natural predators like spiders.',
    images: ['http://localhost:5000/uploads/pest-images/brown-planthopper.jpg']
  },
  {
    name: 'Rice Stem Borer',
    scientificName: 'Scirpophaga incertulas',
    description: 'Larvae bore into rice stems causing dead hearts and white heads.',
    symptoms: ['Dead hearts in vegetative stage', 'White heads in reproductive stage', 'Holes in stems', 'Frass near entry holes'],
    management: 'Remove and destroy stubbles, use pheromone traps, apply biological control agents like Trichogramma, and use recommended insecticides.',
    images: ['http://localhost:5000/uploads/pest-images/rice-stem-borer.jpg']
  },
  {
    name: 'Aphids',
    scientificName: 'Aphis spp.',
    description: 'Small sap-sucking insects that attack various crops and transmit viral diseases.',
    symptoms: ['Curling of leaves', 'Sticky honeydew on leaves', 'Sooty mold growth', 'Stunted plant growth', 'Yellowing'],
    management: 'Spray neem oil, use yellow sticky traps, encourage ladybird beetles, apply insecticidal soap, and maintain field hygiene.',
    images: ['http://localhost:5000/uploads/pest-images/Aphids.jpg']
  },
  {
    name: 'Armyworm',
    scientificName: 'Spodoptera spp.',
    description: 'Caterpillars that feed on leaves and can cause severe defoliation in cereals.',
    symptoms: ['Irregular holes in leaves', 'Defoliation', 'Presence of green droppings', 'Damage to growing points'],
    management: 'Hand-pick larvae, use pheromone traps, apply Bacillus thuringiensis (Bt), encourage natural enemies, and use recommended insecticides.',
    images: ['http://localhost:5000/uploads/pest-images/Armyworm.jpg']
  },
  {
    name: 'Cotton Bollworm',
    scientificName: 'Helicoverpa armigera',
    description: 'A polyphagous pest that damages cotton bolls, tomato fruits, and other crops.',
    symptoms: ['Holes in bolls and fruits', 'Damaged flowers', 'Frass on plant parts', 'Reduced yield'],
    management: 'Use Bt cotton varieties, install pheromone traps, apply NPV (Nuclear Polyhedrosis Virus), practice crop rotation, and use IPM strategies.',
    images: ['http://localhost:5000/uploads/pest-images/Cotton-Bollworm.jpg']
  },
  {
    name: 'Whitefly',
    scientificName: 'Bemisia tabaci',
    description: 'Tiny white insects that suck sap and transmit viral diseases in vegetables.',
    symptoms: ['Yellowing of leaves', 'Honeydew secretion', 'Sooty mold', 'Leaf curling', 'Viral disease symptoms'],
    management: 'Use yellow sticky traps, spray neem oil, maintain weed-free fields, use reflective mulches, and apply systemic insecticides if needed.',
    images: ['http://localhost:5000/uploads/pest-images/Whitefly.jpg']
  },
  {
    name: 'Fruit Fly',
    scientificName: 'Bactrocera spp.',
    description: 'Flies that lay eggs in fruits causing maggot infestation and fruit rot.',
    symptoms: ['Puncture marks on fruits', 'Fruit rotting', 'Maggots inside fruits', 'Premature fruit drop'],
    management: 'Use fruit fly traps with attractants, practice field sanitation, bag fruits, destroy infested fruits, and use protein bait sprays.',
    images: ['http://localhost:5000/uploads/pest-images/Fruit-Fly.jpg']
  },
  {
    name: 'Leaf Miner',
    scientificName: 'Liriomyza spp.',
    description: 'Larvae create serpentine mines in leaves reducing photosynthesis.',
    symptoms: ['Serpentine tunnels in leaves', 'White or brown trails', 'Reduced plant vigor', 'Leaf drop'],
    management: 'Remove and destroy affected leaves, use yellow sticky traps, apply neem-based products, and encourage parasitoid wasps.',
    images: ['http://localhost:5000/uploads/pest-images/Leaf-Miner.jpg']
  },
  {
    name: 'Thrips',
    scientificName: 'Thrips spp.',
    description: 'Tiny insects that rasp plant tissues and suck sap, also transmit viruses.',
    symptoms: ['Silvering of leaves', 'Distorted growth', 'Scarring on fruits', 'Flower damage', 'Viral disease transmission'],
    management: 'Use blue sticky traps, spray neem oil, maintain field hygiene, apply spinosad-based insecticides, and use resistant varieties.',
    images: ['http://localhost:5000/uploads/pest-images/Thrips.jpg']
  },
  {
    name: 'Colorado Potato Beetle',
    scientificName: 'Leptinotarsa decemlineata',
    description: 'A major pest of potato that defoliates plants rapidly.',
    symptoms: ['Defoliation', 'Skeletonized leaves', 'Presence of yellow-orange beetles', 'Reduced tuber yield'],
    management: 'Hand-pick beetles and larvae, use crop rotation, apply Bt-based products, mulch heavily, and use resistant varieties.',
    images: ['http://localhost:5000/uploads/pest-images/Colorado Potato Beetle.jpg']
  },
  {
    name: 'Cutworm',
    scientificName: 'Agrotis spp.',
    description: 'Caterpillars that cut young seedlings at soil level during night.',
    symptoms: ['Cut seedlings at base', 'Wilted plants', 'Missing plants in rows', 'Damage visible in morning'],
    management: 'Use collars around seedlings, practice deep plowing, apply baits, hand-pick at night, and use biological control.',
    images: ['http://localhost:5000/uploads/pest-images/Cutworm.jpg']
  },
  {
    name: 'Mealybug',
    scientificName: 'Planococcus spp.',
    description: 'Soft-bodied insects covered with white waxy coating that suck plant sap.',
    symptoms: ['White cottony masses on plants', 'Honeydew secretion', 'Sooty mold', 'Stunted growth', 'Leaf yellowing'],
    management: 'Spray neem oil, use biological control agents like Cryptolaemus beetles, prune infested parts, and apply systemic insecticides.',
    images: ['http://localhost:5000/uploads/pest-images/Mealybug.jpg']
  }
];

const cropPestMapping = {
  'Rice': ['Brown Planthopper', 'Rice Stem Borer', 'Armyworm', 'Leaf Miner'],
  'Wheat': ['Aphids', 'Armyworm', 'Thrips'],
  'Maize (Corn)': ['Armyworm', 'Aphids', 'Cutworm', 'Leaf Miner'],
  'Cotton': ['Cotton Bollworm', 'Whitefly', 'Aphids', 'Thrips', 'Mealybug'],
  'Tomato': ['Whitefly', 'Fruit Fly', 'Aphids', 'Leaf Miner', 'Cotton Bollworm', 'Thrips'],
  'Potato': ['Colorado Potato Beetle', 'Aphids', 'Cutworm', 'Leaf Miner'],
  'Cabbage': ['Aphids', 'Cutworm', 'Thrips', 'Armyworm'],
  'Sugarcane': ['Aphids', 'Whitefly', 'Mealybug'],
  'Soybean': ['Armyworm', 'Aphids', 'Whitefly', 'Thrips'],
  'Apple': ['Fruit Fly', 'Aphids', 'Mealybug', 'Leaf Miner']
};

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    // Clear existing data
    await Crop.deleteMany({});
    await Pest.deleteMany({});
    console.log('Cleared existing data');

    // Insert pests first
    const insertedPests = await Pest.insertMany(pests);
    console.log(`Inserted ${insertedPests.length} pests`);

    // Create a map of pest names to IDs
    const pestMap = {};
    insertedPests.forEach(pest => {
      pestMap[pest.name] = pest._id;
    });

    // Insert crops with pest references
    const cropsWithPests = crops.map(crop => {
      const pestNames = cropPestMapping[crop.name] || [];
      const pestIds = pestNames.map(name => pestMap[name]).filter(id => id);
      return { ...crop, commonPests: pestIds };
    });

    const insertedCrops = await Crop.insertMany(cropsWithPests);
    console.log(`Inserted ${insertedCrops.length} crops`);

    // Update pests with crop references
    for (const crop of insertedCrops) {
      const pestIds = crop.commonPests;
      await Pest.updateMany(
        { _id: { $in: pestIds } },
        { $addToSet: { affectedCrops: crop._id } }
      );
    }
    console.log('Updated pest-crop relationships');

    console.log('\n✅ Database seeded successfully!');
    console.log(`Total Crops: ${insertedCrops.length}`);
    console.log(`Total Pests: ${insertedPests.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
