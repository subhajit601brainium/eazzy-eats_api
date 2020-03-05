var mongoose = require('mongoose');

var itemExtraSchema = new mongoose.Schema({
    itemName: { type: String, required: true },
    itemId: { type: mongoose.Schema.Types.ObjectId, required: true },
    description: { type: String, allow: '' },
    ingredients: { type: String, allow: '' },
    recipe: { type: String, allow: '' },
    price: { type: Number, required: true },
    isActive: { type: Boolean, default: false },
}, {
    timestamps: true
});

module.exports = mongoose.model('ItemExtra', itemExtraSchema);