var async = require('async');
const stateSchema = require('../../schema/State');

module.exports = {
    addState: (data, callBack) => {
        if (data) {
            async.waterfall([
                function(nextCb) {
                    /** Check state is already exists or not */
                    stateSchema.countDocuments({name: data.name}, function(err, count) {
                        if (err) {
                            nextCb(null, {
                                success: false,
                                STATUSCODE: 500,
                                message: 'Internal DB error',
                                response_data: {}
                            });
                        }
                        if (count) {
                            nextCb(null, {
                                success: false,
                                STATUSCODE: 422,
                                message: 'State already exists',
                                response_data: {}
                            });
                        } else {
                            nextCb(null, {
                                success: true,
                                STATUSCODE: 200,
                                message: 'success',
                                response_data: {}
                            })
                        }
                    })
                },
                function(arg1, nextCb) {
                    if (arg1.STATUSCODE === 200) {
                        new stateSchema(data).save(function(err, result) {
                            if (err) {
                                nextCb(null, {
                                    success: false,
                                    STATUSCODE: 500,
                                    message: 'Internal DB error',
                                    response_data: {}
                                });
                            } else {
                                nextCb(null, {
                                    success: true,
                                    STATUSCODE: 200,
                                    message: 'State added successfully',
                                    response_data: result
                                })
                            }
                        })
                    } else {
                        nextCb(null, arg1);
                    }
                }
            ], function(err, result) {
                if (err) {
                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Internal DB error',
                        response_data: {}
                    });
                } else {
                    callBack(result);
                }
            })
        }
    },

    getAllState: (callBack) => {
        stateSchema.find({isActive: true},{_id: 1, name: 1},function(err, result) {
            if (err) {
                callBack({
                    success: false,
                    STATUSCODE: 500,
                    message: 'Internal DB error',
                    response_data: {}
                });
            } else {
                callBack({
                    success: true,
                    STATUSCODE: 200,
                    message: 'success',
                    response_data: result
                })
            }
        }).sort({name: 'asc'});
    }
}