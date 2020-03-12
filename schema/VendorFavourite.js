var mongoose = require('mongoose');

var vendorFavouriteSchema = new mongoose.Schema({
    vendorId: { type: mongoose.Schema.Types.ObjectId, required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, required: true },
}, {
    timestamps: true
});


module.exports = mongoose.model('vendorFavourite', vendorFavouriteSchema);