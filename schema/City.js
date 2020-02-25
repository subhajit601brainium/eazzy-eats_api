var mongoose = require('mongoose');

var CitySchema = new mongoose.Schema({
    stateId: { type: mongoose.Schema.Types.ObjectId, required: true },
    name: { type: String, default: '',  required: true},
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});

module.exports = mongoose.model('City', CitySchema);