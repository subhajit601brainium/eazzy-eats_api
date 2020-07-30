var mongoose = require('mongoose');

var vendorCategorySchema = new mongoose.Schema({
    categoryName: { type: String, required: true },
    image: { type: String},
    isActive: { type: Boolean, default: true },
}, {
    timestamps: true
});

module.exports = mongoose.model('VendorCategory', vendorCategorySchema);