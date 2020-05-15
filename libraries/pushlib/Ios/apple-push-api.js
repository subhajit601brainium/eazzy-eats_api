var apn = require('apn');
var PUSH_CONFIG = require('../config');

//var PUSH_CONFIGs = require('./resource/AuthKey_594X3ZB7LL.p8');



module.exports = {
    sendPushDirect: function (pushData) {
        return new Promise(function (resolve, reject) {
        var options = {
            token: {
                key: PUSH_CONFIG.IOS_AUTHKEY_FILEPATH,
                keyId: PUSH_CONFIG.IOS_KEY_ID,
                teamId: PUSH_CONFIG.IOS_TEAM_ID
            },
            production: PUSH_CONFIG.IOS_PRODUCTION_MODE
        };

        var apnProvider = new apn.Provider(options);

        var note = new apn.Notification();

        note.expiry = pushData.expiry;
        note.badge = pushData.badge;
        note.sound = pushData.sound;
        note.alert = pushData.alert;
        note.payload = pushData.dataset;

        if(pushData.pushTo == 'CUSTOMER') {
            note.topic = PUSH_CONFIG.IOS_CUSTOMER_TOPIC;
        } else if(pushData.pushTo == 'VENDOR') {
            note.topic = PUSH_CONFIG.IOS_VENDOR_TOPIC;
        }
        

        console.log('note',note);
        apnProvider.send(note, pushData.deviceToken).then((result) => {
            console.log('IOS_RESULT',result);
            if(result.sent.length > 0) {
                return resolve (true);
            } else if(result.failed.length > 0) {
                return reject (result);
            }
            // console.log(result.sent.length);
            // console.log(result.failed.length);
            //  console.log(result.failed[0].response);
            // see documentation for an explanation of result
        });
    });
    }
}