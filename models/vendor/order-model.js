
var config = require('../../config');
var orderSchema = require('../../schema/Order');
var orderDetailsSchema = require('../../schema/OrderDetail');

module.exports = {
    //Order List
    orderList: (data, callBack) => {
        if (data) {

            var vendorId = data.vendorId;
            console.log(data);

            orderSchema
            .find({vendorId: vendorId})
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

                    console.log(ordersArr);
                    callBack({
                        success: true,
                        STATUSCODE: 200,
                        message: 'All orders.',
                        response_data: ordersArr
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
    }
}

