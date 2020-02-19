var async  = require('async');
var cityModel = require('../../models/admin/city-model');

module.exports = {
    addCity: (data, callBack) => {
        async.waterfall([
            function(nextCb) {
                cityModel.addCity(data, function(result) {
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
        })
    }
}