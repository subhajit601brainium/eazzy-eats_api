'use strict';
var express = require('express');
const restaurantService = require('../services/vendor/restaurant-service');

const orderValidator = require('../middlewares/validators/vendor/order-validator');
const jwtTokenValidator = require('../middlewares/jwt-validation-middlewares');
const vendorValidator = require('../middlewares/validators/vendor/vendor-validator');

var vendorApi = express.Router();
vendorApi.use(express.json());
vendorApi.use(express.urlencoded({extended: false}));

/** All Order Statuis */
vendorApi.post('/orderStatus',jwtTokenValidator.validateToken, function(req, res) {
    restaurantService.orderStatus(req.body, function(result) {
        res.status(200).send(result);
    });
})

/** Order Listing */
vendorApi.post('/orderList',jwtTokenValidator.validateToken,orderValidator.orderListValidator, function(req, res) {
    restaurantService.orderList(req.body, function(result) {
        res.status(200).send(result);
    });
})

/** Order List */
vendorApi.post('/dashboard',jwtTokenValidator.validateToken,orderValidator.dashboardValidatior, function(req, res) {
    restaurantService.dashboard(req, function(result) {
        res.status(200).send(result);
    });
})

/** Order Confirmation */
vendorApi.post('/orderConfirm',jwtTokenValidator.validateToken,orderValidator.orderConfirmValidator, function(req, res) {
    restaurantService.orderConfirm(req.body, function(result) {
        res.status(200).send(result);
    });
})

/** Vendor registration */
//,
vendorApi.post('/registerVendor', vendorValidator.addVendorValidator, function(req, res) {
    restaurantService.addVendor(req, function(result) {
        res.status(200).send(result);
    })
});

/** Vendor time registration */
vendorApi.post('/registerVendorTime', vendorValidator.addVendorTimeValidator, function(req, res) {
    restaurantService.addVendorTime(req, function(result) {
        res.status(200).send(result);
    })
});

vendorApi.post('/getAllCategories',jwtTokenValidator.validateToken, vendorValidator.getCategoryValidator, function(req, res) {
    restaurantService.getAllCategories(req, function(result) {
        res.status(200).send(result);
    })
});

/** Item Add */
vendorApi.post('/addItem',jwtTokenValidator.validateToken, vendorValidator.itemAddValidator, function(req, res) {
    restaurantService.addItem(req, function(result) {
        res.status(200).send(result);
    })
});

/** Item Get */
vendorApi.post('/getItem',jwtTokenValidator.validateToken, vendorValidator.getItem, function(req, res) {
    restaurantService.getItem(req, function(result) {
        res.status(200).send(result);
    })
});

/** Item update */
vendorApi.post('/updateItem',jwtTokenValidator.validateToken, vendorValidator.updateItem, function(req, res) {
    restaurantService.updateItem(req, function(result) {
        res.status(200).send(result);
    })
});

/** Item List */
vendorApi.post('/itemList',jwtTokenValidator.validateToken, vendorValidator.itemList, function(req, res) {
    restaurantService.itemList(req, function(result) {
        res.status(200).send(result);
    })
});

/** Get Vendor Details */
vendorApi.post('/getVendorDetails',jwtTokenValidator.validateToken, vendorValidator.getVendorDetails, function(req, res) {
    restaurantService.getVendorDetails(req, function(result) {
        res.status(200).send(result);
    })
});

/** Update Vendor Details */
vendorApi.post('/updateVendorDetails',jwtTokenValidator.validateToken, vendorValidator.updateVendorDetails, function(req, res) {
    restaurantService.updateVendorDetails(req, function(result) {
        res.status(200).send(result);
    })
});

/** Update Banner */
vendorApi.post('/updateVendorTime',jwtTokenValidator.validateToken, vendorValidator.updateVendorTime, function(req, res) {
    restaurantService.updateVendorTime(req, function(result) {
        res.status(200).send(result);
    })
});

/** Verify Infor Before Changing Email/Phone */
vendorApi.post('/verifyUser',jwtTokenValidator.validateToken, vendorValidator.verifyUser, function(req, res) {
    restaurantService.verifyUser(req, function(result) {
        res.status(200).send(result);
    })
});

/** Update Vendor Email */
vendorApi.post('/updateVendorEmail',jwtTokenValidator.validateToken, vendorValidator.updateVendorEmail, function(req, res) {
    restaurantService.updateVendorEmail(req, function(result) {
        res.status(200).send(result);
    })
});

/** Update Vendor Phone */
vendorApi.post('/updateVendorPhone',jwtTokenValidator.validateToken, vendorValidator.updateVendorPhone, function(req, res) {
    restaurantService.updateVendorPhone(req, function(result) {
        res.status(200).send(result);
    })
});

/** Banner upload */
vendorApi.post('/bannerUpload',jwtTokenValidator.validateToken,vendorValidator.bannerUpload, function(req, res) {
    restaurantService.bannerUpload(req, function(result) {
        res.status(200).send(result);
    });
})


/** logo upload */
vendorApi.post('/logoUpload',jwtTokenValidator.validateToken,vendorValidator.bannerUpload, function(req, res) {
    restaurantService.logoUpload(req, function(result) {
        res.status(200).send(result);
    });
})


/** Licence upload */
vendorApi.post('/licenceUpload',jwtTokenValidator.validateToken,vendorValidator.bannerUpload, function(req, res) {
    restaurantService.licenceUpload(req, function(result) {
        res.status(200).send(result);
    });
})




module.exports = vendorApi;