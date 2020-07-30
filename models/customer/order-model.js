var vendorSchema = require('../../schema/Vendor');
var vendorFavouriteSchema = require('../../schema/VendorFavourite');
var categorySchema = require('../../schema/Category');
var bannerSchema = require('../../schema/Banner');
var itemSchema = require('../../schema/Item');
var userDeviceLoginSchemaSchema = require('../../schema/UserDeviceLogin');
var promoCodeSchema = require('../../schema/PromoCode');

var orderSchema = require('../../schema/Order');
var OrderReviewSchema = require('../../schema/OrderReview');
var config = require('../../config');
var PushLib = require('../../libraries/pushlib/send-push');
const { image } = require('image-downloader');

module.exports = {
    //Customer Order List API
    orderList: (data, callBack) => {
        if (data) {
            console.log(data.body);
            var customerId = data.body.customerId;
            var orderStatus = data.body.orderStatus;
            var responseOrder = {};

            var findCond = { customerId: customerId };
            if (orderStatus == 'ONGOING') {
                var orCond = [{ 'orderStatus': 'NEW' }, { 'orderStatus': 'ACCEPTED' }, { 'orderStatus': 'DELAYED' }, { 'orderStatus': 'COLLECTED' }, { 'orderStatus': 'MODIFIED' }, { 'orderStatus': 'READY' }]
            } else {
                var orCond = [{ 'orderStatus': 'COMPLETED' }, { 'orderStatus': 'CANCELLED' }]
            }

            orderSchema
                .find(findCond)
                .or(orCond)
                .sort({ orderTime: 'desc' })
                .populate('orderDetails')
                .then(async function (orders) {
                    var allorders = [];
                    if (orders.length > 0) {
                        for (let order of orders) {
                            var orderlst = {};
                            orderlst.orderId = order._id;
                            orderlst.orderNo = order.orderNo;
                            orderlst.finalPrice = order.finalPrice;
                            orderlst.estimatedDeliveryTime = order.estimatedDeliveryTime;
                            orderlst.orderStatus = order.orderStatus;
                            orderlst.orderTime = order.orderTime;

                            //Vendor Info
                            var vendorInfo = await vendorSchema.findOne({ _id: order.vendorId });
                            orderlst.restaurantName = vendorInfo.restaurantName;
                            orderlst.description = vendorInfo.description;
                            orderlst.restaurantImage = `${config.serverhost}:${config.port}/img/vendor/${vendorInfo.banner}`;

                            //Order Review
                            var OrderReviewCheck = await OrderReviewSchema.findOne({customerId: customerId, orderId: order._id});
                            if(OrderReviewCheck == null) {
                                orderlst.userReviewStatus = 'NO'
                            } else {
                                orderlst.userReviewStatus = 'YES'
                            }
                            allorders.push(orderlst);
                        }
                    }
                    responseOrder.orderList = allorders;
                    callBack({
                        success: true,
                        STATUSCODE: 200,
                        message: 'order list.',
                        response_data: responseOrder
                    })

                })
                .catch(function (err) {
                    console.log(err);
                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Something went wrong.',
                        response_data: {}
                    })
                })
        }
    },
    //Customer Order Details API
    orderDetails: (data, callBack) => {
        if (data) {
            var orderId = data.body.orderId;
            var responseOrder = {};

            orderSchema
                .findOne({ _id: orderId })
                .populate('orderDetails')
                .then(async function (order) {
                    console.log(order);

                    var orderResp = {};

                    orderResp.orderNo = order.orderNo;
                    orderResp.orderTime = order.orderTime;
                    orderResp.finalPrice = order.finalPrice;
                    orderResp.estimatedDeliveryTime = order.estimatedDeliveryTime;

                    //Options & Extra


                    var orderDetails = order.orderDetails;
                    var orderExtraArr = [];
                    if (orderDetails.length > 0) {
                        for (let details of orderDetails) {
                            var orderExtraObj = {
                                orderId: details.orderId,
                                offerId: details.offerId,
                                _id: details._id,
                                item: details.item,
                                quantity: details.quantity,
                                itemPrice: details.itemPrice,
                                totalPrice: details.totalPrice,
                                createdAt: details.createdAt,
                                updatedAt: details.updatedAt,
                                __v: details.__v,
                                itemOptions: details.itemOptions,
                                orderExtras: details.itemExtras
                            };

                            orderExtraArr.push(orderExtraObj);
                        }
                    }
                    orderResp.orderDetails = orderExtraArr;

                    //Vendor Info
                    var vendorInfo = await vendorSchema.findOne({ _id: order.vendorId });
                    orderResp.restaurantName = vendorInfo.restaurantName;
                    orderResp.restaurantImage = `${config.serverhost}:${config.port}/img/vendor/${vendorInfo.banner}`;

                    


                    callBack({
                        success: true,
                        STATUSCODE: 200,
                        message: 'Order Details.',
                        response_data: orderResp
                    })
                })
                .catch(function (err) {
                    console.log(err);
                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Something went wrong.',
                        response_data: {}
                    })
                });
        }
    },

    //Customer Offer List API
    promoCodeList: (data, callBack) => {
        if (data) {
            // var promoData = {
            //     fromDate: new Date(),
            //     toDate: new Date(),
            //     promoType: 'PERCENTAGE',
            //     promoPrice: 40,
            //     promoConditions: 'Get 40 % off above Rs 499 for all dishes',
            //     promoCode: 'FMAPP 40'
            // }
            // new promoCodeSchema(promoData).save(async function (err, result) {
            //     console.log(err);
            // });
            promoCodeSchema.find({ $and: [{ fromDate: { $lte: new Date() } }, { toDate: { $gte: new Date() } }] })
                .then((allcodes) => {
                    callBack({
                        success: true,
                        STATUSCODE: 200,
                        message: 'All Promo Code',
                        response_data: { code: allcodes }
                    });
                })
                .catch((error) => {
                    console.log(error);
                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Internal DB error',
                        response_data: {}
                    });
                });
        }
    },
    //Customer apply promo code
    applyPromoCode: (data, callBack) => {
        if (data) {

            var promoCode = data.body.promoCode;
            var amount = data.body.amount;

            console.log(promoCode);
           
            promoCodeSchema.findOne({ $and: [{ fromDate: { $lte: new Date() } }, { toDate: { $gte: new Date() } }, {promoCode:promoCode}] })
                .then((promo) => {

                    if((Number(amount) > promo.promoCodeAmountMinCap) && (Number(amount) < promo.promoCodeAmountMaxCap)) {
                        var discountAmount = amount;
                        var promoPrice = promo.promoPrice;
                        if(promo.promoType == 'PERCENTAGE') {

                            discountAmount = (Number(amount) - (Number(amount) * Number(promoPrice) / 100));
                        } else if(promo.promoType == 'FLAT') {
                            discountAmount = (Number(amount) - Number(promoPrice));
                        }

                        callBack({
                            success: true,
                            STATUSCODE: 200,
                            message: `Discounted amount`,
                            response_data: {amount : discountAmount}
                        });
                    } else {
                        callBack({
                            success: false,
                            STATUSCODE: 422,
                            message: `Promo code valid for amount ${promo.promoCodeAmountMinCap} to ${promo.promoCodeAmountMaxCap}`,
                            response_data: {}
                        });
                    }

                    console.log(promo);
                    // callBack({
                    //     success: true,
                    //     STATUSCODE: 200,
                    //     message: 'All Promo Code',
                    //     response_data: { code: allcodes }
                    // });
                })
                .catch((error) => {
                    console.log(error);
                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Internal DB error',
                        response_data: {}
                    });
                });
        }
    },
}