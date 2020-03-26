var async = require('async');
const registerModel = require('../../models/customer/register-model');

module.exports = {
    customerRegister: (data, callBack) => {
        async.waterfall([
            function(nextCb) {
                registerModel.customerRegistration(data, function(result) {
                    nextCb(null, result);
                })
            }
        ], function(err, result) {
            if (err) {
                callBack({
                    success: false,
                    STATUSCODE: 403,
                    message: 'Request Forbidden',
                    response_data: {}
                })
            } else {
                callBack(result);
            }
        });
    },

    customerLogin: (data, callBack) => {

        if((data.userType == 'customer') || (data.userType == 'admin')) {
            async.waterfall([
                function(nextCb) {
                    registerModel.customerLogin(data, function(result) {
                        nextCb(null, result);
                    })
                }
            ], function(err, result) {
                if (err) {
                    callBack({
                        success: false,
                        STATUSCODE: 403,
                        message: 'Request Forbidden',
                        response_data: {}
                    })
                } else {
                    callBack(result);
                }
            });
        } else if(data.userType == 'deliveryboy') {
            async.waterfall([
                function(nextCb) {
                    registerModel.deliveryboyLogin(data, function(result) {
                        nextCb(null, result);
                    })
                }
            ], function(err, result) {
                if (err) {
                    callBack({
                        success: false,
                        STATUSCODE: 403,
                        message: 'Request Forbidden',
                        response_data: {}
                    })
                } else {
                    callBack(result);
                }
            });
        } else if(data.userType == 'vendorowner') {
            async.waterfall([
                function(nextCb) {
                    registerModel.vendorownerLogin(data, function(result) {
                        nextCb(null, result);
                    })
                }
            ], function(err, result) {
                if (err) {
                    callBack({
                        success: false,
                        STATUSCODE: 403,
                        message: 'Request Forbidden',
                        response_data: {}
                    })
                } else {
                    callBack(result);
                }
            });
        }
       
    },

    forgotPassword: (data, callBack) => {
        if(data.userType == 'customer') {

            async.waterfall([
                function(nextCb) {
                    registerModel.customerForgotPassword(data, function(result) {
                        nextCb(null, result);
                    });
                }
            ], function(err, result) {
                if (err) {
                    callBack({
                        success: false,
                        STATUSCODE: 403,
                        message: 'Request Forbidden',
                        response_data: {}
                    })
                } else {
                    callBack(result);
                }
            });
        } else if(data.userType == 'deliveryboy') {

            async.waterfall([
                function(nextCb) {
                    registerModel.deliveryboyForgotPassword(data, function(result) {
                        nextCb(null, result);
                    });
                }
            ], function(err, result) {
                if (err) {
                    callBack({
                        success: false,
                        STATUSCODE: 403,
                        message: 'Request Forbidden',
                        response_data: {}
                    })
                } else {
                    callBack(result);
                }
            });

        } else if(data.userType == 'vendorowner') {

            async.waterfall([
                function(nextCb) {
                    registerModel.vendorownerForgotPassword(data, function(result) {
                        nextCb(null, result);
                    });
                }
            ], function(err, result) {
                if (err) {
                    callBack({
                        success: false,
                        STATUSCODE: 403,
                        message: 'Request Forbidden',
                        response_data: {}
                    })
                } else {
                    callBack(result);
                }
            });
        } 
        
    },

    resetPassword: (data, callBack) => {
        if(data.userType == 'customer') {
        async.waterfall([
            function(nextCb) {
                registerModel.customerResetPassword(data, function(result) {
                    nextCb(null, result);
                });
            }
        ], function(err, result) {
            if (err) {
                callBack({
                    success: false,
                    STATUSCODE: 403,
                    message: 'Request Forbidden',
                    response_data: {}
                })
            } else {
                callBack(result);
            }
        });
    } else if(data.userType == 'deliveryboy') {
        async.waterfall([
            function(nextCb) {
                registerModel.deliveryboyResetPassword(data, function(result) {
                    nextCb(null, result);
                });
            }
        ], function(err, result) {
            if (err) {
                callBack({
                    success: false,
                    STATUSCODE: 403,
                    message: 'Request Forbidden',
                    response_data: {}
                })
            } else {
                callBack(result);
            }
        });
    } else if(data.userType == 'vendorowner') {
        async.waterfall([
            function(nextCb) {
                registerModel.vendorownerResetPassword(data, function(result) {
                    nextCb(null, result);
                });
            }
        ], function(err, result) {
            if (err) {
                callBack({
                    success: false,
                    STATUSCODE: 403,
                    message: 'Request Forbidden',
                    response_data: {}
                })
            } else {
                callBack(result);
            }
        });
    }
    },

    resendForgotPassordOtp: (data, callBack) => {
        if(data.userType == 'customer') {
        async.waterfall([
            function(nextCb) {
                registerModel.customerResendForgotPasswordOtp(data, function(result) {
                    nextCb(null, result);
                });
            }
        ], function(err, result) {
            if (err) {
                callBack({
                    success: false,
                    STATUSCODE: 403,
                    message: 'Request Forbidden',
                    response_data: {}
                })
            } else {
                callBack(result);
            }
        });
    } else if(data.userType == 'deliveryboy') {
        async.waterfall([
            function(nextCb) {
                registerModel.deliveryboyResendForgotPasswordOtp(data, function(result) {
                    nextCb(null, result);
                });
            }
        ], function(err, result) {
            if (err) {
                callBack({
                    success: false,
                    STATUSCODE: 403,
                    message: 'Request Forbidden',
                    response_data: {}
                })
            } else {
                callBack(result);
            }
        });
    } else if(data.userType == 'vendorowner') {
        async.waterfall([
            function(nextCb) {
                registerModel.vendorownerResendForgotPasswordOtp(data, function(result) {
                    nextCb(null, result);
                });
            }
        ], function(err, result) {
            if (err) {
                callBack({
                    success: false,
                    STATUSCODE: 403,
                    message: 'Request Forbidden',
                    response_data: {}
                })
            } else {
                callBack(result);
            }
        });
    }
    },

    viewProfile: (data, callBack) => {
        if(data.userType == 'customer') {
        async.waterfall([
            function(nextCb) {
                registerModel.customerViewProfile(data, function(result) {
                    nextCb(null, result);
                });
            }
        ], function(err, result) {
            if (err) {
                callBack({
                    success: false,
                    STATUSCODE: 403,
                    message: 'Request Forbidden',
                    response_data: {}
                })
            } else {
                callBack(result);
            }
        });
    } else if(data.userType == 'deliveryboy') {
        async.waterfall([
            function(nextCb) {
                registerModel.deliveryboyViewProfile(data, function(result) {
                    nextCb(null, result);
                });
            }
        ], function(err, result) {
            if (err) {
                callBack({
                    success: false,
                    STATUSCODE: 403,
                    message: 'Request Forbidden',
                    response_data: {}
                })
            } else {
                callBack(result);
            }
        });
    } else if(data.userType == 'vendorowner') {
        async.waterfall([
            function(nextCb) {
                registerModel.vendorownerViewProfile(data, function(result) {
                    nextCb(null, result);
                });
            }
        ], function(err, result) {
            if (err) {
                callBack({
                    success: false,
                    STATUSCODE: 403,
                    message: 'Request Forbidden',
                    response_data: {}
                })
            } else {
                callBack(result);
            }
        });
    }
    },
    editProfile: (data, callBack) => {
        if(data.userType == 'customer') {
            async.waterfall([
                function(nextCb) {
                    registerModel.customerEditProfile(data, function(result) {
                        nextCb(null, result);
                    });
                }
            ], function(err, result) {
                if (err) {
                    callBack({
                        success: false,
                        STATUSCODE: 403,
                        message: 'Request Forbidden',
                        response_data: {}
                    })
                } else {
                    callBack(result);
                }
            });
        } else if(data.userType == 'deliveryboy') {
            async.waterfall([
                function(nextCb) {
                    registerModel.deliveryboyEditProfile(data, function(result) {
                        nextCb(null, result);
                    });
                }
            ], function(err, result) {
                if (err) {
                    callBack({
                        success: false,
                        STATUSCODE: 403,
                        message: 'Request Forbidden',
                        response_data: {}
                    })
                } else {
                    callBack(result);
                }
            });
        } else if(data.userType == 'vendorowner') {
            async.waterfall([
                function(nextCb) {
                    registerModel.vendorownerEditProfile(data, function(result) {
                        nextCb(null, result);
                    });
                }
            ], function(err, result) {
                if (err) {
                    callBack({
                        success: false,
                        STATUSCODE: 403,
                        message: 'Request Forbidden',
                        response_data: {}
                    })
                } else {
                    callBack(result);
                }
            });
        }
       
    },
    changePassword: (data, callBack) => {
        if(data.userType == 'customer') {
        async.waterfall([
            function(nextCb) {
                registerModel.customerChangePassword(data, function(result) {
                    nextCb(null, result);
                });
            }
        ], function(err, result) {
            if (err) {
                callBack({
                    success: false,
                    STATUSCODE: 403,
                    message: 'Request Forbidden',
                    response_data: {}
                })
            } else {
                callBack(result);
            }
        });
    } else if(data.userType == 'deliveryboy') {
        async.waterfall([
            function(nextCb) {
                registerModel.deliveryboyChangePassword(data, function(result) {
                    nextCb(null, result);
                });
            }
        ], function(err, result) {
            if (err) {
                callBack({
                    success: false,
                    STATUSCODE: 403,
                    message: 'Request Forbidden',
                    response_data: {}
                })
            } else {
                callBack(result);
            }
        });
    } else if(data.userType == 'vendorowner') {
        async.waterfall([
            function(nextCb) {
                registerModel.vendorownerChangePassword(data, function(result) {
                    nextCb(null, result);
                });
            }
        ], function(err, result) {
            if (err) {
                callBack({
                    success: false,
                    STATUSCODE: 403,
                    message: 'Request Forbidden',
                    response_data: {}
                })
            } else {
                callBack(result);
            }
        });
    }
    },
    profileImageUpload: (data, callBack) => {
        if(data.body.userType == 'customer') {
        async.waterfall([
            function(nextCb) {
                registerModel.customerProfileImageUpload(data, function(result) {
                    nextCb(null, result);
                });
            }
        ], function(err, result) {
            if (err) {
                callBack({
                    success: false,
                    STATUSCODE: 403,
                    message: 'Request Forbidden',
                    response_data: {}
                })
            } else {
                callBack(result);
            }
        });
    } else if(data.body.userType == 'deliveryboy') {
        async.waterfall([
            function(nextCb) {
                registerModel.deliveryboyProfileImageUpload(data, function(result) {
                    nextCb(null, result);
                });
            }
        ], function(err, result) {
            if (err) {
                callBack({
                    success: false,
                    STATUSCODE: 403,
                    message: 'Request Forbidden',
                    response_data: {}
                })
            } else {
                callBack(result);
            }
        });
    } else if(data.body.userType == 'vendorowner') {
        async.waterfall([
            function(nextCb) {
                registerModel.vendorownerProfileImageUpload(data, function(result) {
                    nextCb(null, result);
                });
            }
        ], function(err, result) {
            if (err) {
                callBack({
                    success: false,
                    STATUSCODE: 403,
                    message: 'Request Forbidden',
                    response_data: {}
                })
            } else {
                callBack(result);
            }
        });
    }
    }, 
    forgotPasswordAdmin: (data, callBack) => {
            async.waterfall([
                function(nextCb) {
                    registerModel.adminForgotPassword(data, function(result) {
                        nextCb(null, result);
                    });
                }
            ], function(err, result) {
                if (err) {
                    callBack({
                        success: false,
                        STATUSCODE: 403,
                        message: 'Request Forbidden',
                        response_data: {}
                    })
                } else {
                    callBack(result);
                }
            });
        
    },
    resetPasswordAdmin: (data, callBack) => {
        async.waterfall([
            function(nextCb) {
                registerModel.adminResetPassword(data, function(result) {
                    nextCb(null, result);
                });
            }
        ], function(err, result) {
            if (err) {
                callBack({
                    success: false,
                    STATUSCODE: 403,
                    message: 'Request Forbidden',
                    response_data: {}
                })
            } else {
                callBack(result);
            }
        });
    
    },
    changePasswordAdmin: (data, callBack) => {
        async.waterfall([
            function(nextCb) {
                registerModel.adminChangePassword(data, function(result) {
                    nextCb(null, result);
                });
            }
        ], function(err, result) {
            if (err) {
                callBack({
                    success: false,
                    STATUSCODE: 403,
                    message: 'Request Forbidden',
                    response_data: {}
                })
            } else {
                callBack(result);
            }
        });
    
    },
}