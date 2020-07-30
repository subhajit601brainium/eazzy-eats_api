var vendorSchema = require('../../schema/Vendor');
var vendorFavouriteSchema = require('../../schema/VendorFavourite');
var categorySchema = require('../../schema/Category');
var bannerSchema = require('../../schema/Banner');
var itemSchema = require('../../schema/Item');
var userDeviceLoginSchemaSchema = require('../../schema/UserDeviceLogin');
var vendorOwnerSchema = require('../../schema/VendorOwner');
var vendorReviewSchema = require('../../schema/VendorReview');

var orderSchema = require('../../schema/Order');
var OrderDetailSchema = require('../../schema/OrderDetail');
var config = require('../../config');
var PushLib = require('../../libraries/pushlib/send-push');
var UserNotificationSchema = require('../../schema/UserNotification');
var customerAddressSchema = require('../../schema/CustomerAddress');
var ItemExtraSchema = require('../../schema/ItemExtra');
var jwt = require('jsonwebtoken');

module.exports = {

    //Payment initialize
    paymentInitialize: (data, callBack) => {
        if (data) {

            var amount = data.body.amount;
            var email = data.body.email;

            const https = require('https')

            var scrtKey = `Bearer ${config.payment.secret_key}`

            const params = JSON.stringify({
                "email": email,
                "amount": amount
              })
              const options = {
                hostname: 'api.paystack.co',
                port: 443,
                path: '/transaction/initialize',
                method: 'POST',
                headers: {
                  Authorization: scrtKey,
                  'Content-Type': 'application/json'
                }
              }
              const req = https.request(options, resp => {
                let data = ''

                resp.on('data', (chunk) => {
                  data += chunk
                });
                resp.on('end', () => {
                  console.log(JSON.parse(data))

                  callBack({
                    success: true,
                    STATUSCODE: 200,
                    message: 'Payment initialize.',
                    response_data: JSON.parse(data)
                });
                })
              }).on('error', error => {
                console.error(error);
                callBack({
                    success: false,
                    STATUSCODE: 500,
                    message: 'Something went wrong.',
                    response_data: {}
                });
              })
              req.write(params)
              req.end()
        }
    },

}