var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

var customerSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: Number, required: true },
    countryCode: { type: String, required: true },
    password: { type: String, required: true },
    cityId: { type: mongoose.Schema.Types.ObjectId },
    location: { type: String, default: '' },
    profileImage: { type: String, default: '' },
    promoCode: { type: String, default: '' },
    allowMail: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    otp: { type: String, default: '' },
    verifyOtp: { type: String, enum: ['0', '1'], default: '0'},
    appType: { type: String, enum: ['IOS', 'ANDROID', 'BROWSER']},
    deviceToken: { type: String, default: '' },
    loginType: { type: String, enum: ['NORMAL', 'FACEBOOK', 'GOOGLE']},
}, {
    timestamps: true
});

customerSchema.pre('save', function(next) {
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

module.exports = mongoose.model('Customer', customerSchema);