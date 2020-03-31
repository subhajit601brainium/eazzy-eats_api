var mongoose = require('mongoose');

var orderDetailSchema = new mongoose.Schema({
    orderId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Order',default: '5e7dad8425051217a04a52a2'  },
    offerId: { type: mongoose.Schema.Types.ObjectId,default: '5e7cb381f55c992464a3e6a1' },
    item: { type: String, required: true},
    quantity: { type: Number, required: true },
    itemPrice: {type: Number, required: true},
    totalPrice: {type: Number, required: true}
}, {
    timestamps: true
});

module.exports = mongoose.model('OrderDetail', orderDetailSchema);