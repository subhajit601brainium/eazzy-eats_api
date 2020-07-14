var mongoose = require('mongoose');

var vendorTypeSchema = new mongoose.Schema({
    name: { type: String },
    isActive: { type: Boolean, default: true },
}, {
    timestamps: true
});


module.exports = mongoose.model('vendorType', vendorTypeSchema);