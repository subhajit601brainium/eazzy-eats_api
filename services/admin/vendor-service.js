var async  = require('async');
var vendorModel = require('../../models/admin/vendor-model');

module.exports = {
    addVendor: (data, callBack) => {
        async.waterfall([
            function(nextCb) {
                vendorModel.addVendor(data, function(result) {
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
    addVendorTime: (data, callBack) => {
        async.waterfall([
            function(nextCb) {
                vendorModel.addVendorTime(data, function(result) {
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
    vendorOwnerRegister: (data, callBack) => {
        async.waterfall([
            function(nextCb) {
                vendorModel.vendorOwnerRegister(data, function(result) {
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
    addItem: (data, callBack) => {
        async.waterfall([
            function(nextCb) {
                vendorModel.addItem(data, function(result) {
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
    getVendorInfo: (data, callBack) => {
        async.waterfall([
            function(nextCb) {
                vendorModel.getVendorInfo(data, function(result) {
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