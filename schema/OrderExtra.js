var mongoose = require('mongoose');

var orderExtraSchema = new mongoose.Schema({
    itemName: { type: String, required: true },
    orderDetailsId: { type: mongoose.Schema.Types.ObjectId, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 },
    isActive: { type: Boolean, default: false },
}, {
    timestamps: true
});

module.exports = mongoose.model('OrderExtra', orderExtraSchema);