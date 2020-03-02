var async = require('async');
const categorySchema = require('../../schema/Category');

module.exports = {
    addCategory: (data, callBack) => {
        if (data) {
            async.waterfall([
                function(nextCb) {
                    /** Check state is already exists or not */
                    categorySchema.countDocuments({categoryName: data.categoryName}, function(err, count) {
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
                                message: 'Category already exists for this name',
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
                        new categorySchema(data).save(function(err, result) {
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
                                    message: 'Category added successfully',
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
    getAllCategories: (data ,callBack) => {
        if (data) {
            categorySchema.find({},{_id: 1, categoryName: 1},function(err, result) {
                if (err) {
                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Internal DB error',
                        response_data: {}
                    });
                } else {
                    if (result.length) {
                        callBack({
                            success: true,
                            STATUSCODE: 200,
                            message: 'success',
                            response_data: result
                        })
                    } else {
                        callBack({
                            success: true,
                            STATUSCODE: 200,
                            message: 'No cities found for the state',
                            response_data: result
                        })
                    }
                    
                }
            }).sort({name: 'asc'});
        }
    }

    
}