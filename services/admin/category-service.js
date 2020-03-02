var async  = require('async');
var categoryModel = require('../../models/admin/category-model');

module.exports = {
    addCategory: (data, callBack) => {
        async.waterfall([
            function(nextCb) {
                categoryModel.addCategory(data, function(result) {
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
    },
    getAllCategories: (data, callBack) => {
        async.waterfall([
            function(nextCb) {
                categoryModel.getAllCategories(data, function(result) {
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