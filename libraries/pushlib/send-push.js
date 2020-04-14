var PUSH_CONFIG = require('../pushlib/config');
var iosPush = require('../pushlib/Ios/apple-push-api');
var andPush = require('../pushlib/And/android-push-api');



module.exports = {
    sendPushIOS: async function (receiveData) {
        var productionMode = (receiveData.pushMode == 'P') ? true : false;
        if(PUSH_CONFIG.IOS_PRODUCTION_MODE != productionMode) { 
            return false;
        }
        
        var pushData = {
            'badge': receiveData.badge,
            'alert': receiveData.alert,
            'deviceToken': receiveData.deviceToken,
            'sound': 'ping.aiff',
            'dataset': receiveData.dataset,
            'pushTo': receiveData.pushTo,
            'expiry': Math.floor(Date.now() / 1000) + 3600 // Expires 1 hour from now.
        };

        return await iosPush.sendPushDirect(pushData);
        
    },
    sendPushAndroid: async function (receiveData) {
        
        var pushData = {
            'badge': receiveData.badge,
            'alert': receiveData.alert,
            'deviceToken': receiveData.deviceToken,
            'dataset': receiveData.dataset,
        };
        return await andPush.sendPushDirect(pushData);
        
    }
}