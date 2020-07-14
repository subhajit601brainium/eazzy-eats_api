var mongoose = require('mongoose');

var userNotificationSettingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true },
    userType: { type: String,required: true , enum: ['CUSTOMER', 'VENDOR', 'DELIVERY BOY','ADMIN','VENDOR ADMIN']},
    notificationData: { type: Object  }
}, {
    timestamps: true
});

module.exports = mongoose.model('UserNotificationSetting', userNotificationSettingSchema);