var gcm = require('node-gcm');
var PUSH_CONFIG = require('../config');



module.exports = {
    sendPushDirect: function (pushData) {
        return new Promise(function (resolve, reject) {

            // Set up the sender with your GCM/FCM API key (declare this once for multiple messages)
            var sender = new gcm.Sender(PUSH_CONFIG.SERVER_API_KEY);

            // Prepare a message to be sent
            var message = new gcm.Message({
                data: {
                    sound: 'default',
                    alert: pushData.dataset,
                    message: pushData.alert
                }
            });

            // Specify which registration IDs to deliver the message to
            var regTokens = [pushData.deviceToken];

            console.log('message',message);
            // Actually send the message
            sender.send(message, { registrationTokens: regTokens }, function (err, response) {
                if (err) {
                    return reject (err);
                } 
                else {
                    console.log('ANDROID_RESPONSE',response);
                    if(response.success == 1) {
                        return resolve (true);
                    } else {
                        return reject (response);
                    }
                }
            });

        });
    }
}