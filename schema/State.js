var mongoose = require('mongoose');

var StateSchema = new mongoose.Schema({
    name: { type: String, default: '',  required: true, unique: true},
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});

module.exports = mongoose.model('State', StateSchema);