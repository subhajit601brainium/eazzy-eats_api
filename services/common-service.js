var async = require('async');
const stateModel = require('../models/admin/state-model');
const cityModel = require('../models/admin/city-model');
module.exports = {
    getAllStates: (callBack) => {
        async.waterfall([
            function(nextCb) {
                stateModel.getAllState(function(result) {
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

    getAllCities: (data, callBack) => {
        async.waterfall([
            function(nextCb) {
                cityModel.getAllCities(data, function(result) {
                    nextCb(null, result);
                });
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