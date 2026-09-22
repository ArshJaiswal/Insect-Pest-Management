const mongoose = require('mongoose');

const cropSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String },
  image: { type: String },
  commonPests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Pest' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Crop', cropSchema);
