var async = require('async');
const paymentModel = require('../../models/customer/payment-model');

module.exports = {
    paymentInitialize: (data, callBack) => {
        async.waterfall([
            function(nextCb) {
                paymentModel.paymentInitialize(data, function(result) {
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
}