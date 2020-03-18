var async = require('async');
const categorySchema = require('../../schema/Category');

module.exports = {
    addCategory: (reqData, callBack) => {
        if (reqData) {
            var data = reqData.body;
            var files = reqData.files;
            async.waterfall([
                function (nextCb) {
                    /** Check state is already exists or not */
                    categorySchema.countDocuments({ categoryName: data.categoryName }, function (err, count) {
                        if (err) {
                            console.log(err);
                            callBack({
                                success: false,
                                STATUSCODE: 500,
                                message: 'Internal DB error',
                                response_data: {}
                            });
                        }
                        if (count) {
                            callBack({
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
                async function (arg1, nextCb) {
                    if (arg1.STATUSCODE === 200) {

                        var categoryImage = await uploadImage(files.image, 'category');

                        if (categoryImage != 'error') {
                            var catdata = data;
                            catdata.image = categoryImage;
                            new categorySchema(catdata).save(function (err, result) {
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
                                        message: 'Category added successfully.',
                                        response_data: {}
                                    })
                                }
                            })
                        } else {
                            callBack({
                                success: false,
                                STATUSCODE: 500,
                                message: 'Category image upload failed.',
                                response_data: {}
                            });
                        }
                    }
                }
            ], function (err, result) {
                if (err) {
                    console.log(err);
                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Internal DB error',
                        response_data: {}
                    });
                }
            })
        }
    },
    getAllCategories: (data, callBack) => {
        if (data) {
            categorySchema.find({}, { _id: 1, categoryName: 1 }, function (err, result) {
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
            }).sort({ name: 'asc' });
        }
    }


}

// Image uplaod
function uploadImage(file, name) {
    return new Promise(function (resolve, reject) {

        //Get image extension
        var ext = getExtension(file.name);

        // The name of the input field (i.e. "image") is used to retrieve the uploaded file
        let sampleFile = file;

        var file_name = `${name}-${Math.floor(Math.random() * 1000)}-${Math.floor(Date.now() / 1000)}.${ext}`;

        // Use the mv() method to place the file somewhere on your server
        sampleFile.mv(`public/img/category/${file_name}`, function (err) {
            if (err) {
                console.log('err', err);
                return reject('error');
            } else {
                return resolve(file_name);
            }
        });
    });
}

function getExtension(filename) {
    return filename.substring(filename.indexOf('.') + 1);
}