var joi = require('@hapi/joi');

module.exports = {
    customerRegister: async (req, res, next) => {
        const appTypeVal = ["ANDROID", "IOS"];
        const pushType = ["P", "S"];
        const rules = joi.object({
            firstName: joi.string().required().error(new Error('First name is required')),
            lastName: joi.string().required().error(new Error('Last name is required')),
            email: joi.string().email().error(new Error('Valid email is required')),
            phone: joi.number().integer().error(new Error('Valid phone no is required')),
            socialId: joi.string().allow('').optional(),
            countryCode: joi.string().required().error(new Error('Country code is required')),
            cityId: joi.string().allow('').optional(),
            location: joi.string().allow('').optional(),
            password: joi.string().allow('').optional(),
            confirmPassword: joi.string().valid(joi.ref('password')).required().error(err => {
                if (err[0].value === undefined || err[0].value === '' || err[0].value === null) {
                    return new Error('Confirm password is required');
                } else if (err[0].value !== req.body.password) {
                    return new Error('Password and confirm password must match');
                }
            }),
            allowMail: joi.boolean(),
            promoCode: joi.string().allow('').optional(),
            loginType: joi.string().allow('').optional(),
            profileImage: joi.string().allow('').optional(),
            deviceToken: joi.string().required().error(new Error('Device token required')),
            appType: joi.string().required().valid(...appTypeVal).error(new Error('App type required')),
            pushMode: joi.string().required().valid(...pushType).error(new Error('Push mode required'))
        });

        const value = await rules.validate(req.body);
        if (value.error) {
            res.status(422).json({
                success: false,
                STATUSCODE: 422,
                message: value.error.message
            })
        } else {
            if ((req.body.socialId == '') && (req.body.password == '')) {
                res.status(422).json({
                    success: false,
                    STATUSCODE: 422,
                    message: 'Password is required'
                });
            } else {
                next();
            }

        }
    },

    customerLogin: async (req, res, next) => {
        const userTypeVal = ["customer", "deliveryboy", "vendorowner", "admin", "vendoradmin"];
        const loginTypeVal = ["FACEBOOK", "GOOGLE", "EMAIL"];
        const appTypeVal = ["ANDROID", "IOS", "BROWSER"];
        const pushType = ["P", "S"];
        const rules = joi.object({
            user: joi.string().required().error(new Error('Email/phone is required')),
            password: joi.string().allow('').optional(),
            userType: joi.string().required().valid(...userTypeVal).error(new Error('Please send valid userType')),
            loginType: joi.string().required().valid(...loginTypeVal).error(new Error('Please send valid loginType')),
            deviceToken: joi.string().error(new Error('Device token required')),
            appType: joi.string().valid(...appTypeVal).error(new Error('App type required')),
            pushMode: joi.string().valid(...pushType).error(new Error('Push mode required'))
        });

        const value = await rules.validate(req.body);
        if (value.error) {
            console.log(value.error);
            res.status(422).json({
                success: false,
                STATUSCODE: 422,
                message: value.error.message
            })
        } else if ((req.body.userType != 'admin') && (req.body.userType != 'vendoradmin')) {
            if ((req.body.deviceToken == '') || (req.body.deviceToken == undefined) || (req.body.appType == '') || (req.body.appType == undefined) || (req.body.pushMode == '') || (req.body.pushMode == undefined)) {
                if ((req.body.deviceToken == '') || (req.body.deviceToken == undefined)) {
                    res.status(422).json({
                        success: false,
                        STATUSCODE: 422,
                        message: 'Device token required'
                    })
                } else if ((req.body.appType == '') || (req.body.appType == undefined)) {
                    res.status(422).json({
                        success: false,
                        STATUSCODE: 422,
                        message: 'App type required'
                    })
                } else if ((req.body.pushMode == '') || (req.body.pushMode == undefined)) {
                    res.status(422).json({
                        success: false,
                        STATUSCODE: 422,
                        message: 'Push mode required'
                    })
                }
            } else {
                next();
            }
        } else {
            next();
        }
    },
    customerVerifyUser: async (req, res, next) => {
        const userTypeVal = ["customer", "deliveryboy", "vendorowner", "admin", "vendoradmin"];
        const loginTypeVal = ["FACEBOOK", "GOOGLE", "EMAIL"];
        const appTypeVal = ["ANDROID", "IOS", "BROWSER"];
        const pushType = ["P", "S"];
        const rules = joi.object({
            userId: joi.string().required().error(new Error('User id is required')),
            verificationCode: joi.string().required().error(new Error('Otp is required')),
            userType: joi.string().required().valid(...userTypeVal).error(new Error('Please send valid userType')),
            deviceToken: joi.string().error(new Error('Device token required')),
            appType: joi.string().valid(...appTypeVal).error(new Error('App type required')),
            pushMode: joi.string().valid(...pushType).error(new Error('Push mode required'))
        });

        const value = await rules.validate(req.body);
        if (value.error) {
            console.log(value.error);
            res.status(422).json({
                success: false,
                STATUSCODE: 422,
                message: value.error.message
            })
        } else if ((req.body.userType != 'admin') && (req.body.userType != 'vendoradmin')) {
            if ((req.body.deviceToken == '') || (req.body.deviceToken == undefined) || (req.body.appType == '') || (req.body.appType == undefined) || (req.body.pushMode == '') || (req.body.pushMode == undefined)) {
                if ((req.body.deviceToken == '') || (req.body.deviceToken == undefined)) {
                    res.status(422).json({
                        success: false,
                        STATUSCODE: 422,
                        message: 'Device token required'
                    })
                } else if ((req.body.appType == '') || (req.body.appType == undefined)) {
                    res.status(422).json({
                        success: false,
                        STATUSCODE: 422,
                        message: 'App type required'
                    })
                } else if ((req.body.pushMode == '') || (req.body.pushMode == undefined)) {
                    res.status(422).json({
                        success: false,
                        STATUSCODE: 422,
                        message: 'Push mode required'
                    })
                }
            } else {
                next();
            }
        } else {
            next();
        }
    },

    forgotPasswordEmail: async (req, res, next) => {
        const userTypeVal = ["customer", "deliveryboy", "vendorowner", "admin", "vendoradmin"];
        const rules = joi.object({
            email: joi.string().required().email().error((err) => {
                if (err[0].value === undefined || err[0].value === '' || err[0].value === null) {
                    return new Error('Email is required');
                } else {
                    return new Error('Please enter valid email');
                }
            }),
            userType: joi.string().required().valid(...userTypeVal).error(new Error('Please send userType'))
        });

        const value = await rules.validate(req.body);
        if (value.error) {
            res.status(422).json({
                success: false,
                STATUSCODE: 422,
                message: value.error.message
            })
        } else {
            next();
        }
    },
    
    forgotEmail: async (req, res, next) => {
        const userTypeVal = ["customer", "deliveryboy", "vendorowner"];
        const rules = joi.object({
            phone: joi.string().required().error(new Error('Please send phone')),
            userType: joi.string().required().valid(...userTypeVal).error(new Error('Please send userType'))
        });

        const value = await rules.validate(req.body);
        if (value.error) {
            res.status(422).json({
                success: false,
                STATUSCODE: 422,
                message: value.error.message
            })
        } else {
            next();
        }
    },

    resetPassword: async (req, res, next) => {
        const userTypeVal = ["customer", "deliveryboy", "vendorowner", "admin"];
        const appTypeVal = ["ANDROID", "IOS", "BROWSER"];
        const pushType = ["P", "S"];
        const rules = joi.object({
            email: joi.string().required().email().error((err) => {
                if (err[0].value === undefined || err[0].value === '' || err[0].value === null) {
                    return new Error('Email is required');
                } else {
                    return new Error('Please enter valid email');
                }
            }),
            password: joi.string().required().error(new Error('Password is required')),
            confirmPassword: joi.string().valid(joi.ref('password')).required().error(err => {
                if (err[0].value === undefined || err[0].value === '' || err[0].value === null) {
                    return new Error('Confirm password is required');
                } else if (err[0].value !== req.body.password) {
                    return new Error('Password and confirm password must match');
                }
            }),
            userType: joi.string().required().valid(...userTypeVal).error(new Error('Please send userType')),
            deviceToken: joi.string().error(new Error('Device token required')),
            appType: joi.string().valid(...appTypeVal).error(new Error('App type required')),
            pushMode: joi.string().valid(...pushType).error(new Error('Push mode required'))
        });

        const value = await rules.validate(req.body);
        if (value.error) {
            res.status(422).json({
                success: false,
                STATUSCODE: 422,
                message: value.error.message
            })
        } else {
            next();
        }
    },
    resetPasswordAdmin: async (req, res, next) => {
        const userTypeVal = ["admin", , "vendoradmin"];
        const rules = joi.object({
            id: joi.string().required().error(new Error('Admin Id is required')),
            password: joi.string().required().error(new Error('Password is required')),
            confirmPassword: joi.string().valid(joi.ref('password')).required().error(err => {
                if (err[0].value === undefined || err[0].value === '' || err[0].value === null) {
                    return new Error('Confirm password is required');
                } else if (err[0].value !== req.body.password) {
                    return new Error('Password and confirm password must match');
                }
            }),
            userType: joi.string().required().valid(...userTypeVal).error(new Error('Please send userType'))
        });

        const value = await rules.validate(req.body);
        if (value.error) {
            res.status(422).json({
                success: false,
                STATUSCODE: 422,
                message: value.error.message
            })
        } else {
            next();
        }
    },

    resendForgotPassOtp: async (req, res, next) => {
        const userTypeVal = ["customer", "deliveryboy", "vendorowner"];
        const rules = joi.object({
            email: joi.string().required().email().error((err) => {
                if (err[0].value === undefined || err[0].value === '' || err[0].value === null) {
                    return new Error('Email is required');
                } else {
                    return new Error('Please enter valid email');
                }
            }),
            userType: joi.string().required().valid(...userTypeVal).error(new Error('Please send userType'))
        });

        const value = await rules.validate(req.body);
        if (value.error) {
            res.status(422).json({
                success: false,
                STATUSCODE: 422,
                message: value.error.message
            })
        } else {
            next();
        }
    },
    viewProfile: async (req, res, next) => {
        const userTypeVal = ["customer", "deliveryboy", "vendorowner"];
        const rules = joi.object({
            customerId: joi.string().required().error(new Error('Customer id is required')),
            userType: joi.string().required().valid(...userTypeVal).error(new Error('Please send userType'))
        });

        const value = await rules.validate(req.body);
        if (value.error) {
            res.status(422).json({
                success: false,
                STATUSCODE: 422,
                message: value.error.message
            })
        } else {
            next();
        }
    },
    editProfile: async (req, res, next) => {
        const userTypeVal = ["customer", "deliveryboy", "vendorowner"];
        const rules = joi.object({
            customerId: joi.string().required().error(new Error('Customer id is required')),
            firstName: joi.string().required().error(new Error('First name is required')),
            lastName: joi.string().required().error(new Error('Last name is required')),
            countryCode: joi.string().required().error(new Error('Country code is required')),
            email: joi.string().required().email().error((err) => {
                if (err[0].value === undefined || err[0].value === '' || err[0].value === null) {
                    return new Error('Email is required');
                } else {
                    return new Error('Please enter valid email');
                }
            }),
            phone: joi.number().required().error((err) => {
                if (err[0].value === undefined || err[0].value === '' || err[0].value === null) {
                    return new Error('Phone is required');
                } else if (typeof err[0].value === 'string') {
                    return new Error('Please enter valid phone');
                }
            }),
            userType: joi.string().required().valid(...userTypeVal).error(new Error('Please send userType')),
            loginType: joi.string().required().error(new Error('Please send valid loginType'))
        });

        const value = await rules.validate(req.body);
        if (value.error) {
            res.status(422).json({
                success: false,
                STATUSCODE: 422,
                message: value.error.message
            })
        } else {
            next();
        }
    },
    changePassword: async (req, res, next) => {
        const userTypeVal = ["customer", "deliveryboy", "vendorowner", "admin", "vendoradmin"];
        const rules = joi.object({
            customerId: joi.string().required().error(new Error('Customer id is required')),
            oldPassword: joi.string().required().error(new Error('Old password is required')),
            newPassword: joi.string().required().error(err => {
                if (err[0].value === undefined || err[0].value === '' || err[0].value === null) {
                    return new Error('New password is required');
                } else if (err[0].value == req.body.oldPassword) {
                    return new Error('New password and new password must not match');
                }
            }),
            confirmPassword: joi.string().valid(joi.ref('newPassword')).required().error(err => {
                if (err[0].value === undefined || err[0].value === '' || err[0].value === null) {
                    return new Error('Confirm password is required');
                } else if (err[0].value !== req.body.newPassword) {
                    return new Error('New password and confirm password must match');
                }
            }),
            userType: joi.string().required().valid(...userTypeVal).error(new Error('Please send userType'))
        });

        const value = await rules.validate(req.body);
        if (value.error) {
            res.status(422).json({
                success: false,
                STATUSCODE: 422,
                message: value.error.message
            })
        } else {
            next();
        }
    },
    profileImageUpload: async (req, res, next) => {
        const userTypeVal = ["customer", "deliveryboy", "vendorowner"];
        const rules = joi.object({
            customerId: joi.string().required().error(new Error('Customer id is required')),
            userType: joi.string().required().valid(...userTypeVal).error(new Error('Please send userType'))
        });
        const imageRules = joi.object({
            image: joi.object().required().error(new Error('Image is required')),
        });

        const value = await rules.validate(req.body);
        const imagevalue = await imageRules.validate(req.files);

        if (value.error) {
            res.status(422).json({
                success: false,
                STATUSCODE: 422,
                message: value.error.message
            })
        } else if (imagevalue.error) {
            res.status(422).json({
                success: false,
                STATUSCODE: 422,
                message: 'Image is required'
            })
        } else if (!["jpg", "jpeg", "bmp", "gif", "png"].includes(getExtension(req.files.image.name))) {
            res.status(422).json({
                success: false,
                STATUSCODE: 422,
                message: 'Invalid image format.'
            })
        } else {
            next();
        }
    },
    logout: async (req, res, next) => {
        const userTypeVal = ["customer", "deliveryboy", "vendorowner", "admin", "vendoradmin"];
        const rules = joi.object({
            customerId: joi.string().required().error(new Error('Customer id is required')),
            loginId: joi.string().required().error(new Error('Login id is required')),
            userType: joi.string().required().valid(...userTypeVal).error(new Error('Please send userType'))
        });

        const value = await rules.validate(req.body);
        if (value.error) {
            res.status(422).json({
                success: false,
                STATUSCODE: 422,
                message: value.error.message
            })
        } else {
            next();
        }
    },
    devicePush: async (req, res, next) => {
        const userTypeVal = ["customer", "deliveryboy", "vendorowner", "admin", "vendoradmin"];
        const appTypeVal = ["ANDROID", "IOS", "BROWSER"];
        const pushType = ["P", "S"];
        const rules = joi.object({
            customerId: joi.string().required().error(new Error('Customer id is required')),
            userType: joi.string().required().valid(...userTypeVal).error(new Error('Please send userType')),
            deviceToken: joi.string().required().error(new Error('Device token required')),
            loginId: joi.string().required().error(new Error('Login id is required')),
            appType: joi.string().required().valid(...appTypeVal).error(new Error('App type required')),
            pushMode: joi.string().required().valid(...pushType).error(new Error('Push mode required'))
        });

        const value = await rules.validate(req.body);
        if (value.error) {
            res.status(422).json({
                success: false,
                STATUSCODE: 422,
                message: value.error.message
            })
        } else {
            next();
        }
    },
    verifyUser: async (req, res, next) => {
        const verifyType = ["EMAIL", "PHONE"];
        const rules = joi.object({
            customerId: joi.string().required().error(new Error('Customer id is required')),
            verifyType: joi.string().valid(...verifyType).error(new Error('Verify Type is required')),
        });

        const value = await rules.validate(req.body);
        if (value.error) {
            res.status(422).json({
                success: false,
                STATUSCODE: 422,
                message: value.error.message
            })
        } else {
            next();
        } 
    },
    updateUserEmail: async (req, res, next) => {
        console.log(req.body);
        const rules = joi.object({
            customerId: joi.string().required().error(new Error('Customer id is required')),
            email: joi.string().email().error(new Error('Valid email is required')),
        });

        const value = await rules.validate(req.body);
        if (value.error) {
            res.status(422).json({
                success: false,
                STATUSCODE: 422,
                message: value.error.message
            })
        } else {
            next();
        } 
    },
    updateUserPhone: async (req, res, next) => {
        console.log(req.body);
        const rules = joi.object({
            customerId: joi.string().required().error(new Error('Customer id is required')),
            countryCode: joi.string().required().error(new Error('Country code is required')),
            phone: joi.number().integer().error(new Error('Valid phone no is required')),
        });

        const value = await rules.validate(req.body);
        if (value.error) {
            res.status(422).json({
                success: false,
                STATUSCODE: 422,
                message: value.error.message
            })
        } else {
            next();
        } 
    },
}

function getExtension(filename) {
    return filename.substring(filename.indexOf('.') + 1);
}