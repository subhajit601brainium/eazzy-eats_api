var vendorSchema = require('../../schema/Vendor');
var vendorTypesSchema = require('../../schema/VendorType');
var vendorOwnerSchema = require('../../schema/VendorOwner');
var bannerSchema = require('../../schema/Banner');
var categorySchema = require('../../schema/Category');
var vandorTimeSchema = require('../../schema/VendorOpenCloseTime');
var userDeviceLoginSchema = require('../../schema/UserDeviceLogin');
var userNotificationSettingSchema = require('../../schema/UserNotificationSetting');
var ItemSchema = require('../../schema/Item');
var ItemExtraSchema = require('../../schema/ItemExtra');
var ItemOptionSchema = require('../../schema/ItemOption');
var vendorReviewSchema = require('../../schema/VendorReview');
const config = require('../../config');
const mail = require('../../modules/sendEmail');
var bcrypt = require('bcryptjs');
const UserNotificationSchema = require('../../schema/UserNotification');

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

                        if (files == null) {
                            var logoInfo = '';
                            var detailsInfo = ''

                        } else {
                            if ((files.logo != undefined) && (files.logo != '')) {
                                //Image Upload
                                var logoInfo = await uploadvendorImage(files.logo, 'logo');
                            } else {
                                var logoInfo = ''
                            }


                            if ((files.banner != undefined) && (files.banner != '')) {
                                var detailsInfo = await uploadvendorImage(files.banner, 'detailsbanner');
                            } else {
                                var detailsInfo = ''
                            }
                        }








                        if ((logoInfo != 'error') && (detailsInfo != 'error')) {
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
                                countryCode: reqBody.countryCode,
                                contactPhone: reqBody.restaurantPhone,
                                description: reqBody.description,
                                logo: logoInfo,
                                banner: detailsInfo,
                                licenceImage: '',
                                address: reqBody.location,
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
                                    var vendorId = result._id;
                                    var ownerPassword = generatePassword();
                                    var vendorOwner = {
                                        vendorId: vendorId,
                                        fullName: reqBody.managerName,
                                        email: reqBody.restaurantEmail,
                                        password: reqBody.password,
                                        phone: reqBody.restaurantPhone,
                                        location: '',
                                        isActive: true
                                    }
                                    //VENDOR OWNER ADD
                                    new vendorOwnerSchema(vendorOwner).save(async function (err, user) {
                                        if (err) {
                                            console.log(err);
                                            callBack({
                                                success: false,
                                                STATUSCODE: 500,
                                                message: 'Internal DB error',
                                                response_data: {}
                                            });
                                        } else {
                                            //ADD DATA IN USER LOGIN DEVICE TABLE
                                            var userDeviceData = {
                                                userId: user._id,
                                                userType: 'VENDOR',
                                                appType: reqBody.appType,
                                                pushMode: reqBody.pushMode,
                                                deviceToken: reqBody.deviceToken
                                            }
                                            new userDeviceLoginSchema(userDeviceData).save(async function (err, success) {
                                                if (err) {
                                                    console.log(err);
                                                    nextCb(null, {
                                                        success: false,
                                                        STATUSCODE: 500,
                                                        message: 'Internal DB error',
                                                        response_data: {}
                                                    });
                                                } else {
                                                    callBack({
                                                        success: true,
                                                        STATUSCODE: 200,
                                                        message: 'Vendor related information added successfully',
                                                        response_data: result
                                                    });
                                                }
                                            });
                                        }
                                    });
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

                }
            });
        }
    },
    //Vendor Types 
    vendorTypes: async (data, callBack) => {
        if (data) {
            var reqBody = data.body;


            // ItemSchema.update({"_id": {$ne: "5714ce0a4514ef3ef68677fd"}},
            // { $set: {categoryId: '5ef0af18e7a01e39380d346b'} },
            // { multi: true }, function (err, res) {
            //     if (err) {
            //         callBack({
            //             success: false,
            //             STATUSCODE: 500,
            //             message: 'Internal DB error',
            //             response_data: {}
            //         });
            //     } else {
            //         console.log(res);
            //         callBack({
            //             success: true,
            //             STATUSCODE: 200,
            //             message: 'Vendor time data added succsessfully.',
            //             response_data: {}
            //         });
            //     }
            // });

            // return;

            // var vendorTypesArr = ["African: Nigeria","African: Other",
            //     "Alcohol",
            //     "American",
            //     "Argentinian",
            //     "Asian",
            //     "Bakery",
            //     "Bar/Pub Food",
            //     "BBQ & Grill",
            //     "Breakfast & Brunch",
            //     "Burgers",
            //     "Caribbean",
            //     "Chicken",
            //     "Chinese",
            //     "Coffee & Tea",
            //     "Comfort Food",
            //     "Continental",
            //     "European",
            //     "Fish and Chips",
            //     "Halal",
            //     "Healthy",
            //     "Ice Cream & Frozen Yogurt",
            //     "Juice & Smoothies",
            //     "Pizza",
            //     "Salad / Sandwiches",
            //     "Seafood",
            //     "Snacks",
            //     "Steakhouse",
            //     "Thai",
            //     "Vegetarian / Vegan",
            //     "Wings"]
            // var vendrTypesObjArr = [];
            //     for(let vendorType of vendorTypesArr) {
            //         var vendorTypesObj = {
            //             categoryName: vendorType,
            //             image: ''
            //         }

            //         vendrTypesObjArr.push(vendorTypesObj);
            //     }

            // categorySchema.insertMany(vendrTypesObjArr, function (err, result) {
            //     if (err) {
            //         console.log(err);
            //         callBack({
            //             success: false,
            //             STATUSCODE: 500,
            //             message: 'Internal DB error',
            //             response_data: {}
            //         });
            //     } else {
            //         if (result) {
            //             console.log(result);
            //         }
            //     }
            // });

            vendorTypesSchema
                .find({ isActive: true })
                .then((vendorTypes) => {
                    callBack({
                        success: true,
                        STATUSCODE: 200,
                        message: 'All vendor  types',
                        response_data: { vendorTypes: vendorTypes }
                    });
                })
                .catch((err) => {
                    console.log(err);
                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Internal DB error',
                        response_data: {}
                    });

                })



        }
    },
    //Vendor Time Add 
    addVendorTime: async (data, callBack) => {
        if (data) {
            // var files = data.files;
            //   var reqBody = data.body;
            // console.log(reqBody);
            // return;
            var files = data.files;
            var reqBody = data.body;

            var validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            var validZone = ['AM', 'PM'];
            console.log(reqBody);
            var restaurantTime = reqBody.restaurantTime;

            if (typeof restaurantTime == 'string') {
                restaurantTimeObj = JSON.parse(restaurantTime);
            } else {
                restaurantTimeObj = restaurantTime;
            }



            //CHECK if Restaurant Time data is valid Json or not
            var checkJson = true;


            if (checkJson == true) {

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

                        var licenseInfo = await uploadvendorImage(files.licenceImage, 'licence');

                        if ((licenseInfo != 'error')) {

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
                                        updateVendor.licenceImage = licenseInfo;
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
                                STATUSCODE: 500,
                                message: 'Internal error, Something went wrong.',
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

            var itemExtra = reqBody.itemExtra;

            //CHECK if extra Item data is valid Json or not
            if (itemExtra == '') {
                var checkJson = true
            } else {
                var checkJson = await isJson(itemExtra);
            }

            var itemOption = reqBody.itemOption;

            //CHECK if extra Item data is valid Json or not
            if (itemOption == '') {
                var checkJsonOption = true
            } else {
                var checkJsonOption = await isJson(itemOption);
            }


            if ((checkJson == true) && (checkJsonOption == true)) {
                if (itemExtra != '') {
                    var itemExtraObj = JSON.parse(itemExtra);
                } else {
                    var itemExtraObj = [];
                }

                if (itemOption != '') {
                    var itemOptionObj = JSON.parse(itemOption);
                } else {
                    var itemOptionObj = [];
                }

                //License Upload
                if (files.menuImage != undefined) {
                    var menuImage = await uploadvendorImage(files.menuImage, 'menuImage');
                }

                if (menuImage != 'error') {

                    var itemprice = parseInt(reqBody.price).toFixed(2);

                    if (reqBody.validityFrom == '') {
                        var validityFrom = ''
                        var validityTo = ''
                    } else {
                        var validityFrom = createDateFormat(reqBody.validityFrom)
                        var validityTo = createDateFormat(reqBody.validityTo)
                    }
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
                        itemOptions: itemOptionObj,
                        discountType: reqBody.discountType,
                        discountAmount: reqBody.discountAmount,
                        validityFrom: validityFrom,
                        validityTo: validityTo,
                        isActive: true,
                    };

                    console.log(itemData);

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
                            //Item Extra Add
                            var itemOptnsArr = [];
                            if (itemOptionObj.length > 0) {
                                for (let itemOptions of itemOptionObj) {
                                    var itmOptions = {};
                                    itmOptions.itemId = result._id;
                                    itmOptions.headerName = itemOptions.optionTitle;
                                    itmOptions.isActive = itemOptions.isActive;
                                    itmOptions.itemOptions = itemOptions.arrOptions;

                                    itemOptnsArr.push(itmOptions);
                                }
                            }
                            //Item Extra Add

                            if (itemOptnsArr.length > 0) {
                                ItemOptionSchema.insertMany(itemOptnsArr);
                            }


                            if (itemExtraObj.length > 0) {
                                var validateJson = 0;
                                var itemExtraArr = [];
                                for (let itemExtraObjVal of itemExtraObj) {
                                    console.log(itemExtraObjVal);
                                    var itemExtraName = itemExtraObjVal.name;
                                    var itemExtraPrice = itemExtraObjVal.price;
                                    var itemExtraStatus = itemExtraObjVal.isActive;

                                    if ((itemExtraStatus == undefined) || (itemExtraStatus == '')) {
                                        itemExtraStatus = false;
                                    }
                                    if ((itemExtraName != undefined) && (itemExtraPrice != undefined)) {
                                        if ((isNaN(itemExtraName)) && (!isNaN(itemExtraPrice))) {
                                            var itemObj = {
                                                itemId: result._id,
                                                itemName: itemExtraName,
                                                description: '',
                                                ingredients: '',
                                                recipe: '',
                                                price: itemExtraPrice,
                                                isActive: itemExtraStatus
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
                                                response_data: {}
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
                                    response_data: {}
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
    },
    //Item Get
    getItem: async (data, callBack) => {
        if (data) {
            var files = data.files;
            var reqBody = data.body;

            var vendorId = reqBody.vendorId;
            var itemId = reqBody.itemId;

            var itemCond = { vendorId: vendorId }
            itemCond._id = itemId;


            ItemSchema
                .findOne(itemCond)
                .then(async (item) => {
                    var allItems = [];
                    if (item != null) {

                        var extraitem = await ItemExtraSchema.find({ itemId: itemId }, { _id: 1, itemName: 1, price: 1, isActive: 1 });


                        if (item.validityFrom != null) {
                            var validityFrom = listDateFormat(item.validityFrom);
                            var validityTo = listDateFormat(item.validityTo);
                        } else {
                            var validityFrom = '';
                            var validityTo = '';
                        }
                        var itemsObj = {
                            itemName: item.itemName,
                            categoryId: item.categoryId,
                            vendorId: item.vendorId,
                            type: item.type,
                            description: item.description,
                            ingredients: item.ingredients,
                            recipe: item.recipe,
                            price: item.price,
                            waitingTime: item.waitingTime,
                            menuImage: item.menuImage,
                            itemOptions: item.itemOptions,
                            discountType: item.discountType,
                            discountAmount: item.discountAmount,
                            validityFrom: validityFrom,
                            validityTo: validityTo,
                            isActive: item.isActive,
                            imageUrl: `${config.serverhost}:${config.port}/img/vendor/`,
                            _id: item._id,
                        }

                        itemsObj.itemExtra = extraitem;


                    }
                    callBack({
                        success: true,
                        STATUSCODE: 200,
                        message: 'Item list.',
                        response_data: { item: itemsObj }
                    });
                })
                .catch((err) => {
                    console.log(err);
                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Something went wrong.',
                        response_data: {}
                    });
                });


        }
    },
    //Item Get Options
    getItemOptions: async (data, callBack) => {
        if (data) {

            var reqBody = data.body;

            var vendorId = reqBody.vendorId;

            var itemCond = { vendorId: vendorId }


            ItemSchema
                .find(itemCond)
                .then(async (items) => {
                    var itemsArr = [];
                    if (items.length > 0) {
                        for (let item of items) {
                            var itemId = item._id;
                            var itemId = itemId.toString();

                            itemsArr.push(itemId);
                        }
                        // console.log(itemsArr);
                    }

                    if (itemsArr.length > 0) {
                        ItemOptionSchema.find({ itemId: { $in: itemsArr } })
                            .then((itemOptions) => {
                                if (itemOptions.length > 0) {
                                    var itemOptionsNameArr = [];
                                    for (itemOption of itemOptions) {

                                        var itmOp = itemOption.itemOptions;
                                        if (itmOp.length > 0) {
                                            for (let itmOptn of itmOp) {
                                                itemOptionsNameArr.push(itmOptn.name);

                                            }
                                        }



                                    }
                                    var itemOptionsNameArrunique = itemOptionsNameArr.filter(onlyUnique);

                                    var optionMainArr = [];
                                    if (itemOptionsNameArrunique.length > 0) {

                                        for (let itemOptionsNameArruniq of itemOptionsNameArrunique) {
                                            var optionMainObj = {
                                                name: itemOptionsNameArruniq
                                            };

                                            optionMainArr.push(optionMainObj);

                                        }
                                        console.log(optionMainArr);
                                    }
                                }


                                callBack({
                                    success: true,
                                    STATUSCODE: 200,
                                    message: 'Unique Options data.',
                                    response_data: { options: optionMainArr }
                                });

                            })
                            .catch((err) => {
                                console.log(err);
                                callBack({
                                    success: false,
                                    STATUSCODE: 500,
                                    message: 'Something went wrong.',
                                    response_data: {}
                                });
                            })
                    }



                })
                .catch((err) => {
                    console.log(err);
                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Something went wrong.',
                        response_data: {}
                    });
                });


        }
    },
    //Item Get Extra
    getItemExtraName: async (data, callBack) => {
        if (data) {

            var reqBody = data.body;

            var vendorId = reqBody.vendorId;

            var itemCond = { vendorId: vendorId }


            ItemSchema
                .find(itemCond)
                .then(async (items) => {
                    var itemsArr = [];
                    if (items.length > 0) {
                        for (let item of items) {
                            var itemId = item._id;
                            var itemId = itemId.toString();

                            itemsArr.push(itemId);
                        }
                        // console.log(itemsArr);
                    }

                    if (itemsArr.length > 0) {
                        ItemExtraSchema.find({ itemId: { $in: itemsArr } })
                            .then((itemExtras) => {
                                if (itemExtras.length > 0) {
                                    var itemExtrasNameArr = [];
                                    for (itemExtra of itemExtras) {
                                        itemExtrasNameArr.push(itemExtra.itemName);
                                    }
                                    var itemExtrasNameArrunique = itemExtrasNameArr.filter(onlyUnique);

                                    var optionMainArr = [];
                                    if (itemExtrasNameArrunique.length > 0) {

                                        for (let itemOptionsNameArruniq of itemExtrasNameArrunique) {
                                            var optionMainObj = {
                                                name: itemOptionsNameArruniq
                                            };

                                            optionMainArr.push(optionMainObj);

                                        }
                                        console.log(optionMainArr);
                                    }
                                }


                                callBack({
                                    success: true,
                                    STATUSCODE: 200,
                                    message: 'Unique Extra data.',
                                    response_data: { extras: optionMainArr }
                                });

                            })
                            .catch((err) => {
                                console.log(err);
                                callBack({
                                    success: false,
                                    STATUSCODE: 500,
                                    message: 'Something went wrong.',
                                    response_data: {}
                                });
                            })
                    }



                })
                .catch((err) => {
                    console.log(err);
                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Something went wrong.',
                        response_data: {}
                    });
                });


        }
    },

    updateItem: async (data, callBack) => {
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

            var itemOption = reqBody.itemOption;

            //CHECK if extra Item data is valid Json or not
            if (itemOption == '') {
                var checkJsonOption = true
            } else {
                var checkJsonOption = await isJson(itemOption);
            }


            if ((checkJson == true) && (checkJsonOption == true)) {
                if (itemExtra != '') {
                    var itemExtraObj = JSON.parse(itemExtra);
                } else {
                    var itemExtraObj = [];
                }

                if (itemOption != '') {
                    var itemOptionObj = JSON.parse(itemOption);
                } else {
                    var itemOptionObj = [];
                }

                //License Upload
                if (files.menuImage != undefined) {
                    var menuImage = await uploadvendorImage(files.menuImage, 'menuImage');
                }

                if (menuImage != 'error') {

                    if (reqBody.validityFrom == '') {
                        var validityFrom = ''
                        var validityTo = ''
                    } else {
                        var validityFrom = createDateFormat(reqBody.validityFrom)
                        var validityTo = createDateFormat(reqBody.validityTo)
                    }

                    var itemprice = parseInt(reqBody.price).toFixed(2);
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
                        itemOptions: itemOptionObj,
                        discountType: reqBody.discountType,
                        discountAmount: reqBody.discountAmount,
                        validityFrom: validityFrom,
                        validityTo: validityTo,
                        isActive: true,
                    };



                    ItemSchema.update({ _id: reqBody.itemId }, {
                        $set: itemData
                    }, async function (err, result) {
                        if (err) {
                            console.log(err);
                            callBack({
                                success: false,
                                STATUSCODE: 500,
                                message: 'Internal DB error',
                                response_data: {}
                            });
                        } else {
                            //Item Extra Add
                            var itemOptnsArr = [];
                            if (itemOptionObj.length > 0) {
                                for (let itemOptions of itemOptionObj) {
                                    var itmOptions = {};
                                    itmOptions.itemId = reqBody.itemId;
                                    itmOptions.headerName = itemOptions.optionTitle;
                                    itmOptions.isActive = itemOptions.isActive;
                                    itmOptions.itemOptions = itemOptions.arrOptions;

                                    itemOptnsArr.push(itmOptions);
                                }
                            }
                            //Item Extra Add

                            await ItemOptionSchema.deleteMany({ itemId: reqBody.itemId });
                            if (itemOptnsArr.length > 0) {
                                ItemOptionSchema.insertMany(itemOptnsArr);
                            }
                            if (itemExtraObj.length > 0) {
                                var validateJson = 0;
                                var itemExtraArr = [];
                                for (let itemExtraObjVal of itemExtraObj) {
                                    console.log(itemExtraObjVal);
                                    var itemExtraName = itemExtraObjVal.name;
                                    var itemExtraPrice = itemExtraObjVal.price;
                                    var itemExtraStatus = itemExtraObjVal.isActive;

                                    if ((itemExtraStatus == undefined) || (itemExtraStatus == '')) {
                                        itemExtraStatus = false;
                                    }
                                    if ((itemExtraName != undefined) && (itemExtraPrice != undefined)) {
                                        if ((isNaN(itemExtraName)) && (!isNaN(itemExtraPrice))) {
                                            var itemObj = {
                                                itemId: reqBody.itemId,
                                                itemName: itemExtraName,
                                                description: '',
                                                ingredients: '',
                                                recipe: '',
                                                price: itemExtraPrice,
                                                isActive: itemExtraStatus
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

                                    ItemExtraSchema.deleteMany({ itemId: reqBody.itemId }, function (err) {
                                        if (err) console.log(err);


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
                                                    message: 'Item updated Successfull',
                                                    response_data: {}
                                                })
                                            }
                                        });
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
                                    message: 'Item updated Successfull',
                                    response_data: {}
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
    },
    //Item Update status
    updateItemStatus: async (data, callBack) => {
        if (data) {
            var reqBody = data.body;
            //console.log(reqBody);
            var isActive = reqBody.isActive;

            var itemData = {
                isActive: isActive,
            };

            console.log(itemData);

            ItemSchema.update({ _id: reqBody.itemId }, {
                $set: itemData
            }, function (err, result) {
                if (err) {
                    console.log(err);
                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Internal DB error',
                        response_data: {}
                    });
                } else {
                    console.log(result);
                    if (result.nModified == 1) {
                        callBack({
                            success: true,
                            STATUSCODE: 200,
                            message: 'Item status updated Successfull',
                            response_data: {}
                        })
                    } else {
                        callBack({
                            success: false,
                            STATUSCODE: 500,
                            message: 'Something went wrong.',
                            response_data: {}
                        })
                    }

                }
            });
        }
    },
    //Item List
    itemList: async (data, callBack) => {
        if (data) {
            var reqBody = data.body;

            var vendorId = reqBody.vendorId;
            var categoryId = reqBody.categoryId;

            var itemCond = { vendorId: vendorId };

            if ((categoryId != undefined) && (categoryId != '')) {
                itemCond.categoryId = categoryId;
            }
            ItemSchema
                .find(itemCond)
                .then(async (items) => {
                    var categoryIds = [];
                    if (items.length > 0) {
                        for (let item of items) {
                            categoryIds.push(item.categoryId);

                        }
                    }

                    categorySchema.find({ _id: { $in: categoryIds } }, { _id: 1, categoryName: 1 })
                        .then(async (categories) => {
                            var itemsArr = [];
                            var categoryArr = [];
                            if (categories.length > 0) {
                                for (let category of categories) {
                                    var catitemList = {};
                                    var catListObj = {};
                                    catitemList.category = category;
                                    var catItem = await ItemSchema.find({ vendorId: vendorId, categoryId: category._id });


                                    var itemsArra = [];
                                    if (catItem.length > 0) {
                                        for (let itmcat of catItem) {

                                            if (itmcat.validityFrom != null) {
                                                var validityFrom = listDateFormat(itmcat.validityFrom);
                                                var validityTo = listDateFormat(itmcat.validityTo);
                                            } else {
                                                var validityFrom = '';
                                                var validityTo = '';
                                            }
                                            var itemObj = {};
                                            itemObj.isActive = itmcat.isActive;
                                            itemObj._id = itmcat._id;
                                            itemObj.itemName = itmcat.itemName;
                                            itemObj.categoryId = itmcat.categoryId;
                                            itemObj.vendorId = itmcat.vendorId;
                                            itemObj.type = itmcat.type;
                                            itemObj.price = itmcat.price;
                                            itemObj.waitingTime = itmcat.waitingTime;
                                            itemObj.menuImage = itmcat.menuImage;
                                            itemObj.imageUrl = `${config.serverhost}:${config.port}/img/vendor/`;
                                            itemObj.itemOptions = itmcat.itemOptions;
                                            itemObj.discountType = itmcat.discountType;
                                            itemObj.discountAmount = itmcat.discountAmount;
                                            itemObj.validityFrom = validityFrom;
                                            itemObj.validityTo = validityTo;
                                            itemObj.createdAt = itmcat.createdAt;
                                            itemObj.updatedAt = itmcat.updatedAt;
                                            var extraitem = await ItemExtraSchema.find({ itemId: itmcat._id }, { _id: 1, itemName: 1, price: 1, isActive: 1 });

                                            itemObj.itemExtras = extraitem;

                                            itemsArra.push(itemObj);
                                        }
                                    }

                                    catitemList.items = itemsArra;


                                    catListObj.categoryName = category.categoryName;
                                    catListObj._id = category._id;
                                    catListObj.inItemCount = catItem.length;

                                    itemsArr.push(catitemList);
                                    categoryArr.push(catListObj);
                                }
                            }

                            callBack({
                                success: true,
                                STATUSCODE: 200,
                                message: 'Item list.',
                                response_data: { categoryList: categoryArr, itemlist: itemsArr }
                            });

                        })
                        .catch((err) => {
                            console.log(err);
                            callBack({
                                success: false,
                                STATUSCODE: 500,
                                message: 'Something went wrong.',
                                response_data: {}
                            });
                        })

                })
                .catch((err) => {
                    console.log(err);
                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Something went wrong.',
                        response_data: {}
                    });
                });


        }
    },
    //Item delete
    deleteItem: async (data, callBack) => {
        if (data) {
            var reqBody = data.body;

            var vendorId = reqBody.vendorId;

            var itemId = reqBody.itemId;

            ItemSchema
                .findOne({ _id: itemId, vendorId: vendorId })
                .then(async (item) => {
                    if (item != null) {

                        ItemSchema.deleteOne({ _id: itemId }, async function (err) {
                            if (err) {
                                console.log(err);
                            }
                            await ItemOptionSchema.deleteMany({ itemId: itemId });
                            await ItemExtraSchema.deleteMany({ itemId: itemId });

                            callBack({
                                success: true,
                                STATUSCODE: 200,
                                message: 'Item deleted successfully.',
                                response_data: {}
                            });
                        });

                    }
                })
                .catch((err) => {
                    console.log(err);
                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Something went wrong.',
                        response_data: {}
                    });
                });


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
    },
    //Vendor Details 
    getVendorDetails: async (data, callBack) => {
        if (data) {
            var files = data.files;
            var reqBody = data.body;


            /** Check for vendor existence */
            vendorSchema.findOne({ _id: reqBody.vendorId })
                .populate('vendorOpenCloseTime')
                .then(function (results) {

                    //Open time
                    var vendorTimeArr = [];
                    var openTimeArr = [];
                    var closeTimeArr = [];

                    var vendorLatlong = {
                        vendorLat: results.location.coordinates[1],
                        vendorLong: results.location.coordinates[0]
                    }


                    if (results.vendorOpenCloseTime.length > 0) {
                        if (results.vendorOpenCloseTime.length == 7) {
                            var everydayCheck = 1;
                        } else {
                            var everydayCheck = 0;
                        }


                        for (let vendorTime of results.vendorOpenCloseTime) {
                            var vendorTimeObj = {};
                            //  console.log(vendorTime);
                            if (everydayCheck == 1) {

                                openTimeArr.push(vendorTime.openTime);
                                closeTimeArr.push(vendorTime.closeTime);
                            }
                            //OPEN TIME CALCULATION
                            var openTimeAMPM = '';
                            var openTimeHours = '';
                            var openTimeMin = '';
                            if (vendorTime.openTime < 720) {
                                var num = vendorTime.openTime;
                                openTimeAMPM = 'AM';
                            } else {
                                var num = (vendorTime.openTime - 720);
                                openTimeAMPM = 'PM';
                            }

                            var openHours = (num / 60);
                            var openrhours = Math.floor(openHours);
                            var openminutes = (openHours - openrhours) * 60;
                            var openrminutes = Math.round(openminutes);

                            openTimeHours = openrhours;
                            openTimeMin = openrminutes;

                            if (openTimeMin < 10) {
                                openTimeMin = `${openTimeMin}0`
                            }
                            console.log(openTimeMin);
                            //CLOSE TIME CALCULATION
                            var closeTimeAMPM = '';
                            var closeTimeHours = '';
                            var closeTimeMin = '';
                            if (vendorTime.closeTime < 720) {
                                var num = vendorTime.closeTime;
                                closeTimeAMPM = 'AM';
                            } else {
                                var num = (vendorTime.closeTime - 720);
                                closeTimeAMPM = 'PM';
                            }

                            var closeHours = (num / 60);
                            var closerhours = Math.floor(closeHours);
                            var closeminutes = (closeHours - closerhours) * 60;
                            var closerminutes = Math.round(closeminutes);

                            closeTimeHours = closerhours;
                            closeTimeMin = closerminutes;

                            if (closeTimeMin < 10) {
                                closeTimeMin = `${closeTimeMin}0`
                            }

                            vendorTimeObj.day = vendorTime.day;
                            vendorTimeObj.openTime = `${openTimeHours}:${openTimeMin} ${openTimeAMPM}`
                            vendorTimeObj.closeTime = `${closeTimeHours}:${closeTimeMin} ${closeTimeAMPM}`
                            vendorTimeObj.isActive = vendorTime.isActive;

                            vendorTimeArr.push(vendorTimeObj);
                        }
                    }

                    callBack({
                        success: true,
                        STATUSCODE: 200,
                        message: 'Restaurant profile view.',
                        response_data: { vendorTime: vendorTimeArr, vendorLatlong: vendorLatlong, vendor: results, imageUrl: `${config.serverhost}:${config.port}/img/vendor/` }
                    });

                })
                .catch(function (err) {
                    console.log(err);
                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Internal DB error',
                        response_data: {}
                    });
                });
            // , async function (err, respons) {
            // if (err) {
            //     console.log(err);
            //     callBack({
            //         success: false,
            //         STATUSCODE: 500,
            //         message: 'Internal DB error',
            //         response_data: {}
            //     });
            // } else {



            // }

        }
    },
    //Vendor Reviews 
    getVendorReviews: async (data, callBack) => {
        if (data) {
            var reqBody = data.body;


            /** Check for vendor existence */
            vendorReviewSchema.find({ vendorId: reqBody.vendorId })
                .then(function (reviews) {
                    var reviewsArr = [];
                    if (reviews.length > 0) {
                        for (let review of reviews) {
                            var reviewsObj = {
                                customerName: review.customerName,
                                comment: review.comment,
                                customerRating: review.customerRating,
                                reviewId: review._id
                            }

                            reviewsArr.push(reviewsObj);
                        }
                    }


                    callBack({
                        success: true,
                        STATUSCODE: 200,
                        message: 'Restaurant reviews.',
                        response_data: { reviews: reviewsArr }
                    });

                })
                .catch(function (err) {
                    console.log(err);
                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Internal DB error',
                        response_data: {}
                    });
                });
            // , async function (err, respons) {
            // if (err) {
            //     console.log(err);
            //     callBack({
            //         success: false,
            //         STATUSCODE: 500,
            //         message: 'Internal DB error',
            //         response_data: {}
            //     });
            // } else {



            // }

        }
    },
    //Update Vendor Reviews 
    updateVendorReviews: async (data, callBack) => {
        if (data) {
            var reqBody = data.body;

            var reviewReply = reqBody.reply;


            /** Check for vendor existence */
            vendorReviewSchema.findOne({ vendorId: reqBody.vendorId, _id: reqBody.reviewId })
                .then(function (review) {

                    var comment = review.comment;
                    var restauratReply = {
                        restaurant: reviewReply
                    }

                    let mergedComment = { ...comment, ...restauratReply };

                    console.log(mergedComment);

                    var updateVendorComment = {
                        comment: mergedComment
                    }

                    vendorReviewSchema.update({ _id: review._id }, {
                        $set: updateVendorComment
                    }, function (err, res) {
                        if (err) {
                            callBack({
                                success: false,
                                STATUSCODE: 500,
                                message: 'Internal DB error',
                                response_data: {}
                            });
                        } else {
                            console.log(res);
                            callBack({
                                success: true,
                                STATUSCODE: 200,
                                message: 'Vendor review updated succsessfully.',
                                response_data: {}
                            });
                        }

                    })

                    // callBack({
                    //     success: true,
                    //     STATUSCODE: 200,
                    //     message: 'Restaurant reviews.',
                    //     response_data: { reviews: reviewsArr }
                    // });

                })
                .catch(function (err) {
                    console.log(err);
                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Internal DB error',
                        response_data: {}
                    });
                });


        }
    },
    //Vendor Details Update
    updateVendorDetails: async (data, callBack) => {
        if (data) {
            var files = data.files;
            var reqBody = data.body;

            var updateVendor = {
                restaurantName: reqBody.restaurantName,
                managerName: reqBody.managerName,
                restaurantType: reqBody.restaurantType
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
                        message: 'Vendor data updated succsessfully.',
                        response_data: {}
                    });
                }
            });



        }
    },
    //Vendor Time Update 
    updateVendorTime: async (data, callBack) => {
        if (data) {
            // var files = data.files;
            //   var reqBody = data.body;
            // console.log(reqBody);
            // return;
            var files = data.files;
            var reqBody = data.body;

            var validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            var validZone = ['AM', 'PM'];
            var restaurantTime = reqBody.restaurantTime;

            var restaurantClose = reqBody.restaurantClose;

            //CHECK if Restaurant Time data is valid Json or not
            var checkJson = await isJson(restaurantTime);


            if (checkJson == true) {
                console.log(restaurantClose);
                if ((restaurantClose == true) || (restaurantClose == 'true')) {

                    var updateVendor = {
                        isActive: true,
                        preOrder: reqBody.preOrder,
                        restaurantClose: reqBody.restaurantClose
                    }

                    updateVendor.address = reqBody.location,
                        updateVendor.location = {
                            type: 'Point',
                            coordinates: [reqBody.longitude, reqBody.latitude]
                        }

                    await vandorTimeSchema.deleteMany({ vendorId: reqBody.vendorId });

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


                } else {
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
                                isActive: true,
                                preOrder: reqBody.preOrder,
                                restaurantClose: reqBody.restaurantClose
                            }

                            vandorTimeSchema.deleteMany({ vendorId: reqBody.vendorId }, function (err) {
                                if (err) console.log(err);

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
                                            updateVendor.address = reqBody.location,
                                                updateVendor.location = {
                                                    type: 'Point',
                                                    coordinates: [reqBody.longitude, reqBody.latitude]
                                                }
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
    //verify User Before Changing Email/Phone
    verifyUser: async (data, callBack) => {
        if (data) {
            var reqBody = data.body;


            vendorSchema
                .findOne({ _id: reqBody.vendorId })
                .then((vendorres) => {
                    if (vendorres != null) {

                        let forgotPasswordOtp = Math.random().toString().replace('0.', '').substr(0, 6);
                        customer = {};
                        customer.forgotPasswordOtp = forgotPasswordOtp;
                        try {
                            mail('verifyUserlMail')(vendorres.contactEmail, customer).send();
                            callBack({
                                success: false,
                                STATUSCODE: 200,
                                message: 'Please check your email. We have sent a code to be used to reset password.',
                                response_data: {
                                    email: customer.contactEmail,
                                    otp: forgotPasswordOtp
                                }
                            });
                        } catch (Error) {
                            console.log('Something went wrong while sending email');
                        }

                    } else {
                        callBack({
                            success: false,
                            STATUSCODE: 422,
                            message: 'User not found.',
                            response_data: {}
                        });
                    }
                })
                .catch((err) => {
                    console.log(err);
                    callBack({
                        success: false,
                        STATUSCODE: 400,
                        message: 'Something went wrong.',
                        response_data: {}
                    });
                });





        }
    },
    //Vendor Email Update
    updateVendorEmail: async (data, callBack) => {
        if (data) {
            var reqBody = data.body;

            var updateVendor = {
                contactEmail: reqBody.restaurantEmail,
            }

            vendorSchema
                .findOne({ contactEmail: reqBody.restaurantEmail })
                .then((vendorres) => {

                    if (vendorres == null) {
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
                                var vendorOwner = {
                                    email: reqBody.restaurantEmail,
                                }
                                vendorOwnerSchema.update({ vendorId: reqBody.vendorId }, {
                                    $set: vendorOwner
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
                                            message: 'Vendor email updated succsessfully.',
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
                            message: 'Email already exists.',
                            response_data: {}
                        });
                    }

                })
                .catch((err) => {
                    console.log(err);
                    callBack({
                        success: false,
                        STATUSCODE: 400,
                        message: 'Something went wrong.',
                        response_data: {}
                    });
                });





        }
    },
    //Vendor Phone Update
    updateVendorPhone: async (data, callBack) => {
        if (data) {
            var reqBody = data.body;

            var updateVendor = {
                countryCode: reqBody.countryCode,
                contactPhone: reqBody.restaurantPhone,
            }

            vendorSchema
                .findOne({ contactPhone: reqBody.restaurantPhone })
                .then((vendorres) => {

                    if (vendorres == null) {
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
                                var vendorOwner = {
                                    phone: reqBody.restaurantPhone,
                                }
                                vendorOwnerSchema.update({ vendorId: reqBody.vendorId }, {
                                    $set: vendorOwner
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
                                            message: 'Vendor phone updated succsessfully.',
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
                            message: 'Email already exists.',
                            response_data: {}
                        });
                    }

                })
                .catch((err) => {
                    console.log(err);
                    callBack({
                        success: false,
                        STATUSCODE: 400,
                        message: 'Something went wrong.',
                        response_data: {}
                    });
                });





        }
    },
    //Banner Upload
    bannerUpload: (data, callBack) => {
        if (data) {
            var files = data.files;
            vendorSchema.findOne({ _id: data.body.vendorId }, async function (err, result) {
                if (err) {
                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Internal DB error',
                        response_data: {}
                    });
                } else {
                    if (result) {
                        if (result.banner != '') {
                            var fs = require('fs');
                            var filePath = `public/img/vendor/${result.banner}`;
                            fs.unlink(filePath, (err) => { });
                        }

                        var detailsInfo = await uploadvendorImage(files.image, 'detailsbanner');
                        console.log(detailsInfo);
                        if (detailsInfo != 'error') {

                            vendorSchema.update({ _id: data.body.vendorId }, {
                                $set: { banner: detailsInfo }
                            }, function (err, result) {
                                console.log(result);
                                callBack({
                                    success: true,
                                    STATUSCODE: 200,
                                    message: 'Banner uploaded successfully.',
                                    response_data: {}
                                });

                            })

                        } else { //IF SOMEHOW LOGO UPLOAD FAILED
                            callBack({
                                success: false,
                                STATUSCODE: 500,
                                message: 'Internal error, Something went wrong.',
                                response_data: {}
                            });
                        }
                    }
                }
            });


        }
    },
    //Logo Upload
    logoUpload: (data, callBack) => {
        if (data) {
            var files = data.files;
            vendorSchema.findOne({ _id: data.body.vendorId }, async function (err, result) {
                if (err) {
                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Internal DB error',
                        response_data: {}
                    });
                } else {
                    if (result) {
                        if (result.logo != '') {
                            var fs = require('fs');
                            var filePath = `public/img/vendor/${result.logo}`;
                            fs.unlink(filePath, (err) => { });
                        }

                        var detailsInfo = await uploadvendorImage(files.image, 'logo');
                        console.log(detailsInfo);
                        if (detailsInfo != 'error') {

                            vendorSchema.update({ _id: data.body.vendorId }, {
                                $set: { logo: detailsInfo }
                            }, function (err, result) {
                                console.log(result);
                                callBack({
                                    success: true,
                                    STATUSCODE: 200,
                                    message: 'Logo uploaded successfully.',
                                    response_data: {}
                                });

                            })

                        } else { //IF SOMEHOW LOGO UPLOAD FAILED
                            callBack({
                                success: false,
                                STATUSCODE: 500,
                                message: 'Internal error, Something went wrong.',
                                response_data: {}
                            });
                        }
                    }
                }
            });


        }
    },
    //Licence Upload
    licenceUpload: (data, callBack) => {
        if (data) {
            var files = data.files;
            vendorSchema.findOne({ _id: data.body.vendorId }, async function (err, result) {
                if (err) {
                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Internal DB error',
                        response_data: {}
                    });
                } else {
                    if (result) {
                        if (result.licenceImage != '') {
                            var fs = require('fs');
                            var filePath = `public/img/vendor/${result.licenceImage}`;
                            fs.unlink(filePath, (err) => { });
                        }

                        var detailsInfo = await uploadvendorImage(files.image, 'licence');
                        console.log(detailsInfo);
                        if (detailsInfo != 'error') {

                            vendorSchema.update({ _id: data.body.vendorId }, {
                                $set: { licenceImage: detailsInfo }
                            }, function (err, result) {
                                console.log(result);
                                callBack({
                                    success: true,
                                    STATUSCODE: 200,
                                    message: 'Licence uploaded successfully.',
                                    response_data: {}
                                });

                            })

                        } else { //IF SOMEHOW LOGO UPLOAD FAILED
                            callBack({
                                success: false,
                                STATUSCODE: 500,
                                message: 'Internal error, Something went wrong.',
                                response_data: {}
                            });
                        }
                    }
                }
            });


        }
    },
    //Get Notification Settings
    getNotificationData: (data, callBack) => {
        if (data) {
            var reqBody = data.body;
            vendorOwnerSchema
                .findOne({ vendorId: reqBody.vendorId, _id: reqBody.customerId })
                .then(async (res) => {
                    if (res != null) {

                        userNotificationSettingSchema
                            .findOne({ userId: reqBody.customerId })
                            .then(async (usernotSetting) => {

                                if (usernotSetting == null) {
                                    usernotSettingData = { 'NewOrder': true, 'PreOrder': true, 'OrderNotification': true, 'OrderModification': true }
                                } else {
                                    usernotSettingData = usernotSetting.notificationData;

                                }
                                callBack({
                                    success: true,
                                    STATUSCODE: 200,
                                    message: 'User Notification',
                                    response_data: { usernotSetting: usernotSettingData }
                                });
                            })
                            .catch((err) => {
                                console.log(err);
                                callBack({
                                    success: false,
                                    STATUSCODE: 500,
                                    message: 'Internal DB error',
                                    response_data: {}
                                });
                            })




                    } else {
                        callBack({
                            success: false,
                            STATUSCODE: 500,
                            message: 'Internal DB error',
                            response_data: {}
                        });
                    }

                })
                .catch((err) => {
                    console.log(err);
                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Internal DB error',
                        response_data: {}
                    });
                })


        }
    },
    //Update Notification Settings
    updateNotificationData: (data, callBack) => {
        if (data) {
            var reqBody = data.body;

            var notificationData = reqBody.notificationData;

            if (typeof notificationData == 'string') {
                notificationDataObj = JSON.parse(notificationData);
            } else {
                notificationDataObj = notificationData;
            }
            vendorOwnerSchema
                .findOne({ vendorId: reqBody.vendorId, _id: reqBody.customerId })
                .then(async (res) => {
                    if (res != null) {

                        userNotificationSettingSchema
                            .findOne({ userId: reqBody.customerId })
                            .then(async (usernotSetting) => {

                                if (usernotSetting == null) {
                                    var addNotificationData = {
                                        userId: reqBody.customerId,
                                        userType: 'VENDOR',
                                        notificationData: notificationDataObj
                                    }

                                    new userNotificationSettingSchema(addNotificationData).save(async function (err, result) {
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
                                                message: 'User updated successfully',
                                                response_data: {}
                                            });
                                        }
                                    });
                                } else {
                                    var updateNotificationData = {
                                        notificationData: notificationDataObj
                                    }

                                    userNotificationSettingSchema.update({ userId: reqBody.customerId }, {
                                        $set: updateNotificationData
                                    }, function (err, result) {
                                        if (err) {
                                            console.log(err);
                                            callBack({
                                                success: false,
                                                STATUSCODE: 500,
                                                message: 'Internal DB error',
                                                response_data: {}
                                            });
                                        } else {
                                            if (result.nModified == 1) {
                                                callBack({
                                                    success: true,
                                                    STATUSCODE: 200,
                                                    message: 'User updated successfully',
                                                    response_data: {}
                                                });
                                            } else {
                                                callBack({
                                                    success: false,
                                                    STATUSCODE: 500,
                                                    message: 'Something went wrong.',
                                                    response_data: {}
                                                })
                                            }

                                        }
                                    });
                                }
                            })
                            .catch((err) => {
                                console.log(err);
                                callBack({
                                    success: false,
                                    STATUSCODE: 500,
                                    message: 'Internal DB error',
                                    response_data: {}
                                });
                            })




                    } else {
                        callBack({
                            success: false,
                            STATUSCODE: 500,
                            message: 'Internal DB error',
                            response_data: {}
                        });
                    }

                })
                .catch((err) => {
                    console.log(err);
                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Internal DB error',
                        response_data: {}
                    });
                })


        }
    },
    // Notification List
    notificationList: (data, callBack) => {
        if (data) {
            var reqBody = data.body;

            vendorOwnerSchema
                .findOne({ vendorId: reqBody.vendorId, _id: reqBody.customerId })
                .then(async (res) => {
                    if (res != null) {

                        UserNotificationSchema
                            .find({ userId: reqBody.vendorId })
                            .then(async (usernotifications) => {

                                

                                callBack({
                                    success: true,
                                    STATUSCODE: 200,
                                    message: 'userNotificatons',
                                    response_data: {notifications: usernotifications}
                                });
                            })
                            .catch((err) => {
                                console.log(err);
                                callBack({
                                    success: false,
                                    STATUSCODE: 500,
                                    message: 'Internal DB error',
                                    response_data: {}
                                });
                            })




                    } else {
                        callBack({
                            success: false,
                            STATUSCODE: 500,
                            message: 'Internal DB error',
                            response_data: {}
                        });
                    }

                })
                .catch((err) => {
                    console.log(err);
                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Internal DB error',
                        response_data: {}
                    });
                })


        }
    },
}

//Vendor Related Image uplaod
function uploadvendorImage(file, name) {
    return new Promise(function (resolve, reject) {
        console.log(file.name);
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

function createDateFormat(reqDate) {
    var date = reqDate;

    var monthsTOneArr = [1, 3, 5, 7, 8, 10, 12];

    var dateSpl = date.split("/");

    var month = dateSpl[1];
    var day = dateSpl[0];
    var year = dateSpl[2];


    var dateNew = new Date(`${month}-${day}-${year} 00:00:00`);
    console.log(day);
    console.log(dateNew);

    return dateNew;

}

function listDateFormat(date) {
    var dateFormatCheck = date;

    var day = dateFormatCheck.getDate();

    var month = (Number(dateFormatCheck.getMonth()) + 1);

    if (Number(month) < 10) {
        month = `0${month}`
    }

    var year = dateFormatCheck.getFullYear();

    var dateformat = `${year}/${month}/${day}`;

    return dateformat;
}


function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

