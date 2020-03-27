var mongoose = require('mongoose');

var orderDetailSchema = new mongoose.Schema({
    orderId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Order',default: '5e7dad8425051217a04a52a2'  },
    offerId: { type: mongoose.Schema.Types.ObjectId, required: true,default: '5e7cb381f55c992464a3e6a1' },
    item: { type: String, required: true,default: 'Chickn Biriyani' },
    quantity: { type: Number, required: true,default: 1 },
    itemPrice: {type: Number, required: true,default: 70},
    totalPrice: {type: Number, required: true,default: 70}
}, {
    timestamps: true
});

module.exports = mongoose.model('OrderDetail', orderDetailSchema);