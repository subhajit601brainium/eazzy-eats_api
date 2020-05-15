var mongoose = require('mongoose');

var promoCodeSchema = new mongoose.Schema({
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
    promoType: { type: String, enum: ['PERCENTAGE', 'FLAT'] },
    promoPrice: { type: Number, required: true },
    promoConditions: { type: String},
    promoCode: { type: String, required: true},
}, {
    timestamps: true
});

module.exports = mongoose.model('PromoCode', promoCodeSchema);