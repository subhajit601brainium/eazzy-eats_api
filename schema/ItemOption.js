var mongoose = require('mongoose');

var itemOptionSchema = new mongoose.Schema({
    headerName: { type: String, required: true },
    itemId: { type: mongoose.Schema.Types.ObjectId, required: true },
    itemOptions: { type: Object, required: true },
    isActive: { type: Boolean, default: false },
}, {
    timestamps: true
});

module.exports = mongoose.model('ItemOption', itemOptionSchema);