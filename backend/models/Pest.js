const mongoose = require('mongoose');

const pestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  scientificName: { type: String },
  description: { type: String },
  symptoms: [String],
  management: { type: String },
  images: [String],
  affectedCrops: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Crop' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Pest', pestSchema);
