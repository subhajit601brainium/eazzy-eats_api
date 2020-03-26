var mongoose = require('mongoose');

var orderSchema = new mongoose.Schema({
    vendorId: { type: mongoose.Schema.Types.ObjectId, required: true, default: '5e68af6f7a611343eae69b9a' },
    orderNo: {type: String, required: true, unique: true, default: 'O123'},
    orderTime: {type: Date, required: true, default: new Date()},
    orderDetails: [{ type: mongoose.Schema.Types.ObjectId, ref: 'OrderDetail' }],
    estimatedDeliveryTime: {type: Date, required: true, default: new Date()},
    foodReadyTime: {type: Date, required: true, default: new Date()},
    actualDeliveryTime: {type: Date, required: true, default: new Date()},
    deliveryAddress: { type: String, required: true, default: 'Kolkata' },
    deliveryCountry: { type: String, required: true,default: 'India' },
    deliveryCityId: { type: mongoose.Schema.Types.ObjectId, required: true,default: '5e68af6f7a611343eae69b9a' },
    customerId: { type: mongoose.Schema.Types.ObjectId, required: true,default: '5e68af6f7a611343eae69b9a' },
    orderType: { type: String, required: true, enum: ['NORMAL','SCHEDULE'],default: 'NORMAL' },
    orderResult: { type: String, required: true, enum: ['PENDING','ACCEPTED','MODIFIED','CANCELLED'],default: 'PENDING' },
    orderStatus: { type: String, required: true, enum: ['PENDING','RECEIVED', 'PREPARATION', 'DELIVERY', 'COMPLETED', 'CANCEL'],default: 'PENDING'  },
    price: {type: Number, required: true,default: 10 },
    discount: {type: Number,default: 2},
    finalPrice: {type: Number, required: true,default: 8},
    specialInstruction: {type: String,default: ''},
    promocodeId: { type: mongoose.Schema.Types.ObjectId, default: '5e68af6f7a611343eae69b9a' }
}, {
    timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);