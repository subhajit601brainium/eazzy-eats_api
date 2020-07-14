var mongoose = require('mongoose');

var vendorSchema = new mongoose.Schema({
    restaurantName: { type: String, required: true },
    description: { type: String},
    managerName: { type: String},
    restaurantType: { type: String},
    contactEmail: { type: String, email: true, unique: true },
    countryCode: { type: String, required: true },
    contactPhone: { type: Number, unique: true },
    logo: { type: String },
    banner: { type: String},
    rating: { type: Number, default: 0 },
    preOrder: { type: String, enum: ['ON', 'OFF'], default: 'ON' },
    licenceImage: { type: String, default: ''},
    address: { type: String, default: ''},
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
    restaurantClose: { type: Boolean, default: true },
    vendorOpenCloseTime: [{ type: mongoose.Schema.Types.ObjectId, ref: 'vendorOpenCloseTime' }]
}, {
    timestamps: true
});

vendorSchema.index({ location: "2dsphere" });

module.exports = mongoose.model('Vendor', vendorSchema);