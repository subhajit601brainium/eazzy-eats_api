
var config = require('../../config');
var orderSchema = require('../../schema/Order');
var OrderDetailSchema = require('../../schema/OrderDetail');
var customerSchema = require('../../schema/Customer');
var PushLib = require('../../libraries/pushlib/send-push');

module.exports = {
    //Order Status
    orderStatus: (data, callBack) => {
        if (data) {
            var respData = {};
            respData.orderStatus = ['NEW', 'ACCEPTED', 'READY', 'DELAYED', 'DELIVERED', 'COMPLETED'];

            callBack({
                success: true,
                STATUSCODE: 200,
                message: 'All order Status.',
                response_data: respData
            });
        }
    },
    //Order List
    orderList: (data, callBack) => {
        if (data) {
            var respData = {};

            var vendorId = data.vendorId;

            var findCond = { vendorId: vendorId };
            if ((data.orderStatus != '') && (data.orderStatus != 'ALL')) {
                findCond.orderStatus = data.orderStatus;
            }

            orderSchema
                .find(findCond)
                .sort({ orderTime: 'desc' })
                .populate('orderDetails')
                .then(async function (res) {

                    if (res.length > 0) {

                        var allOrders = res;
                        var ordersArr = [];
                        for (let order of allOrders) {
                            var orderObj = {};
                            var orderDetailsArr = [];
                            orderObj.orderNo = order.orderNo;
                            orderObj.orderStatus = order.orderStatus;
                            orderObj.orderId = order._id;
                            orderObj.preparationTime = order.estimatedDeliveryTime;
                            orderObj.delayedTime = order.delayedTime;

                            //Get Customer Info
                            var customerInfo = await customerSchema.findOne({ _id: order.customerId });
                            orderObj.countryCode = customerInfo.countryCode;
                            orderObj.customerPhone = customerInfo.phone;
                            if (order.orderDetails.length > 0) {
                                for (let orderDetails of order.orderDetails) {
                                    var orderDetailsObj = {};
                                    orderDetailsObj.item = orderDetails.item;
                                    orderDetailsObj.quantity = orderDetails.quantity;

                                    orderDetailsArr.push(orderDetailsObj);
                                }
                            }
                            orderObj.orderDetails = orderDetailsArr;

                            ordersArr.push(orderObj);
                        }

                        // console.log(ordersArr);
                        // respData['ordersArr'] = ordersArr;
                        // respData.push({'ordersArr':ordersArr});
                        respData.ordersArr = ordersArr;

                        console.log(respData);
                        callBack({
                            success: true,
                            STATUSCODE: 200,
                            message: 'All orders.',
                            response_data: respData
                        });

                    } else {
                        callBack({
                            success: true,
                            STATUSCODE: 200,
                            message: 'No order found.',
                            response_data: {}
                        });
                    }

                })
                .catch(function (err) {
                    console.log(err);

                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Something went wrong.',
                        response_data: {}
                    });

                });

        }
    },
    //Order Confirm
    orderConfirm: (data, callBack) => {
        if (data) {
            console.log(data);
            var respData = {};
            var newOrderResult = ['ACCEPTED', 'MODIFIED', 'CANCELLED'];
            var acceptedOrderResult = ['DELAYED', 'READY', 'DELIVERED', 'COMPLETED'];
            var delayedOrderResult = ['READY', 'DELIVERED', 'COMPLETED'];
            var readyOrderResult = ['DELIVERED', 'COMPLETED'];
            var deliveredOrderResult = ['COMPLETED'];

            var vendorId = data.vendorId;
            var orderId = data.orderId;
            var orderChangeRes = data.orderResult;


            orderSchema
                .findOne({ vendorId: vendorId, _id: orderId })
                .then(function (res) {
                    if (res != null) {

                        if (res.orderStatus == 'NEW') {
                            if (newOrderResult.includes(orderChangeRes)) {
                                updateStatus({ orderStatus: orderChangeRes, }, { _id: orderId });

                                if (orderChangeRes == 'ACCEPTED') {
                                    //SEND PUSH MESSAGE
                                    var pushMessage = 'Your order has been accepted'
                                    var receiverId = res.customerId;
                                    sendPush(receiverId, pushMessage)
                                }
                                callBack({
                                    success: true,
                                    STATUSCODE: 200,
                                    message: 'Order Status changes successfully.',
                                    response_data: {}
                                });

                            } else {
                                callBack({
                                    success: false,
                                    STATUSCODE: 422,
                                    message: 'Order result is either ACCEPTED OR MODIFIED OR CANCELLED.',
                                    response_data: {}
                                });
                            }
                        } else if (res.orderStatus == 'ACCEPTED') {
                            if (acceptedOrderResult.includes(orderChangeRes)) {

                                if (orderChangeRes == 'DELAYED') {
                                    var delayedTime = data.delayedTimeMin;

                                    //SEND PUSH MESSAGE
                                    var pushMessage = `Your order has been delayed by ${delayedTime}`
                                    var receiverId = res.customerId;
                                    sendPush(receiverId, pushMessage)

                                    updateStatus({ orderStatus: orderChangeRes, delayedTime: delayedTime }, { _id: orderId });
                                } else {
                                    if (orderChangeRes == 'READY') {

                                        //SEND PUSH MESSAGE
                                        var pushMessage = `Your order has been ready to deliver`
                                        var receiverId = res.customerId;
                                        sendPush(receiverId, pushMessage)

                                    }
                                    updateStatus({ orderStatus: orderChangeRes }, { _id: orderId });
                                }


                                callBack({
                                    success: true,
                                    STATUSCODE: 200,
                                    message: 'Order Status changes successfully.',
                                    response_data: {}
                                });

                            } else {
                                callBack({
                                    success: false,
                                    STATUSCODE: 422,
                                    message: 'Order result is either DELAYED OR DELIVERED OR COMPLETED.',
                                    response_data: {}
                                });
                            }
                        } else if (res.orderStatus == 'DELAYED') {
                            if (delayedOrderResult.includes(orderChangeRes)) {
                                if (orderChangeRes == 'READY') {

                                    //SEND PUSH MESSAGE
                                    var pushMessage = `Your order has been ready to deliver`
                                    var receiverId = res.customerId;
                                    sendPush(receiverId, pushMessage)

                                }
                                updateStatus({ orderStatus: orderChangeRes, }, { _id: orderId });

                                callBack({
                                    success: true,
                                    STATUSCODE: 200,
                                    message: 'Order Status changes successfully.',
                                    response_data: {}
                                });

                            } else {
                                callBack({
                                    success: false,
                                    STATUSCODE: 422,
                                    message: 'Order result is either DELIVERED OR COMPLETED.',
                                    response_data: {}
                                });
                            }
                        } else if (res.orderStatus == 'READY') {
                            if (readyOrderResult.includes(orderChangeRes)) {
                                updateStatus({ orderStatus: orderChangeRes, }, { _id: orderId });

                                callBack({
                                    success: true,
                                    STATUSCODE: 200,
                                    message: 'Order Status changes successfully.',
                                    response_data: {}
                                });

                            } else {
                                callBack({
                                    success: false,
                                    STATUSCODE: 422,
                                    message: 'Order result must be DELIVERED or COMPLETED.',
                                    response_data: {}
                                });
                            }
                        } else if (res.orderStatus == 'DELIVERED') {
                            if (deliveredOrderResult.includes(orderChangeRes)) {
                                updateStatus({ orderStatus: orderChangeRes, }, { _id: orderId });

                                callBack({
                                    success: true,
                                    STATUSCODE: 200,
                                    message: 'Order Status changes successfully.',
                                    response_data: {}
                                });

                            } else {
                                callBack({
                                    success: false,
                                    STATUSCODE: 422,
                                    message: 'Order result must be COMPLETED.',
                                    response_data: {}
                                });
                            }
                        }

                    } else {
                        callBack({
                            success: false,
                            STATUSCODE: 500,
                            message: 'Something went wrong.',
                            response_data: {}
                        });
                    }
                })
                .catch(function (err) {
                    console.log(err);

                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Something went wrong.',
                        response_data: {}
                    });

                });

        }
    }
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


function sendPush(receiverId, pushMessage) {
    console.log(receiverId);

    var pushMessage = pushMessage;
    userDeviceLoginSchemaSchema
        .find({ userId: receiverId, userType: 'CUSTOMER' })
        .then(function (customers) {

            if (customers.length > 0) {
                for (let customer of customers) {

                    var msgStr = "";
                    // msgStr += "~push_notification_id~:~" + pushID + "~";
                    var dataset = "{~message~:~" + pushMessage + "~" + msgStr + "}";

                    var deviceToken = customer.deviceToken;

                    if (customer.appType == 'ANDROID') {

                        //ANDROID PUSH START
                        var andPushData = {
                            'badge': 0,
                            'alert': pushMessage,
                            'deviceToken': deviceToken,
                            'pushMode': customer.pushMode,
                            'dataset': dataset
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
                            'dataset': {}
                        }
                        //SEND PUSH TO IOS [APN]

                        // PushLib.sendPushIOS(iosPushData)
                        //     .then(async function (success) { //PUSH SUCCESS
                        //         console.log('push_success', success);

                        //     }).catch(async function (err) { //PUSH FAILED
                        //         console.log('push_err', err);
                        //     });
                        //IOS PUSH END
                    }
                }
            }
        })
}

