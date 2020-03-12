var async = require('async');
const restaurantModel = require('../../models/customer/restaurant-model');

module.exports = {
    customerHome: (data, callBack) => {
        async.waterfall([
            function(nextCb) {
                restaurantModel.customerHome(data, function(result) {
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
    restaurantDetails: (data, callBack) => {
        async.waterfall([
            function(nextCb) {
                restaurantModel.restaurantDetails(data, function(result) {
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