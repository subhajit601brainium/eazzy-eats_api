var mongoose = require('mongoose');

var itemSchema = new mongoose.Schema({
    itemName: { type: String, required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, required: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, required: true },
    type: { type: String, enum: ['VEG', 'NON VEG'] },
    description: { type: String, allow: '' },
    ingredients: { type: String, allow: '' },
    recipe: { type: String, allow: '' },
    price: { type: Number, required: true },
    waitingTime: { type: String, allow: ''},
    menuImage: { type: String, allow: ''},
    isActive: { type: Boolean, default: false },
}, {
    timestamps: true
});

module.exports = mongoose.model('Item', itemSchema);