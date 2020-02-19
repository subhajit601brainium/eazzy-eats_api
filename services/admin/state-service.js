var async  = require('async');
var stateModel = require('../../models/admin/state-model');

module.exports = {
    addSate: (data, callBack) => {
        async.waterfall([
            function(nextCb) {
                stateModel.addState(data, function(result) {
                    nextCb(null,result);
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