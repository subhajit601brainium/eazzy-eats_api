'use strict';
var express = require('express');
const config = require('../config');
const registerService = require('../services/customer/register-service');
const restaurantService = require('../services/customer/restaurant-service');
const orderService = require('../services/customer/order-service');
const customerValidator = require('../middlewares/validators/customer/customer-validator');
const restaurantValidator = require('../middlewares/validators/customer/restaurant-validator');

const jwtTokenValidator = require('../middlewares/jwt-validation-middlewares');

var customerApi = express.Router();
customerApi.use(express.json());
customerApi.use(express.urlencoded({extended: false}));

/** Customer registration */
customerApi.post('/register', customerValidator.customerRegister, function(req, res) {
    registerService.customerRegister(req.body, function(result) {
        res.status(200).send(result);
    })
});

/** Customer Login */
customerApi.post('/login', customerValidator.customerLogin, function(req, res) {
    registerService.customerLogin(req.body, function(result) {
        res.status(200).send(result);
    })
});

/** Forgot Password */
customerApi.post('/forgotPassword', customerValidator.forgotPasswordEmail, function(req, res) {
    registerService.forgotPassword(req.body, function(result) {
        res.status(200).send(result);
    })
});

/** Reset Password */
customerApi.post('/resetPassword', customerValidator.resetPassword, function(req, res) {
    registerService.resetPassword(req.body, function(result) {
        res.status(200).send(result);
    });
});

/** Resend Forgot Password OTP */
customerApi.post('/resendForgotPassOtp', customerValidator.resendForgotPassOtp, function(req, res) {
    registerService.resendForgotPassordOtp(req.body, function(result) {
        res.status(200).send(result);
    });
})

/** Forgot Password Admin */
customerApi.post('/forgotPasswordAdmin', customerValidator.forgotPasswordEmail, function(req, res) {
    registerService.forgotPasswordAdmin(req.body, function(result) {
        res.status(200).send(result);
    })
});

/** Reset Password Admin */
customerApi.post('/resetPasswordAdmin', customerValidator.resetPasswordAdmin, function(req, res) {
    registerService.resetPasswordAdmin(req.body, function(result) {
        res.status(200).send(result);
    });
});

/** Change password Admin */
customerApi.post('/changePasswordAdmin',jwtTokenValidator.validateToken, customerValidator.changePassword, function(req, res) {
    registerService.changePasswordAdmin(req.body, function(result) {
        res.status(200).send(result);
    });
})

/** View Profile */
customerApi.post('/viewProfile',jwtTokenValidator.validateToken, customerValidator.viewProfile, function(req, res) {
    registerService.viewProfile(req.body, function(result) {
        res.status(200).send(result);
    });
})

/** Edit Profile */
customerApi.post('/editProfile',jwtTokenValidator.validateToken, customerValidator.editProfile, function(req, res) {
    registerService.editProfile(req.body, function(result) {
        res.status(200).send(result);
    });
})

/** Change password */
customerApi.post('/changePassword',jwtTokenValidator.validateToken, customerValidator.changePassword, function(req, res) {
    registerService.changePassword(req.body, function(result) {
        res.status(200).send(result);
    });
})

/** Profile image upload */
customerApi.post('/profileImageUpload',jwtTokenValidator.validateToken,customerValidator.profileImageUpload, function(req, res) {
    registerService.profileImageUpload(req, function(result) {
        res.status(200).send(result);
    });
})


/** Change password */
customerApi.post('/logout',jwtTokenValidator.validateToken, customerValidator.logout, function(req, res) {
    registerService.logout(req.body, function(result) {
        res.status(200).send(result);
    });
})

/** Change password */
customerApi.post('/devicePush',jwtTokenValidator.validateToken, customerValidator.devicePush, function(req, res) {
    registerService.devicePush(req.body, function(result) {
        res.status(200).send(result);
    });
})

/** Home/Dashboard */
customerApi.post('/dashboard',jwtTokenValidator.validateToken,restaurantValidator.customerHomeValidator, function(req, res) {
    restaurantService.customerHome(req, function(result) {
        res.status(200).send(result);
    });
});

/** Restaurant Details */
customerApi.post('/vendorDetails',jwtTokenValidator.validateToken,restaurantValidator.restaurantDetailsValidator, function(req, res) {
    restaurantService.restaurantDetails(req.body, function(result) {
        res.status(200).send(result);
    });
})

/** Order Submit */
customerApi.post('/postOrder',jwtTokenValidator.validateToken,restaurantValidator.postOrderValidator, function(req, res) {
    restaurantService.postOrder(req.body, function(result) {
        res.status(200).send(result);
    });
})

/** Order Submit */
customerApi.post('/submitReview',jwtTokenValidator.validateToken,restaurantValidator.submitReview, function(req, res) {
    restaurantService.submitReview(req.body, function(result) {
        res.status(200).send(result);
    });
})

/** Add Address */
customerApi.post('/addAddress',jwtTokenValidator.validateToken,restaurantValidator.addAddress, function(req, res) {
    restaurantService.addAddress(req, function(result) {
        res.status(200).send(result);
    });
});

/** Edit Address */
customerApi.post('/editAddress',jwtTokenValidator.validateToken,restaurantValidator.editAddress, function(req, res) {
    restaurantService.editAddress(req, function(result) {
        res.status(200).send(result);
    });
});

/** List Address */
customerApi.post('/listAddress',jwtTokenValidator.validateToken,restaurantValidator.listAddress, function(req, res) {
    restaurantService.listAddress(req, function(result) {
        res.status(200).send(result);
    });
});

/** Delete Address */
customerApi.post('/deleteAddress',jwtTokenValidator.validateToken,restaurantValidator.deleteAddress, function(req, res) {
    restaurantService.deleteAddress(req, function(result) {
        res.status(200).send(result);
    });
});

/** Search */
customerApi.post('/search',jwtTokenValidator.validateToken,restaurantValidator.customerSearchValidator, function(req, res) {
    restaurantService.customerSearch(req, function(result) {
        res.status(200).send(result);
    });
})

/** Order List */
customerApi.post('/orderList',jwtTokenValidator.validateToken,restaurantValidator.customerOrderListValidator, function(req, res) {
    orderService.orderList(req, function(result) {
        res.status(200).send(result);
    });
})

/** Order Details */
customerApi.post('/orderDetails',jwtTokenValidator.validateToken,restaurantValidator.customerOrderDetailsValidator, function(req, res) {
    orderService.orderDetails(req, function(result) {
        res.status(200).send(result);
    });
});



/** All promo List */
customerApi.post('/promoCodeList',jwtTokenValidator.validateToken,restaurantValidator.promoCodeList, function(req, res) {
    orderService.promoCodeList(req, function(result) {
        res.status(200).send(result);
    });
});

/** Forgot Password */
customerApi.post('/forgotEmail', customerValidator.forgotEmail, function(req, res) {
    registerService.forgotEmail(req.body, function(result) {
        res.status(200).send(result);
    })
});


/** Favourite/unfavorite */
customerApi.post('/favouriteChange',jwtTokenValidator.validateToken,restaurantValidator.favouriteChange, function(req, res) {
    restaurantService.favouriteChange(req, function(result) {
        res.status(200).send(result);
    });
});

/** Favourite/unfavorite */
customerApi.post('/favouriteList',jwtTokenValidator.validateToken,restaurantValidator.favouriteList, function(req, res) {
    restaurantService.favouriteList(req, function(result) {
        res.status(200).send(result);
    });
});
module.exports = customerApi;