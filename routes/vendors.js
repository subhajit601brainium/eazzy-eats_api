'use strict';
var express = require('express');
const restaurantService = require('../services/vendor/restaurant-service');

const orderValidator = require('../middlewares/validators/vendor/order-validator');
const jwtTokenValidator = require('../middlewares/jwt-validation-middlewares');

var vendorApi = express.Router();
vendorApi.use(express.json());
vendorApi.use(express.urlencoded({extended: false}));

/** Order Listing */
vendorApi.post('/orderList',jwtTokenValidator.validateToken,orderValidator.orderListValidator, function(req, res) {
    restaurantService.orderList(req.body, function(result) {
        res.status(200).send(result);
    });
})


module.exports = vendorApi;