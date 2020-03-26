var async = require('async');
const restaurantModel = require('../../models/vendor/order-model');

module.exports = {
    orderList: (data, callBack) => {
        async.waterfall([
            function(nextCb) {
                restaurantModel.orderList(data, function(result) {
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