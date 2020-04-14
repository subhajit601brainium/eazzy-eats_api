var async = require('async');
const orderModel = require('../../models/customer/order-model');

module.exports = {
    orderList: (data, callBack) => {
        async.waterfall([
            function(nextCb) {
                orderModel.orderList(data, function(result) {
                    nextCb(null, result);
                })
            }
        ], function(err, result) {
            if (err) {
                callBack({
                    success: false,
                    STATUSCODE: 403,
                    message: 'Request Forbidden',
                    response_data: {}
                })
            } else {
                callBack(result);
            }
        });
    },
    orderDetails: (data, callBack) => {
        async.waterfall([
            function(nextCb) {
                orderModel.orderDetails(data, function(result) {
                    nextCb(null, result);
                })
            }
        ], function(err, result) {
            if (err) {
                callBack({
                    success: false,
                    STATUSCODE: 403,
                    message: 'Request Forbidden',
                    response_data: {}
                })
            } else {
                callBack(result);
            }
        });
    }
}