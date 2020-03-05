var mongoose = require('mongoose');

var bannerSchema = new mongoose.Schema({
    vendorId: { type: mongoose.Schema.Types.ObjectId, required: true },
    bannerType: { type: String, enum: ['HAPPY HOURS', 'OFFER']},
    image: { type: String, required: true }
}, {
    timestamps: true
});

module.exports = mongoose.model('Banner', bannerSchema);