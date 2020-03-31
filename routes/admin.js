var express = require('express');
const stateValidator = require('../middlewares/validators/admin/state-validator');
const cityValidator = require('../middlewares/validators/admin/city-validator');
const categoryValidator = require('../middlewares/validators/admin/category-validator');
const adminStateService = require('../services/admin/state-service');
const adminCityService = require('../services/admin/city-service');
const adminCategoryService = require('../services/admin/category-service');
const adminVendorService = require('../services/admin/vendor-service');
const jwtTokenValidator = require('../middlewares/jwt-validation-middlewares');
const vendorValidator = require('../middlewares/validators/admin/vendor-validator');

var apiAdmin = express.Router();
apiAdmin.use(express.json());
apiAdmin.use(express.urlencoded({extended: false}));


apiAdmin.post('/addState', stateValidator.addSateValidator, function(req, res) {
    adminStateService.addSate(req.body, function(result) {
        res.status(200).send(result);
    })
});

apiAdmin.post('/addCity', cityValidator.addCityValidator, function(req, res) {
    adminCityService.addCity(req.body, function(result) {
        res.status(200).send(result);
    })
});


apiAdmin.post('/addCategory',jwtTokenValidator.validateToken, categoryValidator.addCategoryValidator, function(req, res) {
    adminCategoryService.addCategory(req, function(result) {
        res.status(200).send(result);
    })
});

apiAdmin.post('/getAllCategories',jwtTokenValidator.validateToken, categoryValidator.getCategoryValidator, function(req, res) {
    adminCategoryService.getAllCategories(req.body, function(result) {
        res.status(200).send(result);
    })
});

/** Vendor registration */
//,
apiAdmin.post('/registerVendor',jwtTokenValidator.validateToken, vendorValidator.addVendorValidator, function(req, res) {
    adminVendorService.addVendor(req, function(result) {
        res.status(200).send(result);
    })
});

/** Vendor time registration */
apiAdmin.post('/registerVendorTime',jwtTokenValidator.validateToken, vendorValidator.addVendorTimeValidator, function(req, res) {
    adminVendorService.addVendorTime(req.body, function(result) {
        res.status(200).send(result);
    })
});

/** Vendor Owner registration */
apiAdmin.post('/registerVendorOwner',jwtTokenValidator.validateToken, vendorValidator.vendorOwnerRegisterValidator, function(req, res) {
    adminVendorService.vendorOwnerRegister(req.body, function(result) {
        res.status(200).send(result);
    })
});

/** Item Add */
apiAdmin.post('/addItem',jwtTokenValidator.validateToken, vendorValidator.itemAddValidator, function(req, res) {
    adminVendorService.addItem(req, function(result) {
        res.status(200).send(result);
    })
});

/** Item Add */
apiAdmin.post('/getVendorInfo',jwtTokenValidator.validateToken, vendorValidator.getVendorInfoValidator, function(req, res) {
    adminVendorService.getVendorInfo(req, function(result) {
        res.status(200).send(result);
    })
});




module.exports = apiAdmin;