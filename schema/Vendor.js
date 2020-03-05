var mongoose = require('mongoose');

var vendorSchema = new mongoose.Schema({
    restaurantName: { type: String, required: true },
    managerName: { type: String, required: true },
    restaurantType: { type: String, enum: ['VEG', 'NON VEG', 'BOTH'] },
    contactEmail: { type: String, email: true, unique: true },
    contactPhone: { type: Number, unique: true },
    logo: { type: String, required: true },
    licenceImage: { type: String, default: ''},
    location: {
        type: {
            type: String,
            enum: ['Point']
        },
        coordinates: {
            type: [Number]
        }
    },
    isActive: { type: Boolean, default: false },
}, {
    timestamps: true
});

module.exports = mongoose.model('Vendor', vendorSchema);