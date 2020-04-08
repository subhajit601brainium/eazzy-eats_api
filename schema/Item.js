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
    waitingTime: { type: Number, required: true },
    menuImage: { type: String, allow: ''},
    isActive: { type: Boolean, default: false },
}, {
    timestamps: true
});


// Getter
itemSchema.path('price').get(function(num) {
   var originalNum =  num.toFixed(2);

   return parseFloat(originalNum);
  });
  
  // Setter
  itemSchema.path('price').set(function(num) {
    return num;
  });

module.exports = mongoose.model('Item', itemSchema);