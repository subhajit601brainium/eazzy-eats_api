var mongoose = require('mongoose');

var customerAddressSchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, required: true},
    fullAddress: { type: String },
    houseNo: { type: String },
    landMark: { type: String},
    phone: { type: Number},
    countryCode: { type: String },
    addressType: { type: String },
    latitude: { type: String },
    longitude: { type: String }
}, {
    timestamps: true
});


module.exports = mongoose.model('CustomerAddress', customerAddressSchema);