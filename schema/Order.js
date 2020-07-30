var mongoose = require('mongoose');

var orderSchema = new mongoose.Schema({
    vendorId: { type: mongoose.Schema.Types.ObjectId, required: true},
    orderNo: {type: String, required: true, unique: true},
    orderTime: {type: Date, required: true, default: new Date()},
    orderDetails: [{ type: mongoose.Schema.Types.ObjectId, ref: 'OrderDetail' }],
    estimatedDeliveryTime: {type: String },
    foodReadyTime: {type: Date},
    actualDeliveryTime: {type: Date},
    
   // deliveryPincode: { type: String, required: true},
    deliveryHouseNo: { type: String},
   // deliveryRoad: { type: String, required: true},
    deliveryCountryCode: { type: String},
    deliveryPhone: { type: String},
  //  deliveryState: { type: String , required: true},
  //  deliveryCity: { type: String, required: true },
    deliveryLandmark: { type: String},
    fullAddress: { type: String, default: ''},
    addressType: { type: String, default: ''},
  //  deliveryName: { type: String, required: true },

    customerId: { type: mongoose.Schema.Types.ObjectId, required: true,default: '5e68af6f7a611343eae69b9a' },
    orderType: { type: String, required: true, enum: ['NORMAL','SCHEDULE'],default: 'NORMAL' },
    deliveryPreference : { type: String, required: true, enum: ['DELIVERY','PICKUP'],default: 'DELIVERY' },
    orderStatus: { type: String, required: true, enum: ['NEW','ACCEPTED', 'DELAYED', 'COLLECTED', 'COMPLETED','MODIFIED','CANCELLED','READY'],default: 'NEW'  },
    orderStatusChangeTime: {type:Date, default: new Date()},
    orderCancelReason: { type: String},
    delayedTime: {type: Number},
    price: {type: Number, required: true,default: 60 },
    discount: {type: Number,default: 15},
    finalPrice: {type: Number, required: true,default: 45},
    specialInstruction: {type: String,default: ''},
    promocodeId: { type: String}
}, {
    timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);