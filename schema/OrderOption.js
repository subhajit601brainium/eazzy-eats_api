var mongoose = require('mongoose');

var orderOptionSchema = new mongoose.Schema({
    headerName: { type: String, required: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, required: true },
    itemOptions: { type: Object, required: true },
    isActive: { type: Boolean, default: false },
}, {
    timestamps: true
});

module.exports = mongoose.model('OrderOption', orderOptionSchema);