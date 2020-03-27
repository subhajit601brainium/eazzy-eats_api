
var config = require('../../config');
var orderSchema = require('../../schema/Order');
var OrderDetailSchema = require('../../schema/OrderDetail');

module.exports = {
    //Order Status
    orderStatus: (data, callBack) => {
        if (data) {
            var respData = {};
            respData.orderStatus = ['NEW','ACCEPTED', 'DELAYED', 'DELIVERED', 'COMPLETED'];

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

            var findCond = {vendorId: vendorId};
            if((data.orderStatus != '') && (data.orderStatus != 'ALL')) {
                findCond.orderStatus = data.orderStatus;
            }

            orderSchema
            .find(findCond)
            .sort({orderTime: 'desc'})
            .populate('orderDetails')
            .then(function(res) {
                
                if(res.length > 0) {
                    
                    var allOrders = res;
                    var ordersArr = [];
                    for(let order of allOrders) {
                        var orderObj = {};
                        var orderDetailsArr = [];
                        orderObj.orderNo = order.orderNo;
                        orderObj.orderStatus = order.orderStatus;
                        orderObj.orderId = order._id;
                        orderObj.preparationTime = order.estimatedDeliveryTime;
                        if(order.orderDetails.length > 0) {
                            for(let orderDetails of order.orderDetails) {
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
                        response_data: []
                    });
                }

            })
            .catch(function(err) {
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
            var newOrderResult = ['ACCEPTED','MODIFIED','CANCELLED'];
            var acceptedOrderResult = ['DELAYED','DELIVERED','COMPLETED'];
            var delayedOrderResult = ['DELIVERED','COMPLETED'];
            var completedOrderResult = ['DELIVERED'];

            var vendorId = data.vendorId;
            var orderId = data.orderId;
            var orderChangeRes = data.orderResult;


            orderSchema
            .findOne({vendorId: vendorId, _id: orderId})
            .then(function(res) {
                if(res != null) {

                    if(res.orderStatus == 'NEW') {
                        if(newOrderResult.includes(orderChangeRes)) {
                            updateStatus({ orderStatus: orderChangeRes,  }, { _id: orderId });

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
                    } else if(res.orderStatus == 'ACCEPTED') {
                        if(acceptedOrderResult.includes(orderChangeRes)) {
                            updateStatus({ orderStatus: orderChangeRes,  }, { _id: orderId });

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
                    } else if(res.orderStatus == 'DELAYED') {
                        if(delayedOrderResult.includes(orderChangeRes)) {
                            updateStatus({ orderStatus: orderChangeRes,  }, { _id: orderId });

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
                    } else if(res.orderStatus == 'COMPLETED') {
                        if(completedOrderResult.includes(orderChangeRes)) {
                            updateStatus({ orderStatus: orderChangeRes,  }, { _id: orderId });

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
                                message: 'Order result must be DELIVERED.',
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
            .catch(function(err) {
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

