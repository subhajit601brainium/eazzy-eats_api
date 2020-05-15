var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

var vendorOwnerSchema = new mongoose.Schema({
    vendorId: { type: mongoose.Schema.Types.ObjectId, required: true },
    fullName: { type: String, default: '' },
    email: { type: String, unique: true},
    phone: { type: Number, unique: true},
    countryCode: { type: String, default: '' },
    password: { type: String, default: '' },
    cityId: { type: mongoose.Schema.Types.ObjectId},
    location: { type: String, default: '' },
    profileImage: { type: String, default: '' },
    promoCode: { type: String, default: '' },
    allowMail: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    otp: { type: String, default: '' },
    verifyOtp: { type: String, enum: ['0', '1'], default: '0'},
    appType: { type: String, enum: ['IOS', 'ANDROID', 'BROWSER']},
    deviceToken: { type: String, default: '' }
}, {
    timestamps: true
});

vendorOwnerSchema.pre('save', function(next) {
    let customer = this;
    if (!customer.isModified('password')) {
        return next();
    }

    bcrypt.hash(customer.password, 8, function(err, hash) {
        if (err) {
            return next(err);
        } else {
            if (customer.password !== '') {
                customer.password = hash
            }
            next();
        }
    })
});

module.exports = mongoose.model('VendorOwner', vendorOwnerSchema);