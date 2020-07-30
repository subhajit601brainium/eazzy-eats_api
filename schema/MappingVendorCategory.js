var mongoose = require('mongoose');

var mappingVendorCategorySchema = new mongoose.Schema({
    vendorId: { type: mongoose.Schema.Types.ObjectId, required: true },
    vendorCategoryId: { type: mongoose.Schema.Types.ObjectId, required: true },
}, {
    timestamps: true
});

module.exports = mongoose.model('MappingVendorCategory', mappingVendorCategorySchema);