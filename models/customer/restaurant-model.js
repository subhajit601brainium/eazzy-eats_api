var vendorSchema = require('../../schema/Vendor');
var vendorFavouriteSchema = require('../../schema/VendorFavourite');
var vendorCategorySchema = require('../../schema/VendorCategory');
var mappingVendorCategorySchema = require('../../schema/MappingVendorCategory');
var categorySchema = require('../../schema/Category');
var bannerSchema = require('../../schema/Banner');
var itemSchema = require('../../schema/Item');
var userDeviceLoginSchemaSchema = require('../../schema/UserDeviceLogin');
var customerSchema = require('../../schema/Customer');
var vendorOwnerSchema = require('../../schema/VendorOwner');
var vendorReviewSchema = require('../../schema/VendorReview');

var orderSchema = require('../../schema/Order');
var OrderDetailSchema = require('../../schema/OrderDetail');
var config = require('../../config');
var PushLib = require('../../libraries/pushlib/send-push');
var UserNotificationSchema = require('../../schema/UserNotification');
var customerAddressSchema = require('../../schema/CustomerAddress');
var ItemExtraSchema = require('../../schema/ItemExtra');
var userNotificationSettingSchema = require('../../schema/UserNotificationSetting');
var jwt = require('jsonwebtoken');

module.exports = {
    //Customer Home/Dashboard API
    customerHome: async (data, callBack) => {
        if (data) {
            var latt = data.body.latitude;
            var long = data.body.longitude;
            var userType = data.body.userType;
            var categoryId = data.body.categoryId;
            var responseDt = [];
            var response_data = {};

            // console.log(data.body);

            var vendorQry = {
                location: {
                    $near: {
                        $maxDistance: config.restaurantSearchDistance,
                        $geometry: {
                            type: "Point",
                            coordinates: [long, latt]
                        }
                    }
                },
                isActive: true
            }

            var vendorIdArr = [];
            var catCheck = 0;
            if (categoryId != '1') {
                catCheck = 1;
                var mapvendorCatArr = await mappingVendorCategorySchema.find({ vendorCategoryId: categoryId });
                if (mapvendorCatArr.length > 0) {
                    for (let mapvendorVal of mapvendorCatArr) {
                        var vendorId = mapvendorVal.vendorId.toString();
                        vendorIdArr.push(vendorId);
                    }
                }
            }

            if (catCheck == 1) {
                vendorQry._id = { $in: vendorIdArr }
            }

            console.log(vendorQry);
            


            vendorSchema.find(vendorQry)
                // .limit(4)
                // .populate('vendorOpenCloseTime')
                .exec(async function (err, results) {
                    if (err) {
                        callBack({
                            success: false,
                            STATUSCODE: 500,
                            message: 'Internal DB error',
                            response_data: {}
                        });
                    } else {
                        // console.log(results);
                        if (results.length > 0) {
                            var vendorIds = [];
                            for (let restaurant of results) {
                                var responseObj = {};
                                responseObj = {
                                    id: restaurant._id,
                                    name: restaurant.restaurantName,
                                    description: restaurant.description,
                                    logo: `${config.serverhost}:${config.port}/img/vendor/${restaurant.logo}`,
                                    rating: parseFloat((restaurant.rating).toFixed(1))
                                };
                                // console.log(restaurant.location.coordinates);

                                //Calculate Distance
                                var sourceLat = restaurant.location.coordinates[1];
                                var sourceLong = restaurant.location.coordinates[0];

                                var destLat = latt;
                                var destLong = long;
                                responseObj.distance = await getDistanceinMtr(sourceLat, sourceLong, destLat, destLong);
                                // console.log(responseObj);

                                responseObj.latitude = sourceLat;
                                responseObj.longitude = sourceLong;
                                //Get Favorites (Only for Genuine Customers, No Guest)
                                if (userType == 'GUEST') {
                                    responseObj.favorite = 0;
                                } else {
                                    var customerId = data.body.customerId;
                                    var vendorId = restaurant._id;
                                    responseObj.favorite = await vendorFavouriteSchema.countDocuments({ vendorId: vendorId, customerId: customerId });
                                }

                                //Offer 
                                var itemsChecks = await itemSchema.find({ vendorId: restaurant._id });
                                if (itemsChecks.length > 0) {
                                    var finalPriceArr = [];
                                    var finalPriceValueArr = [];
                                    var minPrice = -5;
                                    var offerWord = '';
                                    for (itemsCheck of itemsChecks) {
                                        var itemPrice = itemsCheck.price;
                                        var discountAmount = itemsCheck.discountAmount;
                                        if (itemsCheck.discountType == 'PERCENTAGE') {
                                            var finalPrce = (Number(itemPrice) - ((Number(itemPrice) * Number(discountAmount)) / 100));
                                        } else if (itemsCheck.discountType == 'FLAT') {
                                            var finalPrce = (Number(itemPrice) - Number(discountAmount));
                                        } else {
                                            var finalPrce = Number(itemPrice);
                                        }

                                        if (minPrice == -5) {

                                            minPrice = finalPrce;

                                            if (itemsCheck.discountType == 'PERCENTAGE') {
                                                offerWord = `Upto ${discountAmount}% off`;
                                            } else if (itemsCheck.discountType == 'FLAT') {
                                                offerWord = `Upto flat ₦${discountAmount} off`;
                                            } else {
                                                offerWord = '';
                                            }
                                        } else {
                                            if (finalPrce < minPrice) {
                                                minPrice = finalPrce;

                                                if (itemsCheck.discountType == 'PERCENTAGE') {
                                                    offerWord = `Upto ${discountAmount}% off`;
                                                } else if (itemsCheck.discountType == 'FLAT') {
                                                    offerWord = `Upto flat ₦${discountAmount} off`;
                                                } else {
                                                    offerWord = '';
                                                }
                                            }
                                        }
                                        finalPriceArr.push(finalPrce);
                                        finalPriceValueArr.push(discountAmount);

                                    }


                                    responseObj.offer = offerWord;

                                } else {
                                    responseObj.offer = ''
                                }
                                responseDt.push(responseObj);
                                vendorIds.push(restaurant._id);
                            }

                            //Restaurant
                            response_data.vendor = responseDt;
                            //Category Data

                            var defaultCategory = [
                                {
                                    _id: '1',
                                    categoryName: 'All',
                                    image: '1.png'
                                }
                            ]

                            var resCategoryData = await vendorCategorySchema.find({ isActive: true }, { "categoryName": 1, "image": 1 });
    
                            var mergedArr = defaultCategory.concat(resCategoryData);
                            response_data.category_data = mergedArr;
                            response_data.category_imageUrl = `${config.serverhost}:${config.port}/img/vendor_category/`;

                            //Banner Data
                            // console.log(vendorIds);
                            response_data.banner_data = await bannerSchema.find({
                                vendorId: { $in: vendorIds }
                            }, { "bannerType": 1, "image": 1 })
                            response_data.banner_imageUrl = `${config.serverhost}:${config.port}/img/vendor/`;

                            callBack({
                                success: true,
                                STATUSCODE: 200,
                                message: `${results.length} nearby restaurants found.`,
                                response_data: response_data
                            })

                        } else {
                            callBack({
                                success: true,
                                STATUSCODE: 200,
                                message: 'No nearby restaurants found.',
                                response_data: response_data
                            })
                        }
                    }
                });
        }
    },
    //Customer Restaurant details API
    restaurantDetails: (data, callBack) => {
        if (data) {

            var vendorId = data.vendorId;
            var categoryId = data.categoryId;
            var responseDt = {};
            var latt = data.latitude;
            var long = data.longitude;
            var restaurantInformation = data.restaurantInfo;
            // return;

            if (restaurantInformation == 'YES') {

                var vendorDetailsObj = {
                    location: {
                        $near: {
                            $maxDistance: config.restaurantSearchDistance,
                            $geometry: {
                                type: "Point",
                                coordinates: [long, latt]
                            }
                        }
                    },
                    _id: vendorId,
                    isActive: true
                }

                vendorSchema.findOne(vendorDetailsObj)
                    .populate('vendorOpenCloseTime')
                    .exec(async function (err, results) {
                        if (err) {
                            console.log(err);
                            callBack({
                                success: false,
                                STATUSCODE: 500,
                                message: 'Internal error',
                                response_data: {}
                            });
                        } else {

                            if (results != null) {
                                var restaurantInfo = {
                                    name: results.restaurantName,
                                    description: results.description,
                                    rating: parseFloat((results.rating).toFixed(1)),
                                    logo: `${config.serverhost}:${config.port}/img/vendor/${results.logo}`,
                                    banner: `${config.serverhost}:${config.port}/img/vendor/${results.banner}`
                                };

                                //Calculate Distance
                                var sourceLat = results.location.coordinates[1];
                                var sourceLong = results.location.coordinates[0];

                                restaurantInfo.latitude = sourceLat;
                                restaurantInfo.longitude = sourceLong;

                                var destLat = latt;
                                var destLong = long;
                                restaurantInfo.distance = await getDistanceinMtr(sourceLat, sourceLong, destLat, destLong);

                                //Open time
                                var vendorTimeArr = [];
                                var openTimeArr = [];
                                var closeTimeArr = [];
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
                                            openTimeAMPM = 'am';
                                        } else {
                                            var num = (vendorTime.openTime - 720);
                                            openTimeAMPM = 'pm';
                                        }

                                        var openHours = (num / 60);
                                        var openrhours = Math.floor(openHours);
                                        var openminutes = (openHours - openrhours) * 60;
                                        var openrminutes = Math.round(openminutes);

                                        openTimeHours = openrhours;
                                        openTimeMin = openrminutes;

                                        //CLOSE TIME CALCULATION
                                        var closeTimeAMPM = '';
                                        var closeTimeHours = '';
                                        var closeTimeMin = '';
                                        if (vendorTime.closeTime < 720) {
                                            var num = vendorTime.closeTime;
                                            closeTimeAMPM = 'am';
                                        } else {
                                            var num = (vendorTime.closeTime - 720);
                                            closeTimeAMPM = 'pm';
                                        }

                                        var closeHours = (num / 60);
                                        var closerhours = Math.floor(closeHours);
                                        var closeminutes = (closeHours - closerhours) * 60;
                                        var closerminutes = Math.round(closeminutes);

                                        closeTimeHours = closerhours;
                                        closeTimeMin = closerminutes;

                                        vendorTimeObj.day = vendorTime.day;
                                        vendorTimeObj.openTime = `${openTimeHours}:${openTimeMin} ${openTimeAMPM}`
                                        vendorTimeObj.closeTime = `${closeTimeHours}:${closeTimeMin} ${closeTimeAMPM}`

                                        vendorTimeArr.push(vendorTimeObj);
                                    }
                                }

                                responseDt.restaurant = restaurantInfo;

                                //Everyday Check
                                if (everydayCheck == 1) {
                                    // console.log(openTimeArr);
                                    // console.log(closeTimeArr);
                                    var uniqueOpen = openTimeArr.filter(onlyUnique);
                                    var uniqueClose = closeTimeArr.filter(onlyUnique);
                                    if ((uniqueOpen.length == 1) && (uniqueClose.length == 1)) {
                                        responseDt.vendorTimeEveryday = 1;
                                        responseDt.vendorTimeEverydayStart = uniqueOpen[0];
                                        responseDt.vendorTimeEverydayClose = uniqueClose[0];
                                    }
                                } else {
                                    responseDt.vendorTimeEveryday = 0;
                                }

                                responseDt.vendorTime = vendorTimeArr;


                                //Get Item Details
                                var restaurantItemDetails = await restaurantCategoryItem(vendorId, categoryId);

                                if (restaurantItemDetails != 'err') {
                                    responseDt.catitem = restaurantItemDetails;

                                    callBack({
                                        success: true,
                                        STATUSCODE: 200,
                                        message: 'Restaurant details.',
                                        response_data: responseDt
                                    });

                                    //  console.log(responseDt);
                                } else {
                                    callBack({
                                        success: false,
                                        STATUSCODE: 500,
                                        message: 'Internal DB error.',
                                        response_data: {}
                                    });
                                }

                            } else {
                                callBack({
                                    success: false,
                                    STATUSCODE: 400,
                                    message: 'Something went wrong.',
                                    response_data: {}
                                });
                            }
                        }
                        //console.log(results);
                    });

            } else {

                //Get Item Details
                restaurantCategoryItem(vendorId, categoryId)
                    .then(function (restaurantItemDetails) {

                        if (restaurantItemDetails != 'err') {
                            responseDt.catitem = restaurantItemDetails;

                            callBack({
                                success: true,
                                STATUSCODE: 200,
                                message: 'Restaurant details.',
                                response_data: responseDt
                            });

                            //  console.log(responseDt);
                        } else {
                            callBack({
                                success: false,
                                STATUSCODE: 500,
                                message: 'Internal DB error.',
                                response_data: {}
                            });
                        }
                    }).catch(function (err) {
                        console.log(err);
                        callBack({
                            success: false,
                            STATUSCODE: 500,
                            message: 'Internal DB error.',
                            response_data: {}
                        });
                    });
            }


        }
    },
    //Customer Post Order API
    postOrder: (data, callBack) => {
        if (data) {
            //   console.log(data);

            // return;

            var vendorId = data.vendorId;
            var items = data.items;
            var latt = data.latitude;
            var long = data.longitude;
            var appType = data.appType;

            var checkJson = false

            if (appType == 'ANDROID') {
                var checkJson = isJson(items);
            } else {
                checkJson = true;
            }


            // console.log(checkJson);
            // console.log(appType);
            // console.log(items);

            var checkJson = true;

            if (checkJson == true) {

                //  var itemObj = JSON.parse(items);

                if (appType == 'ANDROID') {
                    var itemObj = JSON.parse(items);
                } else {
                    var itemObj = items;
                }


                //  console.log(itemObj);
                //  return;
                var errorCheck = 0;
                var orderDetailsItm = [];
                var itemsIdArr = [];
                for (item of itemObj) {
                    var orderDetailsItmObj = {};
                    if ((item.name == undefined) || (item.name == '') || (item.quantity == undefined) || (item.quantity == '') || (item.price == undefined) || (item.price == '') || (item.itemId == undefined) || (item.itemId == '')) {
                        errorCheck++;
                    } else {
                        //Items Check
                        itemsIdArr.push(item.itemId);

                        orderDetailsItmObj.item = item.name;
                        orderDetailsItmObj.quantity = item.quantity;
                        orderDetailsItmObj.itemPrice = item.price;
                        orderDetailsItmObj.totalPrice = (Number(item.price) * Number(item.quantity));
                        orderDetailsItmObj.itemOptions = item.itemOption;
                        orderDetailsItmObj.itemExtras = item.menuExtra;
                        orderDetailsItm.push(orderDetailsItmObj);
                    }
                    // console.log(item.name);
                    // console.log(item.quantity);
                    // console.log(item.price);
                }

                if (errorCheck == 0) {

                    vendorSchema.findOne({
                        _id: vendorId,
                        location: {
                            $near: {
                                $maxDistance: config.restaurantSearchDistance,
                                $geometry: {
                                    type: "Point",
                                    coordinates: [long, latt]
                                }
                            }
                        },
                        isActive: true
                    })
                        .exec(async function (err, results) {
                            if (err) {
                                callBack({
                                    success: false,
                                    STATUSCODE: 500,
                                    message: 'Internal DB error',
                                    response_data: {}
                                });
                            } else {
                                if (results != null) {


                                    //console.log(data);
                                    // console.log(itemsIdArr);
                                    var itemsCheck = await itemSchema.find({ _id: { $in: itemsIdArr } })
                                    var waitingTimeAll = 0;

                                    if (itemsCheck.length > 0) {
                                        for (let item of itemsCheck) {
                                            waitingTimeAll += Number(item.waitingTime);
                                        }
                                    }
                                    var orderVendorId = data.vendorId;

                                    var orderNo = generateOrder();

                                    var ordersObj = {
                                        vendorId: data.vendorId,
                                        orderNo: orderNo,
                                        orderTime: new Date(),
                                        estimatedDeliveryTime: waitingTimeAll,

                                        // deliveryPincode: data.deliveryPincode,
                                        deliveryHouseNo: data.deliveryHouseNo,
                                        //  deliveryRoad: data.deliveryRoad,
                                        deliveryCountryCode: data.deliveryCountryCode,
                                        deliveryPhone: data.deliveryPhone,
                                        // deliveryState: data.deliveryState,
                                        // deliveryCity: data.deliveryCity,
                                        deliveryLandmark: data.deliveryLandmark,
                                        fullAddess: data.fullAddess,
                                        addressType: data.addressType,
                                        // deliveryName: data.deliveryName,

                                        customerId: data.customerId,
                                        orderType: data.orderType,
                                        deliveryPreference: data.deliveryPreference,
                                        orderStatus: 'NEW',
                                        price: data.price,
                                        discount: data.discount,
                                        finalPrice: data.finalPrice,
                                        specialInstruction: data.specialInstruction,
                                        promocodeId: data.promocodeId
                                    }

                                    // console.log(ordersObj);



                                    //  console.log(orderDetailsItm);

                                    new orderSchema(ordersObj).save(async function (err, result) {
                                        if (err) {
                                            console.log(err);
                                            callBack({
                                                success: false,
                                                STATUSCODE: 500,
                                                message: 'Internal DB error',
                                                response_data: {}
                                            });
                                        } else {
                                            var orderId = result._id;
                                            var orderDetailsArr = [];
                                            var orderIdsArr = [];
                                            var orderDetailsCount = orderDetailsItm.length;
                                            var c = 0;
                                            for (let orderdetails of orderDetailsItm) {
                                                c++;
                                                var orderEnter = orderdetails;
                                                orderEnter.orderId = orderId;

                                                // console.log(orderEnter);

                                                orderDetailsArr.push(orderEnter);

                                                new OrderDetailSchema(orderEnter).save(async function (err, results) {
                                                    orderIdsArr.push(results._id);



                                                    orderSchema.update({ _id: orderId }, {
                                                        $set: { orderDetails: orderIdsArr }
                                                    }, function (err, res) {
                                                        if (err) {
                                                            console.log(err);
                                                        } else {
                                                            // console.log(res);
                                                        }
                                                    });
                                                })
                                            }
                                            //SEND PUSH MESSAGE
                                            var pushMessage = 'You have received a new order'
                                            var receiverId = orderVendorId;
                                            sendPush(receiverId, pushMessage, orderNo);

                                            //ADD DATA IN NOTIFICATION TABLE
                                            var userNotificationData = {
                                                userId: receiverId,
                                                userType: 'VENDOR',
                                                title: 'New order',
                                                type: 'NewOrder',
                                                content: pushMessage,
                                                isRead: 'NO'
                                            }
                                            new UserNotificationSchema(userNotificationData).save(async function (err, resultNt) {
                                                console.log('err', err);
                                                console.log('result', resultNt);
                                            });

                                            var respOrder = {};
                                            respOrder.order = result;
                                            respOrder.orderDetails = orderDetailsArr;
                                            callBack({
                                                success: true,
                                                STATUSCODE: 200,
                                                message: 'Order Updated Successfully.',
                                                response_data: respOrder
                                            });

                                        }
                                    });

                                } else {
                                    callBack({
                                        success: false,
                                        STATUSCODE: 500,
                                        message: 'Something went wrong.',
                                        response_data: {}
                                    });
                                }
                            }

                        });



                } else {
                    console.log('Invalid items object format');
                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Validation failed.',
                        response_data: {}
                    });
                }

            } else {
                console.log('Invalid items object format');
                callBack({
                    success: false,
                    STATUSCODE: 500,
                    message: 'Validation failed.',
                    response_data: {}
                });
            }
            return;


        }
    },
    //Customer submit review
    submitReview: (data, callBack) => {
        if (data) {
            var vendorId = data.vendorId;

            vendorSchema
                .findOne({ _id: vendorId })
                .then((vendor) => {
                    if (vendor != null) {

                        vendorReviewSchema
                            .find({ vendorId: vendorId })
                            .then((vendorRev) => {

                                var totalReviewCount = vendorRev.length;
                                var avrgRating = vendor.rating;

                                console.log('totalReviewCount', totalReviewCount);
                                console.log('avrgRating', avrgRating);


                                if (data.userType == 'CUSTOMER') {
                                    var customerId = data.customerId;
                                } else {
                                    var customerId = '';
                                }

                                var customerComment = {
                                    customer: data.customerComment
                                }

                                var insertReview = {
                                    vendorId: vendorId,
                                    customerId: customerId,
                                    customerName: data.customerName,
                                    comment: customerComment,
                                    customerRating: data.customerRating
                                }

                                new vendorReviewSchema(insertReview).save(async function (err, result) {
                                    if (err) {
                                        console.log(err);
                                        callBack({
                                            success: false,
                                            STATUSCODE: 500,
                                            message: 'Internal DB error',
                                            response_data: {}
                                        });
                                    } else {

                                        var totalReview = ((Number(totalReviewCount) * Number(avrgRating)) + Number(data.customerRating));
                                        var totalCountnw = (Number(totalReviewCount) + 1);


                                        var avrgRvw = (Number(totalReview) / Number(totalCountnw));


                                        vendorSchema.update({ _id: vendorId }, {
                                            $set: { rating: avrgRvw }
                                        }, function (err, res) {
                                            if (err) {
                                                callBack({
                                                    success: false,
                                                    STATUSCODE: 500,
                                                    message: 'Internal DB error',
                                                    response_data: {}
                                                });
                                            } else {
                                                if (res.nModified == 1) {
                                                    callBack({
                                                        success: true,
                                                        STATUSCODE: 200,
                                                        message: 'Review added successfully.',
                                                        response_data: {}
                                                    });
                                                }

                                            }
                                        });

                                    }
                                })


                            });


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
    //Customer Search API
    customerSearch: (data, callBack) => {
        if (data) {
            var latt = data.body.latitude;
            var long = data.body.longitude;
            var userType = data.body.userType;
            var searchVal = data.body.search;
            var responseDt = [];
            var response_data = {};

            // console.log(data.body);
            //  console.log(searchVal);

            //SEARCH BY RESTAURANT NAME
            vendorSchema.find({
                restaurantName: { '$regex': searchVal, '$options': 'i' },
                isActive: true
            })
                .exec(async function (err, vendorresults) {
                    if (err) {
                        callBack({
                            success: false,
                            STATUSCODE: 500,
                            message: 'Internal DB error',
                            response_data: {}
                        });
                    } else {
                        var vendorIdres = [];

                        if (vendorresults.length > 0) {
                            for (let vendorRes of vendorresults) {
                                vendorIdres.push(vendorRes._id);
                            }
                        }

                        //SEARCH BY ITEM
                        itemSchema.find({
                            itemName: { '$regex': searchVal, '$options': 'i' }
                        })
                            .then(function (itemresponse) {
                                if (itemresponse.length > 0) {
                                    for (let itemRes of itemresponse) {
                                        vendorIdres.push(itemRes.vendorId);
                                    }
                                }

                                //SEARCH BY CATEGORY NAME

                                categorySchema.find({
                                    categoryName: { '$regex': searchVal, '$options': 'i' }
                                })
                                    .then(async (catresps) => {
                                        if (catresps.length > 0) {
                                            for (let catresp of catresps) {

                                                var itemsCat = await itemSchema.find({ categoryId: catresp._id });

                                                if (itemsCat.length > 0) {
                                                    for (let itemCt of itemsCat) {
                                                        vendorIdres.push(itemCt.vendorId);
                                                    }
                                                }

                                            }
                                        }
                                        console.log('vendorIdres', vendorIdres);
                                        vendorSchema.find({
                                            _id: { $in: vendorIdres },
                                            location: {
                                                $near: {
                                                    $maxDistance: config.restaurantSearchDistance,
                                                    $geometry: {
                                                        type: "Point",
                                                        coordinates: [long, latt]
                                                    }
                                                }
                                            },
                                            isActive: true
                                        })
                                            .then(async function (results) {
                                                // console.log(results);
                                                // return;
                                                if (results.length > 0) {
                                                    var vendorIds = [];
                                                    for (let restaurant of results) {
                                                        var responseObj = {};
                                                        responseObj = {
                                                            id: restaurant._id,
                                                            name: restaurant.restaurantName,
                                                            description: restaurant.description,
                                                            logo: `${config.serverhost}:${config.port}/img/vendor/${restaurant.logo}`,
                                                            rating: parseFloat((restaurant.rating).toFixed(1))
                                                        };
                                                        // console.log(restaurant.location.coordinates);

                                                        //Calculate Distance
                                                        var sourceLat = restaurant.location.coordinates[1];
                                                        var sourceLong = restaurant.location.coordinates[0];

                                                        var destLat = latt;
                                                        var destLong = long;
                                                        responseObj.distance = await getDistanceinMtr(sourceLat, sourceLong, destLat, destLong);
                                                        // console.log(responseObj);

                                                        //Get Favorites (Only for Genuine Customers, No Guest)
                                                        if (userType == 'GUEST') {
                                                            responseObj.favorite = 0;
                                                        } else {
                                                            var customerId = data.body.customerId;
                                                            var vendorId = restaurant._id;
                                                            responseObj.favorite = await vendorFavouriteSchema.countDocuments({ vendorId: vendorId, customerId: customerId });
                                                        }
                                                        responseDt.push(responseObj);
                                                        vendorIds.push(restaurant._id);
                                                    }

                                                    //Restaurant
                                                    response_data.vendor = responseDt;
                                                    // //Category Data
                                                    // response_data.category_data = await categorySchema.find({}, { "categoryName": 1, "image": 1 })
                                                    // response_data.category_imageUrl = `${config.serverhost}:${config.port}/img/category/`;

                                                    // //Banner Data
                                                    // // console.log(vendorIds);
                                                    // response_data.banner_data = await bannerSchema.find({
                                                    //     vendorId: { $in: vendorIds }
                                                    // }, { "bannerType": 1, "image": 1 })
                                                    // response_data.banner_imageUrl = `${config.serverhost}:${config.port}/img/vendor/`;

                                                    callBack({
                                                        success: true,
                                                        STATUSCODE: 200,
                                                        message: `${results.length} restaurants found.`,
                                                        response_data: response_data
                                                    })

                                                } else {
                                                    callBack({
                                                        success: true,
                                                        STATUSCODE: 200,
                                                        message: 'No nearby restaurants found.',
                                                        response_data: response_data
                                                    })
                                                }
                                            })
                                            .catch(function (error) {
                                                console.log(error);
                                                callBack({
                                                    success: false,
                                                    STATUSCODE: 500,
                                                    message: 'Something went wrong.',
                                                    response_data: {}
                                                })
                                            })
                                    })



                            })
                            .catch(function (error) {
                                console.log(error);
                                callBack({
                                    success: false,
                                    STATUSCODE: 500,
                                    message: 'Something went wrong.',
                                    response_data: {}
                                })
                            });
                    }
                });
        }
    },
    //Favourite change API
    favouriteChange: (data, callBack) => {
        if (data) {
            var userType = data.body.userType;
            var responseDt = [];
            var response_data = {};

            var vendorId = data.body.vendorId;
            var customerId = data.body.customerId;
            var favourite = data.body.favourite;

            vendorSchema
                .findOne({ _id: vendorId })
                .then(async (vendor) => {

                    if (vendor != null) {

                        await vendorFavouriteSchema.deleteOne({ customerId: customerId, vendorId: vendorId }, function (err) {
                            if (err) {
                                console.log(err);
                            }
                        });

                        if (favourite == 'YES') {
                            var vendorFavAdd = { customerId: customerId, vendorId: vendorId }
                            new vendorFavouriteSchema(vendorFavAdd).save(async function (err, result) {
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
                                        message: 'Restaurant favourite.',
                                        response_data: {}
                                    });
                                }
                            })
                        } else {
                            callBack({
                                success: true,
                                STATUSCODE: 200,
                                message: 'Restaurant unfavourite.',
                                response_data: {}
                            });
                        }



                    } else {
                        callBack({
                            success: false,
                            STATUSCODE: 422,
                            message: 'Restaurant not found.',
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
                });
        }
    },
    //Favourite list API
    favouriteList: (data, callBack) => {
        if (data) {
            var userType = data.body.userType;
            var responseDt = [];
            var response_data = {};

            var customerId = data.body.customerId;
            var latt = data.body.latitude;
            var long = data.body.longitude;


            vendorFavouriteSchema
                .find({ customerId: customerId })
                .then(async (vendorfavs) => {
                    var vendorIds = [];
                    if (vendorfavs.length > 0) {
                        for (let vendorfav of vendorfavs) {
                            var vendorId = vendorfav.vendorId.toString();
                            vendorIds.push(vendorId);
                        }
                    }

                    console.log(vendorIds);

                    vendorSchema.find({ _id: { $in: vendorIds } })
                        // .limit(4)
                        // .populate('vendorOpenCloseTime')
                        .exec(async function (err, results) {
                            if (err) {
                                callBack({
                                    success: false,
                                    STATUSCODE: 500,
                                    message: 'Internal DB error',
                                    response_data: {}
                                });
                            } else {
                                // console.log(results);
                                if (results.length > 0) {
                                    var vendorIds = [];
                                    for (let restaurant of results) {
                                        var responseObj = {};
                                        responseObj = {
                                            id: restaurant._id,
                                            name: restaurant.restaurantName,
                                            description: restaurant.description,
                                            logo: `${config.serverhost}:${config.port}/img/vendor/${restaurant.logo}`,
                                            rating: parseFloat((restaurant.rating).toFixed(1)),
                                            favourite: 1
                                        };

                                        //Calculate Distance
                                        var sourceLat = restaurant.location.coordinates[1];
                                        var sourceLong = restaurant.location.coordinates[0];

                                        var destLat = latt;
                                        var destLong = long;
                                        responseObj.distance = await getDistanceinMtr(sourceLat, sourceLong, destLat, destLong);
                                        // console.log(restaurant.location.coordinates);


                                        responseDt.push(responseObj);

                                    }



                                    callBack({
                                        success: true,
                                        STATUSCODE: 200,
                                        message: `all favourite restaurant.`,
                                        response_data: responseDt
                                    })

                                } else {
                                    callBack({
                                        success: true,
                                        STATUSCODE: 200,
                                        message: 'No restaurants found.',
                                        response_data: responseDt
                                    })
                                }
                            }
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
                });



        }
    },
    //List Address API
    listAddress: (data, callBack) => {
        if (data) {
            var userType = data.body.userType;
            var responseDt = [];
            var response_data = {};

            var customerId = data.body.customerId;


            customerAddressSchema.find({ customerId: customerId })
                .then((customerAddresses) => {
                    callBack({
                        success: true,
                        STATUSCODE: 200,
                        message: 'Customer delivery address',
                        response_data: { address: customerAddresses }
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
    //Add Address API
    addAddress: (data, callBack) => {
        if (data) {

            var userType = data.body.userType;
            var responseDt = [];
            var response_data = {};

            var customerId = data.body.customerId;

            var addressData = {
                customerId: customerId,
                fullAddress: data.body.fullAddress,
                houseNo: data.body.houseNo,
                landMark: data.body.landMark,
                phone: data.body.phone,
                countryCode: data.body.countryCode,
                addressType: data.body.addressType,
                latitude: data.body.latitude,
                longitude: data.body.longitude
            }

            new customerAddressSchema(addressData).save(async function (err, result) {
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
                        message: 'Address added successfully',
                        response_data: {}
                    });
                }
            });
        }
    },
    //Edit Address API
    editAddress: (data, callBack) => {
        if (data) {
            var userType = data.body.userType;
            var responseDt = [];
            var response_data = {};

            var customerId = data.body.customerId;

            var addressId = data.body.addressId;

            var addressData = {
                customerId: customerId,
                fullAddress: data.body.fullAddress,
                houseNo: data.body.houseNo,
                landMark: data.body.landMark,
                phone: data.body.phone,
                countryCode: data.body.countryCode,
                addressType: data.body.addressType,
                latitude: data.body.latitude,
                longitude: data.body.longitude
            }

            customerAddressSchema.updateOne({ _id: addressId }, {
                $set: addressData
            }, function (err, res) {
                if (err) {
                    console.log(err);
                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Internal DB error',
                        response_data: {}
                    });
                } else {
                    if (res.nModified == 1) {
                        callBack({
                            success: true,
                            STATUSCODE: 200,
                            message: 'Address updated successfully',
                            response_data: {}
                        });
                    } else {
                        callBack({
                            success: false,
                            STATUSCODE: 500,
                            message: 'Internal DB error',
                            response_data: {}
                        });
                    }

                }
            });


        }
    },
    //Delete Address API
    deleteAddress: (data, callBack) => {
        if (data) {
            var userType = data.body.userType;
            var responseDt = [];
            var response_data = {};

            var customerId = data.body.customerId;
            var addressId = data.body.addressId;


            customerAddressSchema.findOne({ customerId: customerId, _id: addressId })
                .then((customerAddresses) => {
                    if (customerAddresses != null) {

                        customerAddressSchema.deleteOne({ customerId: customerId, _id: addressId }, function (err) {
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
                                    message: 'Address deleted successfully',
                                    response_data: {}
                                });
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






        }
    },
    //Physical address
    physicalAddressByLatlong: (data, callBack) => {
        if (data) {
            var userType = data.body.userType;
            var responseDt = [];
            var response_data = {};

            var customerId = data.body.customerId;
            var latt = data.body.latitude;
            var long = data.body.longitude;

            var latLong = `${latt},${long}`


            const Cryptr = require('cryptr');
            const cryptr = new Cryptr('CARGORS');

            const googleApiKey = cryptr.decrypt(config.google.API_KEY);




            var url = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + latLong + "&language=en&key=" + googleApiKey + "";
            var request = require('request');
            request.get({
                headers: { 'content-type': 'application/json' },
                url: url
            }, function (error, response, body) {
                if (error) {
                    return reject(error);
                }
                //console.log(body);
                body = JSON.parse(body);

                callBack({
                    success: true,
                    STATUSCODE: 200,
                    message: 'Physical address',
                    response_data: { address: body }
                });


            });



        }
    },
    //Protect guest user
    protectGuestUser: (data, callBack) => {
        if (data) {
            var userType = data.body.userType;
            var responseDt = [];
            var response_data = {};

            let payload = { subject: '123', user: 'GUEST' };
            const authToken = jwt.sign(payload, config.secretKey, { expiresIn: '3600000h' })

            callBack({
                success: true,
                STATUSCODE: 200,
                message: 'Guest token',
                response_data: { authToken: authToken }
            });
        }
    },
    //Get Notification Settings
    getNotificationData: (data, callBack) => {
        if (data) {
            var reqBody = data.body;
            customerSchema
                .findOne({ _id: reqBody.customerId })
                .then(async (res) => {
                    if (res != null) {

                        userNotificationSettingSchema
                            .findOne({ userId: reqBody.customerId })
                            .then(async (usernotSetting) => {

                                if (usernotSetting == null) {
                                    usernotSettingData = { 'OrderStatusNotification': true, 'PromotionalNotification': true, 'RestaurantOfferNotification': true }
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
            customerSchema
                .findOne({ _id: reqBody.customerId })
                .then(async (res) => {
                    if (res != null) {

                        userNotificationSettingSchema
                            .findOne({ userId: reqBody.customerId })
                            .then(async (usernotSetting) => {

                                if (usernotSetting == null) {
                                    var addNotificationData = {
                                        userId: reqBody.customerId,
                                        userType: 'CUSTOMER',
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
                                                message: 'User notification updated successfully',
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
                                                    message: 'User notification updated successfully',
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

            customerSchema
                .findOne({ _id: reqBody.customerId })
                .then(async (res) => {
                    if (res != null) {

                        UserNotificationSchema
                            .find({ userId: reqBody.customerId })
                            .then(async (usernotifications) => {



                                callBack({
                                    success: true,
                                    STATUSCODE: 200,
                                    message: 'userNotificatons',
                                    response_data: { notifications: usernotifications }
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

function generateToken(userData) {

}


//getDistance(start, end, accuracy = 1)
function getDistanceinMtr(sourceLat, sourceLong, destinationLat, destinationLong) {
    return new Promise(function (resolve, reject) {
        const geolib = require('geolib');

        var distanceCal = geolib.getDistance(
            { latitude: sourceLat, longitude: sourceLong },
            { latitude: destinationLat, longitude: destinationLong },
            1
        );

        //  console.log(distanceCal);
        var distanceStr = '';
        if (Number(distanceCal) > 1000) {
            distanceStr += Math.round((Number(distanceCal) / 1000));
            distanceStr += ' km away'
        } else {
            distanceStr = distanceCal
            distanceStr += ' mtrs away'
        }


        return resolve(distanceStr);

    });
}

function restaurantCategoryItem(vendorId, categoryId) {
    return new Promise(function (resolve, reject) {
        var resp = {};

        var itemSerachParam = {
            vendorId: vendorId,
            isActive: true
        }

        if (categoryId == '1') { //ALL ITEMS

        } else if (categoryId == '2') { //OFFERS
            itemSerachParam.discountType = { $in: ['PERCENTAGE', 'FLAT'] }
        } else {
            itemSerachParam.categoryId = categoryId;
        }

        itemSchema.find(itemSerachParam)
            .sort({ createdAt: -1 })
            .exec(async function (err, results) {
                if (err) {
                    console.log(err);
                    return resolve('err');
                } else {

                    if (results.length > 0) {
                        var itemsArr = [];
                        var categoryIdArr = [];
                        for (let itemsVal of results) {

                            console.log(itemsVal);
                            var itemsObj = {};
                            itemsObj.itemId = itemsVal._id
                            itemsObj.categoryId = itemsVal.categoryId
                            itemsObj.itemName = itemsVal.itemName
                            itemsObj.type = itemsVal.type
                            itemsObj.price = itemsVal.price
                            itemsObj.description = itemsVal.description;
                            itemsObj.waitingTime = itemsVal.waitingTime;
                            itemsObj.discountType = itemsVal.discountType;
                            itemsObj.discountAmount = itemsVal.discountAmount;
                            itemsObj.discountedPrice = itemsVal.price;
                            var orgAmount = itemsVal.price;
                            var disAmount = itemsVal.discountAmount;
                            var disType = itemsVal.discountType;
                            if (itemsVal.discountType == 'PERCENTAGE') {
                                console.log('amount', orgAmount, disAmount)
                                itemsObj.discountedPrice = (Number(orgAmount) - (Number(orgAmount) * Number(disAmount) / 100));
                            } else if (disType == 'FLAT') {
                                itemsObj.discountedPrice = (Number(orgAmount) - Number(disAmount));
                            }
                            itemsObj.menuImage = `${config.serverhost}:${config.port}/img/vendor/${itemsVal.menuImage}`;

                            var itemOptions = itemsVal.itemOptions;
                            var itmOptionArr = [];
                            if (itemOptions.length > 0) {
                                for (let itemOption of itemOptions) {
                                    if (itemOption.isActive == true) {
                                        var itmOptionObj = {
                                            isActive: true,
                                            optionTitle: itemOption.optionTitle
                                        }
                                        var arrOptionArr = [];
                                        var arrOp = itemOption.arrOptions;

                                        if (arrOp.length > 0) {
                                            for (let arrOpVal of arrOp) {
                                                if (arrOpVal.isActive == true) {
                                                    var arrOptionArrObj = {
                                                        isActive: true,
                                                        name: arrOpVal.name
                                                    };

                                                    arrOptionArr.push(arrOptionArrObj);

                                                }
                                            }
                                        }
                                        itmOptionObj.arrOptions = arrOptionArr;

                                        itmOptionArr.push(itmOptionObj);

                                    }

                                }

                            }
                            itemsObj.itemOptions = itmOptionArr;
                            var extraitem = await ItemExtraSchema.find({ itemId: itemsVal._id, isActive: true }, { _id: 1, itemName: 1, price: 1, isActive: 1 });
                            itemsObj.itemExtras = extraitem;

                            itemsArr.push(itemsObj);

                            if (!categoryIdArr.includes(itemsVal.categoryId)) {
                                // console.log(itemsVal.categoryId); 
                                categoryIdArr.push(itemsVal.categoryId);
                                // console.log(categoryIdArr);
                            }

                        }
                    }
                    resp.item = itemsArr;

                    // console.log(categoryIdArr);

                    if (categoryId == '1') {
                        //Category Data
                        var categoryData = {};
                        categoryData.data = await categorySchema.find({
                            _id: { $in: categoryIdArr }
                        }, { "categoryName": 1, "image": 1 });
                        // console.log(categoryData.data);
                        categoryData.imageUrl = `${config.serverhost}:${config.port}/img/category/`;

                        var defaultCategory = [
                            {
                                _id: '1',
                                categoryName: 'All',
                                image: '1.png'
                            },
                            {
                                _id: '2',
                                categoryName: 'Offers',
                                image: '2.jpg'
                            }
                        ]

                        var mergedArr = defaultCategory.concat(categoryData.data);
                        var categoryDatas = {
                            data : mergedArr,
                            imageUrl : categoryData.imageUrl
                        }
                        // console.log(categoryData);
                        resp.category =  categoryDatas;

                    }

                    return resolve(resp);
                }
            })
    });
}

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

function isJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

function generateOrder() {

    var orderNo = `EE${Math.floor((Math.random() * 100000))}`
    return orderNo;
}

function sendPush(receiverId, pushMessage, orderNo) {
    // console.log(receiverId);
    var pushMessage = pushMessage;
    vendorOwnerSchema
        .find({ vendorId: receiverId })
        .then(function (allowners) {
            vendorOwnerId = [];
            if (allowners.length > 0) {
                for (let owner of allowners) {
                    vendorOwnerId.push(owner._id);
                }
            }

            //console.log(vendorOwnerId);
            userDeviceLoginSchemaSchema
                .find({ userId: { $in: vendorOwnerId }, userType: 'VENDOR' })
                .then(function (customers) {
                    // console.log(customers);
                    //   return;

                    if (customers.length > 0) {
                        for (let customer of customers) {
                            if (customer.deviceToken != '') {

                                var msgStr = ",";
                                msgStr += "~order_no~:~" + orderNo + "~";
                                var dataset = "{~message~:~" + pushMessage + "~" + msgStr + "}";

                                var deviceToken = customer.deviceToken;

                                if (customer.appType == 'ANDROID') {

                                    //ANDROID PUSH START
                                    var andPushData = {
                                        'badge': 0,
                                        'alert': pushMessage,
                                        'deviceToken': deviceToken,
                                        'pushMode': customer.pushMode,
                                        // 'dataset': dataset,
                                        'dataset': {
                                            "order_no": orderNo
                                        }
                                    }
                                    PushLib.sendPushAndroid(andPushData)
                                        .then(async function (success) { //PUSH SUCCESS

                                            console.log('push_success_ANDROID', success);
                                        }).catch(async function (err) { //PUSH FAILED

                                            console.log('push_err_ANDROID', err);
                                        });
                                    //ANDROID PUSH END

                                } else if (customer.appType == 'IOS') {

                                    //IOS PUSH START
                                    var iosPushData = {
                                        'badge': 0,
                                        'alert': pushMessage,
                                        'deviceToken': deviceToken,
                                        'pushMode': customer.pushMode,
                                        'pushTo': 'VENDOR',
                                        'dataset': {
                                            "order_no": orderNo
                                        }
                                    }
                                    //SEND PUSH TO IOS [APN]

                                    PushLib.sendPushIOS(iosPushData)
                                        .then(async function (success) { //PUSH SUCCESS
                                            console.log('push_success_IOS', success);

                                        }).catch(async function (err) { //PUSH FAILED
                                            console.log('push_err_IOS', err);
                                        });
                                    //IOS PUSH END

                                }

                            }
                        }
                    }



                })


        })



}