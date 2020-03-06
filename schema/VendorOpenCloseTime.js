var mongoose = require('mongoose');

var vendorOpenCloseTimeSchema = new mongoose.Schema({
    //vendorId: { type: mongoose.Schema.Types.ObjectId, required: true },
    day: {type: String, required: true},
    openTime: {type: Number, required: true},
    closeTime: {type: Number, required: true},
    isActive: { type: Boolean, default: false },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
}, {
    timestamps: true
});

module.exports = mongoose.model('vendorOpenCloseTime', vendorOpenCloseTimeSchema);