var async = require('async');
const citySchema = require('../../schema/City');
const stateSchema = require('../../schema/State');

module.exports = {
    addCity: (data, callBack) => {
        if (data) {
            async.waterfall([
                function (nextCb) {
                    /** Check state is already exists or not */
                    citySchema.countDocuments({ stateId: data.stateId, name: data.name }, function (err, count) {
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
                                message: 'City already exists for the state',
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
                function (arg1, nextCb) {
                    if (arg1.STATUSCODE === 200) {
                        new citySchema(data).save(function (err, result) {
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
                                    message: 'City added successfully',
                                    response_data: result
                                })
                            }
                        })
                    } else {
                        nextCb(null, arg1);
                    }
                }
            ], function (err, result) {
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

    getAllCities: (data, callBack) => {
        if (data) {
            citySchema.find({ isActive: true, stateId: data.stateId }, { _id: 1, name: 1 }, function (err, result) {
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
    },

    importCityState: async (data, callBack) => {
        if (data) {
            const excelToJson = require('convert-excel-to-json');

            const result = excelToJson({
                sourceFile: 'data.xlsx'
            });

            var cityState = result.Sheet1;
            // var stateArr = [];
            for (let cityStateval of cityState) {

                var stateName = cityStateval.A;
                var cityName = cityStateval.B;

                if ((stateName != 'States in Nigeria') && (cityName != 'Cities in in Each State')) {
                   // stateArr.push(cityStateval.A);
                  //  var unique = stateArr.filter(onlyUnique);



                 //   var resultState = await stateSchema.findOne({name: stateName});
                       
                        // console.log('in',cityName);
                        // console.log(resultState._id);
                        // if(resultState) {
                        //     var stateId = resultState._id;
                        //    // console.log(resultState.name);
                        //     new citySchema({name: cityName, isActive: true, stateId: stateId}).save(function (err, result) {
                        //         if (err) {
                        //             console.log(err);
                        //         } else {
                        //             console.log(result._id);
                        //         }
                        //     });
                        // }
                   

                }
            }
           // console.log(unique);
            // for (let uniqueVal of unique) {

            //     new stateSchema({ name: uniqueVal, isActive: true }).save(function (err, resultStateNew) {
            //         console.log(resultStateNew);
            //     });

            // }


        }
    }
}

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}