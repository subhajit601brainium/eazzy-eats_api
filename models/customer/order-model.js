var vendorSchema = require('../../schema/Vendor');
var vendorFavouriteSchema = require('../../schema/VendorFavourite');
var categorySchema = require('../../schema/Category');
var bannerSchema = require('../../schema/Banner');
var itemSchema = require('../../schema/Item');
var userDeviceLoginSchemaSchema = require('../../schema/UserDeviceLogin');

var orderSchema = require('../../schema/Order');
var OrderDetailSchema = require('../../schema/OrderDetail');
var config = require('../../config');
var PushLib = require('../../libraries/pushlib/send-push');

module.exports = {
    //Customer Order List API
    orderList: (data, callBack) => {
        if (data) {
            console.log(data.body);
            var customerId = data.body.customerId;
            var orderStatus = data.body.orderStatus;
            var responseOrder = {};

            var findCond = { customerId: customerId };
            if(orderStatus == 'ONGOING') {
               var orCond = [ {'orderStatus':'NEW'}, {'orderStatus':'ACCEPTED'}, {'orderStatus':'DELAYED'}, {'orderStatus':'DELIVERED'}, {'orderStatus':'MODIFIED'}, {'orderStatus':'READY'}]
            } else {
                var orCond = [ {'orderStatus':'COMPLETED'}, {'orderStatus':'CANCELLED'}]
            }

            orderSchema
                .find(findCond)
                .or(orCond)
                .sort({ orderTime: 'desc' })
                .populate('orderDetails')
                .then(async function (orders) {
                    var allorders = [];
                    if(orders.length > 0) {
                        for(let order of orders) {
                            var orderlst = {};
                            orderlst.orderId = order._id;
                            orderlst.finalPrice = order.finalPrice;
                            orderlst.estimatedDeliveryTime = order.estimatedDeliveryTime;
                            orderlst.orderStatus = order.orderStatus;
                            orderlst.orderTime = order.orderTime;

                            //Vendor Info
                            var vendorInfo = await vendorSchema.findOne({_id: order.vendorId});
                            orderlst.restaurantName = vendorInfo.restaurantName;
                            orderlst.description = vendorInfo.description;
                            orderlst.restaurantImage = `${config.serverhost}:${config.port}/img/vendor/${vendorInfo.banner}`;

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
                .catch(function(err) {
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
                .findOne({_id: orderId})
                .populate('orderDetails')
                .then(async function (order) {
                    console.log(order);

                    var orderResp = {};

                    orderResp.orderNo = order.orderNo;
                    orderResp.orderTime = order.orderTime;
                    orderResp.finalPrice = order.finalPrice;

                    //Vendor Info
                    var vendorInfo = await vendorSchema.findOne({_id: order.vendorId});
                    orderResp.restaurantName = vendorInfo.restaurantName;
                    orderResp.restaurantImage = `${config.serverhost}:${config.port}/img/vendor/${vendorInfo.banner}`;

                    orderResp.orderDetails = order.orderDetails;


                    callBack({
                        success: true,
                        STATUSCODE: 200,
                        message: 'Order Details.',
                        response_data: orderResp
                    })
                })
                .catch(function(err) {
                    console.log(err);
                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Something went wrong.',
                        response_data: {}
                    })
                });
        }
    }
}