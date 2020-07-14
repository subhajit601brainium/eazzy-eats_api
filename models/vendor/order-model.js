
var config = require('../../config');
var orderSchema = require('../../schema/Order');
var OrderDetailSchema = require('../../schema/OrderDetail');
var userDeviceLoginSchemaSchema = require('../../schema/UserDeviceLogin');
var customerSchema = require('../../schema/Customer');
var vendorSchema = require('../../schema/Vendor');
var PushLib = require('../../libraries/pushlib/send-push');
var UserNotificationSchema = require('../../schema/UserNotification');

module.exports = {
    //Order Status
    orderStatus: (data, callBack) => {
        if (data) {
            var respData = {};
            respData.orderStatus = ['NEW', 'ACCEPTED', 'READY', 'DELAYED', 'COLLECTED', 'COMPLETED'];

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
                            orderObj.orderStatusTime = listDateTimeFormat(order.orderStatusChangeTime);
                            orderObj.orderId = order._id;
                            orderObj.preparationTime = order.estimatedDeliveryTime;
                            orderObj.delayedTime = order.delayedTime;
                            orderObj.orderCancelReason = order.orderCancelReason;

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

                        // console.log(respData);
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
            var acceptedOrderResult = ['DELAYED', 'READY', 'COLLECTED', 'COMPLETED'];
            var delayedOrderResult = ['READY', 'DELAYED', 'COLLECTED', 'COMPLETED'];
            var readyOrderResult = ['COLLECTED', 'COMPLETED'];
            var deliveredOrderResult = ['COMPLETED'];

            var vendorId = data.vendorId;
            var orderId = data.orderId;
            var orderChangeRes = data.orderResult;




            orderSchema
                .findOne({ vendorId: vendorId, _id: orderId })
                .then(async function (res) {
                    // console.log('res',res);
                    if (res != null) {

                        if (res.orderStatus == 'NEW') {
                            if (newOrderResult.includes(orderChangeRes)) {
                                

                                if (orderChangeRes == 'CANCELLED') {
                                    var cancellationReason = data.orderCancelReason;

                                    if ((cancellationReason == '') || (cancellationReason == undefined)) {
                                        callBack({
                                            success: false,
                                            STATUSCODE: 422,
                                            message: 'Order Cancellation reason is required.',
                                            response_data: {}
                                        });
                                    } else {
                                        updateStatus({ orderStatus: orderChangeRes, orderStatusChangeTime: new Date(), orderCancelReason: cancellationReason }, { _id: orderId });
                                        callBack({
                                            success: true,
                                            STATUSCODE: 200,
                                            message: 'Order Status changes successfully.',
                                            response_data: {}
                                        });
                                    }
                                } else {
                                    updateStatus({ orderStatus: orderChangeRes, orderStatusChangeTime: new Date() }, { _id: orderId });
                                    if (orderChangeRes == 'ACCEPTED') {
                                        //SEND PUSH MESSAGE
                                        var pushMessage = 'Your order has been accepted'
                                        var receiverId = res.customerId;
                                        var orderNo = res.orderNo;
                                        var orderStatus = orderChangeRes;

                                        //Fetch Vendor name
                                        var vendorInfo = await vendorSchema.findOne({ _id: vendorId });
                                        var vendorName = vendorInfo.restaurantName;
                                        sendPush(receiverId, pushMessage, orderNo, orderStatus, vendorName);

                                        //ADD DATA IN NOTIFICATION TABLE
                                        var userNotificationData = {
                                            userId: receiverId,
                                            userType: 'CUSTOMER',
                                            title: 'order accept',
                                            type: 'OrderAccept',
                                            content: pushMessage,
                                            isRead: 'NO'
                                        }
                                        new UserNotificationSchema(userNotificationData).save(async function (err, result) {
                                            console.log('err',err);
                                            console.log('result',result);
                                        });
                                    }
                                    callBack({
                                        success: true,
                                        STATUSCODE: 200,
                                        message: 'Order Status changes successfully.',
                                        response_data: {}
                                    });
                                }


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
                                    var orderNo = res.orderNo;
                                    var orderStatus = orderChangeRes;

                                    //Fetch Vendor name
                                    var vendorInfo = await vendorSchema.findOne({ _id: vendorId });
                                    var vendorName = vendorInfo.restaurantName;
                                    sendPush(receiverId, pushMessage, orderNo, orderStatus, vendorName);

                                    updateStatus({ orderStatus: orderChangeRes, delayedTime: delayedTime, orderStatusChangeTime: new Date() }, { _id: orderId });

                                    //ADD DATA IN NOTIFICATION TABLE
                                    var userNotificationData = {
                                        userId: receiverId,
                                        userType: 'CUSTOMER',
                                        title: 'order delayed',
                                        type: 'OrderDelayed',
                                        content: pushMessage,
                                        isRead: 'NO'
                                    }
                                    new UserNotificationSchema(userNotificationData).save(async function (err, result) {
                                        console.log('err',err);
                                        console.log('result',result);
                                    });
                                } else {
                                    if (orderChangeRes == 'READY') {

                                        //SEND PUSH MESSAGE
                                        var pushMessage = `Your order has been ready to deliver`
                                        var receiverId = res.customerId;
                                        var orderNo = res.orderNo;
                                        var orderStatus = orderChangeRes;

                                        //Fetch Vendor name
                                        var vendorInfo = await vendorSchema.findOne({ _id: vendorId });
                                        var vendorName = vendorInfo.restaurantName;
                                        sendPush(receiverId, pushMessage, orderNo, orderStatus, vendorName);

                                        //ADD DATA IN NOTIFICATION TABLE
                                        var userNotificationData = {
                                            userId: receiverId,
                                            userType: 'CUSTOMER',
                                            title: 'order ready',
                                            type: 'OrderReady',
                                            content: pushMessage,
                                            isRead: 'NO'
                                        }
                                        new UserNotificationSchema(userNotificationData).save(async function (err, result) {
                                            console.log('err',err);
                                            console.log('result',result);
                                        });

                                    }
                                    updateStatus({ orderStatus: orderChangeRes, orderStatusChangeTime: new Date() }, { _id: orderId });
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
                                    message: 'Order result is either DELAYED OR COLLECTED OR COMPLETED.',
                                    response_data: {}
                                });
                            }
                        } else if (res.orderStatus == 'DELAYED') {
                            if (delayedOrderResult.includes(orderChangeRes)) {
                                if (orderChangeRes == 'DELAYED') {
                                    var delayedTime = data.delayedTimeMin;

                                    //SEND PUSH MESSAGE
                                    var pushMessage = `Your order has been delayed by ${delayedTime}`
                                    var receiverId = res.customerId;
                                    var orderNo = res.orderNo;
                                    var orderStatus = orderChangeRes;

                                    //Fetch Vendor name
                                    var vendorInfo = await vendorSchema.findOne({ _id: vendorId });
                                    var vendorName = vendorInfo.restaurantName;
                                    sendPush(receiverId, pushMessage, orderNo, orderStatus, vendorName);

                                    //ADD DATA IN NOTIFICATION TABLE
                                    var userNotificationData = {
                                        userId: receiverId,
                                        userType: 'CUSTOMER',
                                        title: 'order delay',
                                        type: 'OrderDelay',
                                        content: pushMessage,
                                        isRead: 'NO'
                                    }
                                    new UserNotificationSchema(userNotificationData).save(async function (err, result) {
                                        console.log('err',err);
                                        console.log('result',result);
                                    });

                                    updateStatus({ orderStatus: orderChangeRes, delayedTime: delayedTime, orderStatusChangeTime: new Date() }, { _id: orderId });
                                } else if (orderChangeRes == 'READY') {

                                    //SEND PUSH MESSAGE
                                    var pushMessage = `Your order has been ready to deliver`
                                    var receiverId = res.customerId;
                                    var orderNo = res.orderNo;
                                    var orderStatus = orderChangeRes;

                                    //Fetch Vendor name
                                    var vendorInfo = await vendorSchema.findOne({ _id: vendorId });
                                    var vendorName = vendorInfo.restaurantName;
                                    sendPush(receiverId, pushMessage, orderNo, orderStatus, vendorName);

                                    updateStatus({ orderStatus: orderChangeRes, orderStatusChangeTime: new Date() }, { _id: orderId });

                                    //ADD DATA IN NOTIFICATION TABLE
                                    var userNotificationData = {
                                        userId: receiverId,
                                        userType: 'CUSTOMER',
                                        title: 'order ready',
                                        type: 'OrderReady',
                                        content: pushMessage,
                                        isRead: 'NO'
                                    }
                                    new UserNotificationSchema(userNotificationData).save(async function (err, result) {
                                        console.log('err',err);
                                        console.log('result',result);
                                    });
                                } else {
                                    updateStatus({ orderStatus: orderChangeRes, orderStatusChangeTime: new Date() }, { _id: orderId });
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
                                    message: 'Order result is either COLLECTED OR COMPLETED.',
                                    response_data: {}
                                });
                            }
                        } else if (res.orderStatus == 'READY') {
                            if (readyOrderResult.includes(orderChangeRes)) {
                                updateStatus({ orderStatus: orderChangeRes, orderStatusChangeTime: new Date() }, { _id: orderId });

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
                                    message: 'Order result must be COLLECTED or COMPLETED.',
                                    response_data: {}
                                });
                            }
                        } else if (res.orderStatus == 'COLLECTED') {
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
    },
    dashboard: (data, callBack) => {
        if (data) {
            var respData = {};

            var vendorId = data.body.vendorId;



            orderSchema
                .find({ vendorId: vendorId })
                .sort({ orderTime: 'desc' })
                .then(async function (orders) {
                    var preparedOrder = [];
                    var preparedOrderCnt = 0;
                    var deliveredOrder = [];
                    var deliveredOrderCnt = 0;
                    var delayedOrder = [];
                    var delayedOrderCnt = 0;
                    var newOrder = [];
                    var newOrderCnt = 0;
                    var preOrder = [];
                    var preOrderCnt = 0;
                    var readyOrder = [];
                    var readyOrderCnt = 0;

                    console.log(orders);
                    if (orders.length > 0) {

                        for (let order of orders) {
                            if (order.orderStatus == 'COLLECTED') {
                                deliveredOrder.push(order);
                                deliveredOrderCnt = deliveredOrder.length;
                            } else if (order.orderStatus == 'NEW') {
                                newOrder.push(order);
                                newOrderCnt = newOrder.length;
                            } else if (order.orderStatus == 'DELAYED') {
                                delayedOrder.push(order);
                                delayedOrderCnt = delayedOrder.length;
                            } else if (order.orderStatus == 'READY') {
                                readyOrder.push(order);
                                readyOrderCnt = readyOrder.length;
                            } else if (order.orderStatus == 'COMPLETED') {
                                preparedOrder.push(order);
                                preparedOrderCnt = preparedOrder.length;
                            } else if (order.orderStatus == 'PRE') {
                                preOrder.push(order);
                                preOrderCnt = preOrder.length;
                            }
                        }

                    }
                    // console.log(respData);
                    callBack({
                        success: true,
                        STATUSCODE: 200,
                        message: 'Dashboard data.',
                        response_data: {
                            'prepared': preparedOrderCnt,
                            'delivered': deliveredOrderCnt,
                            'delay': delayedOrderCnt,
                            'new': newOrderCnt,
                            'pre': preOrderCnt,
                            'ready': readyOrderCnt
                        }
                    });
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

function listDateTimeFormat(date) {
    var dateFormatCheck = date;

    var day = dateFormatCheck.getDate();

    var month = (Number(dateFormatCheck.getMonth()) + 1);

    if (Number(month) < 10) {
        month = `0${month}`
    }

    var year = dateFormatCheck.getFullYear();

    var hours = dateFormatCheck.getHours(); // => 9
    if (hours < 10) {
        hours = `0${hours}`
    }
    var minutes = dateFormatCheck.getMinutes(); // =>  30
    if (minutes < 10) {
        minutes = `0${minutes}`
    }
    var seconds = dateFormatCheck.getSeconds(); // => 51
    if (seconds < 10) {
        seconds = `0${seconds}`
    }

    var dateformat = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    return dateformat;
}

