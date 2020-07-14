
var orderSchema = require('../../schema/Order');
var vendorSchema = require('../../schema/Vendor');
var userDeviceLoginSchemaSchema = require('../../schema/UserDeviceLogin');

exports.autoDelayOrder = function () {
  var CronJob = require('cron').CronJob; // innitialize cron job 
  new CronJob('* * * * *', function () { //CRON WILL HIT EVERY MINUTE

  orderSchema
    .find({ orderStatus: 'DELAYED' })
    .then(async (orders) => {

      if (orders.length > 0) {
        for (let order of orders) {
          var currentDelayedTime = Number(order.delayedTime);
          

          var date1 = order.orderStatusChangeTime;
          var date2 = new Date();

          // To calculate the time difference of two dates 
          var Difference_In_Time = Number(date2.getTime()) - Number(date1.getTime());

          var differenceTimeMinutes = Number(Difference_In_Time / 60000);

          if (differenceTimeMinutes >= currentDelayedTime) {
            var delayedTime = Number(Number(order.delayedTime) + 20);
            var vendorId = order.vendorId;

            //SEND PUSH MESSAGE
            var pushMessage = `Your order has been delayed by ${delayedTime}`

            var receiverId = order.customerId;
            var orderNo = order.orderNo;
            var orderStatus = 'DELAYED';

            //Fetch Vendor name
            var vendorInfo = await vendorSchema.findOne({ _id: vendorId });
            var vendorName = vendorInfo.restaurantName;
            // sendPush(receiverId, pushMessage, orderNo, orderStatus, vendorName);

            updateStatus({ delayedTime: delayedTime, orderStatusChangeTime: new Date() }, { _id: order._id });
          console.log('Updated');
          }




        }
      }



    });
  }, null, true, 'UTC');


}

function sendPush(receiverId, pushMessage, orderNo, orderStatus, vendorName) {
  console.log('----PUSH START-----')
  var pushMessage = pushMessage;
  userDeviceLoginSchemaSchema
    .find({ userId: receiverId, userType: 'CUSTOMER' })
    .then(function (customers) {
      // console.log('customers',customers);
      if (customers.length > 0) {
        for (let customer of customers) {

          var msgStr = ",";
          msgStr += "~order_no~:~" + orderNo + "~";
          msgStr += "~order_status~:~" + orderStatus + "~";
          msgStr += "~restaurant_name~:~" + vendorName + "~";
          var dataset = "{~message~:~" + pushMessage + "~" + msgStr + "}";

          var deviceToken = customer.deviceToken;

          //  console.log('dataset',dataset);

          if (customer.appType == 'ANDROID') {

            //ANDROID PUSH START
            var andPushData = {
              'badge': 0,
              'alert': pushMessage,
              'deviceToken': deviceToken,
              'pushMode': customer.pushMode,
              // 'dataset': dataset
              'dataset': {
                "order_no": orderNo,
                "restaurant_name": vendorName,
                "order_status": orderStatus

              }
            }

            PushLib.sendPushAndroid(andPushData)
              .then(async function (success) { //PUSH SUCCESS

                console.log('push_success', success);
              }).catch(async function (err) { //PUSH FAILED

                console.log('push_err', err);
              });
            //ANDROID PUSH END

          } else if (customer.appType == 'IOS') {

            //IOS PUSH START
            var iosPushData = {
              'badge': 0,
              'alert': pushMessage,
              'deviceToken': deviceToken,
              'pushMode': customer.pushMode,
              'pushTo': 'CUSTOMER',
              'dataset': {
                "order_no": orderNo,
                "restaurant_name": vendorName,
                "order_status": orderStatus

              }
            }
            //SEND PUSH TO IOS [APN]

            PushLib.sendPushIOS(iosPushData)
              .then(async function (success) { //PUSH SUCCESS
                console.log('push_success', success);

              }).catch(async function (err) { //PUSH FAILED
                console.log('push_err', err);
              });
            //IOS PUSH END
          }
        }
      }
    })
}

function updateStatus(update, cond) {
  return new Promise(function (resolve, reject) {
    orderSchema.update(cond, {
      $set: update
    }, function (err, res) {
      if (err) {
        return reject(err);
      } else {
        return resolve(res);
      }
    });
  });
}
