var vendorSchema = require('../../schema/Vendor');
var vendorOwnerSchema = require('../../schema/VendorOwner');
var bannerSchema = require('../../schema/Banner');
var vandorTimeSchema = require('../../schema/VendorOpenCloseTime');
var ItemSchema = require('../../schema/Item');
var ItemExtraSchema = require('../../schema/ItemExtra');
const config = require('../../config');
const mail = require('../../modules/sendEmail');
var bcrypt = require('bcryptjs');

module.exports = {
    //Vendor Add 
    addVendor: async (data, callBack) => {
        if (data) {
            var files = data.files;
            var reqBody = data.body;



            /** Check for vendor existence */
            vendorSchema.findOne({ $or: [{ contactEmail: reqBody.restaurantEmail }, { contactPhone: reqBody.restaurantPhone }] }, async function (err, respons) {
                if (err) {
                    console.log(err);
                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Internal DB error',
                        response_data: {}
                    });
                } else {
                    if (respons) {
                        callBack({
                            success: false,
                            STATUSCODE: 422,
                            message: 'Restaurant already exists for this information.',
                            response_data: {}
                        });
                    } else {



                        /** Check for customer existence */
                        vendorOwnerSchema.countDocuments({ email: reqBody.email }).exec(function (err, count) {
                            if (err) {
                                console.log(err);
                                callBack({
                                    success: false,
                                    STATUSCODE: 500,
                                    message: 'Internal DB error',
                                    response_data: {}
                                });
                            } else {
                                if (count) {
                                    callBack({
                                        success: false,
                                        STATUSCODE: 422,
                                        message: 'User already exists for this email',
                                        response_data: {}
                                    });
                                } else {
                                    vendorOwnerSchema.countDocuments({ phone: reqBody.phone }).exec(async function (err, count) {
                                        if (err) {
                                            console.log(err);
                                            callBack({
                                                success: false,
                                                STATUSCODE: 500,
                                                message: 'Internal DB error',
                                                response_data: {}
                                            });

                                        } if (count) {
                                            callBack({
                                                success: false,
                                                STATUSCODE: 422,
                                                message: 'User already exists for this phone no.',
                                                response_data: {}
                                            });
                                        } else {

                                            //Image Upload
                                            var logoInfo = await uploadvendorImage(files.logo, 'logo');

                                            var detailsInfo = await uploadvendorImage(files.banner, 'detailsbanner');

                                            var licenseInfo = await uploadvendorImage(files.licenceImage, 'licence');


                                            if ((logoInfo != 'error') && (detailsInfo != 'error') && (licenseInfo != 'error')) {
                                                // console.log(logoInfo);

                                                if (reqBody.isActive == 'ACTIVE') {
                                                    var resStatus = true;
                                                } else {
                                                    var resStatus = false;
                                                }


                                                var vendorUpData = {
                                                    restaurantName: reqBody.restaurantName,
                                                    managerName: reqBody.managerName,
                                                    restaurantType: reqBody.restaurantType,
                                                    contactEmail: reqBody.restaurantEmail,
                                                    contactPhone: reqBody.restaurantPhone,
                                                    description: reqBody.description,
                                                    logo: logoInfo,
                                                    banner: detailsInfo,
                                                    licenceImage: licenseInfo,
                                                    location: {
                                                        type: 'Point',
                                                        coordinates: [reqBody.longitude, reqBody.latitude]
                                                    },
                                                    isActive: resStatus,
                                                    rating: 0
                                                };
                                                new vendorSchema(vendorUpData).save(async function (err, result) {
                                                    if (err) {
                                                        console.log(err);
                                                        callBack({
                                                            success: false,
                                                            STATUSCODE: 500,
                                                            message: 'Internal DB error',
                                                            response_data: {}
                                                        });
                                                    } else {

                                                        //Offer Banner Upload
                                                        if (files.offer_banner != undefined) {
                                                            var bannerInfo = await uploadvendorImage(data.files.offer_banner, 'offer_banner');
                                                        }

                                                        if (bannerInfo != 'error') {
                                                            var vendorId = result._id;
                                                            var bannerData = {
                                                                vendorId: vendorId,
                                                                bannerType: 'HAPPY HOURS',
                                                                image: bannerInfo
                                                            }
                                                            //BANNER ADD
                                                            new bannerSchema(bannerData).save(async function (err, result) {
                                                                if (err) {
                                                                    console.log(err);
                                                                    callBack({
                                                                        success: false,
                                                                        STATUSCODE: 500,
                                                                        message: 'Internal DB error',
                                                                        response_data: {}
                                                                    });
                                                                } else {
                                                                    var ownerPassword = generatePassword();
                                                                    var vendorOwner = {
                                                                        vendorId: vendorId,
                                                                        firstName: reqBody.firstName,
                                                                        lastName: reqBody.lastName,
                                                                        email: reqBody.email,
                                                                        password : ownerPassword,
                                                                        phone: reqBody.phone,
                                                                        location: reqBody.location,
                                                                        isActive: true
                                                                    }
                                                                    //VENDOR OWNER ADD
                                                                    new vendorOwnerSchema(vendorOwner).save(async function (err, result) {
                                                                        if (err) {
                                                                            console.log(err);
                                                                            callBack({
                                                                                success: false,
                                                                                STATUSCODE: 500,
                                                                                message: 'Internal DB error',
                                                                                response_data: {}
                                                                            });
                                                                        } else {

                                                                            try {
                                                                                mail('vendorOwnerRegistrationMail')(reqBody.email, vendorOwner).send();
                                                                                callBack({
                                                                                    success: true,
                                                                                    STATUSCODE: 200,
                                                                                    message: 'Vendor related information added Successfull',
                                                                                    response_data: result
                                                                                })
                                                                            } catch (Error) {
                                                                                console.log(Error);
                                                                                console.log('Something went wrong while sending email');
                                                                            } 
                                                                        }
                                                                    });
                                                                }
                                                            });

                                                        } else { //IF SOMEHOW BANNER UPLOAD FAILED
                                                            callBack({
                                                                success: false,
                                                                STATUSCODE: 500,
                                                                message: 'Internal error, Something went wrong.',
                                                                response_data: {}
                                                            });
                                                        }
                                                    }
                                                });
                                            } else { //IF SOMEHOW LOGO UPLOAD FAILED
                                                callBack({
                                                    success: false,
                                                    STATUSCODE: 500,
                                                    message: 'Internal error, Something went wrong.',
                                                    response_data: {}
                                                });
                                            }
                                        }
                                    });

                                }
                            }
                        });
                    }

                }
            });
        }
    },
    //Vendor Time Add 
    addVendorTime: async (reqBody, callBack) => {
        if (reqBody) {
            // var files = data.files;
            //   var reqBody = data.body;
            // console.log(reqBody);
            // return;
            var validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            var validZone = ['AM', 'PM'];
            console.log(reqBody);
            var restaurantTime = reqBody.restaurantTime;

            //CHECK if Restaurant Time data is valid Json or not
            var checkJson = await isJson(restaurantTime);


            if (checkJson == true) {
                var restaurantTimeObj = JSON.parse(restaurantTime);

                if (restaurantTimeObj.length > 0) {
                    var validateData = 0;
                    var restaurantTimeValArr = [];
                    for (let restaurantTimeVal of restaurantTimeObj) { //{ day: 'Monday', startTime: '10 AM', endTime: '10:30 PM' }
                        var restaurantTimeValdays = restaurantTimeVal.day; //Monday
                        var restaurantTimeValStartTime = restaurantTimeVal.startTime; //10 AM
                        var restaurantTimeValEndTime = restaurantTimeVal.endTime; //10:30 PM

                        if (validDays.includes(restaurantTimeValdays)) { //CHECK IF DAY IS VALID OR NOT

                            var restaurantTimeValStartTimeCheck = restaurantTimeValStartTime.split(" "); //[ '10', 'AM' ]
                            var restaurantTimeValEndTimeCheck = restaurantTimeValEndTime.split(" "); //[ '10:30', 'PM' ]

                            if ((restaurantTimeValStartTimeCheck.length == 2) && (restaurantTimeValEndTimeCheck.length == 2)) { //THIS RESULT ALWAYS HAVE TO RETURN 2
                                if ((validZone.includes(restaurantTimeValStartTimeCheck[1])) && (validZone.includes(restaurantTimeValEndTimeCheck[1]))) { //CHECK AM,PM STRING
                                    var restaurantTimeStartTimeFormatCheck = restaurantTimeValStartTimeCheck[0].split(":"); // [ '10' ]
                                    var restaurantTimeEndTimeFormatCheck = restaurantTimeValEndTimeCheck[0].split(":"); // [ '10','30' ]

                                    if ((!isNaN(restaurantTimeStartTimeFormatCheck[0])) && (!isNaN(restaurantTimeEndTimeFormatCheck[0]))) { //THIS VALUE MUST BE A NUMBER

                                        var restaurantTimeStartTimeLast = 0;
                                        if (restaurantTimeStartTimeFormatCheck[1] != undefined) {
                                            restaurantTimeStartTimeLast = restaurantTimeStartTimeFormatCheck[1];
                                        }

                                        var restaurantTimelastTimeLast = 0;
                                        if (restaurantTimeEndTimeFormatCheck[1] != undefined) {
                                            restaurantTimelastTimeLast = restaurantTimeEndTimeFormatCheck[1];
                                        }

                                        if ((!isNaN(restaurantTimeStartTimeLast)) && (!isNaN(restaurantTimelastTimeLast))) { //THIS VALUE MUST BE A NUMBER
                                            var startTimeAMPM = restaurantTimeValStartTimeCheck[1];
                                            var endTimeAMPM = restaurantTimeValEndTimeCheck[1];

                                            var startTimeFirst = Number(restaurantTimeStartTimeFormatCheck[0]);
                                            var endTimeFirst = Number(restaurantTimeEndTimeFormatCheck[0]);

                                            var startTimeLast = Number(restaurantTimeStartTimeLast);
                                            var endTimeLast = Number(restaurantTimelastTimeLast);

                                            //OPEN TIME
                                            if (startTimeAMPM == 'AM') {
                                                var finalStartTime = ((startTimeFirst * 60) + startTimeLast);
                                            } else {
                                                var finalStartTime = (((startTimeFirst + 12) * 60) + startTimeLast);
                                            }

                                            //CLOSE TIME
                                            if (endTimeAMPM == 'AM') {
                                                var finalEndTime = ((endTimeFirst * 60) + endTimeLast);
                                            } else {
                                                var finalEndTime = (((endTimeFirst + 12) * 60) + endTimeLast);
                                            }

                                            var vendorTimeData = {
                                                vendorId: reqBody.vendorId,
                                                day: restaurantTimeValdays,
                                                openTime: finalStartTime,
                                                closeTime: finalEndTime,
                                                isActive: true
                                            }

                                            restaurantTimeValArr.push(vendorTimeData);

                                        } else {
                                            console.log('Start & End Time Format Invalid after :');
                                            validateData++;
                                        }

                                    } else {
                                        console.log('Start & End Time Format Invalid');
                                        validateData++;
                                    }

                                } else {
                                    console.log('Start & End Time AM, PM Invalid');
                                    validateData++;
                                }
                            } else {
                                console.log('Start & End Time Format Invalid');
                                validateData++;
                            }
                        } else {
                            console.log('DAY value Invalid');
                            validateData++;
                        }
                    }



                    if (validateData == 0) { //NO ERROR IN RESTAURANT TIME JSON FORMAT
                        // console.log('validateData', validateData);
                        // console.log(restaurantTimeValArr);

                        var updateVendor = {
                            isActive: true
                        }

                        var vendorTimeArray = [];

                        vandorTimeSchema.insertMany(restaurantTimeValArr, function (err, result) {
                            if (err) {
                                console.log(err);
                                callBack({
                                    success: false,
                                    STATUSCODE: 500,
                                    message: 'Internal DB error',
                                    response_data: {}
                                });
                            } else {
                                if (result) {
                                    for (let resultVal of result) {
                                        vendorTimeArray.push(resultVal._id);
                                    }
                                    updateVendor.vendorOpenCloseTime = vendorTimeArray;
                                }

                                vendorSchema.update({ _id: reqBody.vendorId }, {
                                    $set: updateVendor
                                }, function (err, res) {
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
                                            message: 'Vendor time data added succsessfully.',
                                            response_data: {}
                                        });
                                    }
                                });
                            }

                        });






                    } else {
                        callBack({
                            success: false,
                            STATUSCODE: 422,
                            message: 'Invalid Restaurant time format.',
                            response_data: {}
                        });
                    }
                    // console.log(validateData);
                } else {
                    callBack({
                        success: false,
                        STATUSCODE: 422,
                        message: 'Restaurant time required.',
                        response_data: {}
                    });
                }

            } else {
                callBack({
                    success: false,
                    STATUSCODE: 422,
                    message: 'Invalid Restaurant time format.',
                    response_data: {}
                });
            }

            // console.log(JSON.parse(reqBody.restaurantTime));

        }
    },
    //Vendor Owner Add 
    vendorOwnerRegister: async (data, callBack) => {
        if (data) {

            /** Check for customer existence */
            vendorOwnerSchema.countDocuments({ email: data.email }).exec(function (err, count) {
                if (err) {
                    console.log(err);
                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Internal DB error',
                        response_data: {}
                    });
                } else {
                    if (count) {
                        callBack({
                            success: false,
                            STATUSCODE: 422,
                            message: 'User already exists for this email',
                            response_data: {}
                        });
                    } else {
                        vendorOwnerSchema.countDocuments({ phone: data.phone }).exec(function (err, count) {
                            if (err) {
                                console.log(err);
                                callBack({
                                    success: false,
                                    STATUSCODE: 500,
                                    message: 'Internal DB error',
                                    response_data: {}
                                });

                            } if (count) {
                                callBack({
                                    success: false,
                                    STATUSCODE: 422,
                                    message: 'User already exists for this phone no.',
                                    response_data: {}
                                });
                            } else {
                                new vendorOwnerSchema(data).save(async function (err, result) {
                                    if (err) {
                                        console.log(err);
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
                                            message: 'Vendor Owner added Successfull',
                                            response_data: result
                                        })
                                    }
                                });
                            }
                        });

                    }
                }
            });
        }
    },
    //Item Add
    addItem: async (data, callBack) => {
        if (data) {
            var files = data.files;
            var reqBody = data.body;
            //console.log(reqBody);
            var itemExtra = reqBody.itemExtra;

            //CHECK if extra Item data is valid Json or not
            if (itemExtra == '') {
                var checkJson = true
            } else {
                var checkJson = await isJson(itemExtra);
            }


            if (checkJson == true) {
                if (itemExtra != '') {
                    var itemExtraObj = JSON.parse(itemExtra);
                } else {
                    var itemExtraObj = [];
                }


                //License Upload
                if (files.menuImage != undefined) {
                    var menuImage = await uploadvendorImage(files.menuImage, 'menuImage');
                }

                if (menuImage != 'error') {
                    var itemData = {
                        itemName: reqBody.itemName,
                        categoryId: reqBody.categoryId,
                        vendorId: reqBody.vendorId,
                        type: reqBody.type,
                        description: reqBody.description,
                        ingredients: reqBody.ingredients,
                        recipe: reqBody.recipe,
                        price: reqBody.price,
                        waitingTime: reqBody.waitingTime,
                        menuImage: menuImage,
                        isActive: true,
                    };

                    new ItemSchema(itemData).save(async function (err, result) {
                        if (err) {
                            console.log(err);
                            callBack({
                                success: false,
                                STATUSCODE: 500,
                                message: 'Internal DB error',
                                response_data: {}
                            });
                        } else {
                            if (itemExtraObj.length > 0) {
                                var validateJson = 0;
                                var itemExtraArr = [];
                                for (let itemExtraObjVal of itemExtraObj) {
                                    console.log(itemExtraObjVal);
                                    var itemExtraName = itemExtraObjVal.name;
                                    var itemExtraPrice = itemExtraObjVal.price;
                                    if ((itemExtraName != undefined) && (itemExtraPrice != undefined)) {
                                        if ((isNaN(itemExtraName)) && (!isNaN(itemExtraPrice))) {
                                            var itemObj = {
                                                itemId: result._id,
                                                itemName: itemExtraName,
                                                description: '',
                                                ingredients: '',
                                                recipe: '',
                                                price: itemExtraPrice,
                                                isActive: true
                                            }
                                            itemExtraArr.push(itemObj);
                                        } else {
                                            console.log('Extra Item name should be string and price should be number');
                                            validateJson++;
                                        }

                                    } else {
                                        console.log('Extra Item name and price required');
                                        validateJson++;
                                    }
                                }

                                if (validateJson == 0) {
                                    console.log('extra', itemExtraArr);
                                    ItemExtraSchema.insertMany(itemExtraArr, function (err, result) {
                                        if (err) {
                                            console.log(err);
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
                                                message: 'Item added Successfull',
                                                response_data: result
                                            })
                                        }
                                    });

                                } else {
                                    callBack({
                                        success: false,
                                        STATUSCODE: 422,
                                        message: 'Invalid Item extra value.',
                                        response_data: {}
                                    });
                                }
                            } else {
                                callBack({
                                    success: true,
                                    STATUSCODE: 200,
                                    message: 'Item added Successfull',
                                    response_data: result
                                })
                            }

                        }
                    });
                } else {
                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Menu image upload failed.',
                        response_data: {}
                    });
                }
            } else {
                callBack({
                    success: false,
                    STATUSCODE: 422,
                    message: 'Invalid Item extra value.',
                    response_data: {}
                });
            }

        }
    }
}

//Vendor Related Image uplaod
function uploadvendorImage(file, name) {
    return new Promise(function (resolve, reject) {

        //Get image extension
        var ext = getExtension(file.name);

        // The name of the input field (i.e. "image") is used to retrieve the uploaded file
        let sampleFile = file;

        var file_name = `${name}-${Math.floor(Math.random() * 1000)}-${Math.floor(Date.now() / 1000)}.${ext}`;

        // Use the mv() method to place the file somewhere on your server
        sampleFile.mv(`public/img/vendor/${file_name}`, function (err) {
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

function isJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

function generatePassword() {
    var length = 8,
        charset = "abcdefghijklmnop1234567890qrstuvwxyzABCDEFGH1234567890IJKLMNOPQRSTUVWXYZ0123456789",
        retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}
