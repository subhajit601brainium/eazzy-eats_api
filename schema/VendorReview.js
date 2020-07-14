var mongoose = require('mongoose');

var vendorReviewSchema = new mongoose.Schema({
    vendorId: { type: mongoose.Schema.Types.ObjectId, required: true },
    customerId: { type: String },
    customerName: { type: String },
    comment: { type: Object },
    customerRating: { type: String },
}, {
    timestamps: true
});


module.exports = mongoose.model('vendorReview', vendorReviewSchema);