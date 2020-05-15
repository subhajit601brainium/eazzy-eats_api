var PUSH_CONFIG = {};


//Ios [APN]
PUSH_CONFIG.IOS_PRODUCTION_MODE  = false;
PUSH_CONFIG.IOS_AUTHKEY_FILE = "AuthKey_7JWX427H88.p8"; // When we download the key from the Apple Developer Keys page, it will have a name like AuthKey_A1BC23DE45.p8
PUSH_CONFIG.IOS_AUTHKEY_FILEPATH = "F:/Brainium/eazzy-eats/service/libraries/pushlib/Ios/resource/AuthKey_7JWX427H88.p8"; //PATH from APN
PUSH_CONFIG.IOS_KEY_ID = "7JWX427H88"; //The A1BC23DE45 is the keyId that you need here
PUSH_CONFIG.IOS_TEAM_ID = "2H5JW86X3B"; //IDENTIFIER [developer-team-id]
PUSH_CONFIG.IOS_VENDOR_TOPIC = "com.brainium.EazzyEats.Admin"; //Your Application bundle ID
PUSH_CONFIG.IOS_CUSTOMER_TOPIC = "com.brainium.EazzyEats.Customer"; //Your Application bundle ID

//Android [FCM]
PUSH_CONFIG.SERVER_API_KEY = 'AAAAzv_wjpA:APA91bFCW-U7su5z4KvE3x-DYqtW_PL8mEOStKIo3ui3lyIF6XMOHowEFihEZGKhq_eedXh3os28RZWo6XOyZ1ksEgkvaVRUkaGeMahYaUlLlJ9TOUhpR16lU2x7-htFY7M7wzpFcePD';


module.exports = PUSH_CONFIG