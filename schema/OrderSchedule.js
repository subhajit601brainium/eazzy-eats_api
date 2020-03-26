var mongoose = require('mongoose');

var orderDetailSchema = new mongoose.Schema({
    orderId: { type: mongoose.Schema.Types.ObjectId, required: true },
    scheduleTime: {type: Date, required: true }
}, {
    timestamps: true
});

module.exports = mongoose.model('OrderDetail', orderDetailSchema);