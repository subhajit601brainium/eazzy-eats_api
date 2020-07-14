var joi = require('@hapi/joi');

module.exports = {
    addVendorValidator: async (req, res, next) => {
        const appTypeVal = ["ANDROID", "IOS"];
        const pushType = ["P", "S"];
        console.log(req.body);
        const rules = joi.object({
            restaurantName: joi.string().required().error(new Error('Restaurant name is required')),
            managerName: joi.string().allow('').optional(),
            description: joi.string().allow('').optional(),
            restaurantType: joi.string().required().error(new Error('Restaurant type is required')),
            
            restaurantEmail: joi.string().email().error(new Error('Valid email is required')),
            countryCode: joi.string().required().error(new Error('Country code is required')),
            restaurantPhone: joi.number().integer().error(new Error('Valid phone no is required')),
            latitude: joi.string().required().error(new Error('User latitude required')),
            longitude: joi.string().required().error(new Error('User longitude required')),
            logo:  joi.string().allow('').optional(),
            banner:  joi.string().allow('').optional(),
            offer_banner: joi.string().allow('').optional(),
            licenceImage: joi.string().allow('').optional(),
            isActive: joi.string().allow('').optional(),
            location: joi.string().required().error(new Error('Location is required.')),
            password: joi.string().required().error(new Error('Password is required.')),
            confirmPassword: joi.string().valid(joi.ref('password')).required().error(err => {
                if (err[0].value === undefined || err[0].value === '' || err[0].value === null) {
                    return new Error('Confirm password is required');
                } else if (err[0].value !== req.body.password) {
                    return new Error('Password and confirm password must match');
                }
            }),

            deviceToken: joi.string().required().error(new Error('Device token required')),
            appType: joi.string().required().valid(...appTypeVal).error(new Error('App type required')),
            pushMode: joi.string().required().valid(...pushType).error(new Error('Push mode required'))

            // firstName: joi.string().required().error(new Error('First name is required')),
            // lastName: joi.string().required().error(new Error('Last name is required')),
            // email: joi.string().email().error(new Error('Valid email is required')),
            // phone: joi.number().integer().error(new Error('Valid phone no is required')),
            // location: joi.string().allow('').optional()
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

    addVendorTimeValidator: async (req, res, next) => {
        const rules = joi.object({
            vendorId: joi.string().required().error(new Error('Vendor id is required')),
            restaurantTime: joi.any(),
            licenceImage: joi.string().allow('').optional(),
        });

       // console.log(req.body);
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
    vendorOwnerRegisterValidator: async (req, res, next) => {
        const rules = joi.object({
            vendorId: joi.string().required().error(new Error('Vendor id is required')),
            firstName: joi.string().required().error(new Error('First name is required')),
            lastName: joi.string().required().error(new Error('Last name is required')),
            email: joi.string().email().error(new Error('Valid email is required')),
            phone: joi.number().integer().error(new Error('Valid phone no is required')),
            countryCode: joi.string().required().error(new Error('Country code is required')),
            cityId: joi.string().required().error(new Error('City is reuired')),
            location: joi.string().allow('').optional(),
            password: joi.string().required().error(new Error('Password is required')),
            confirmPassword: joi.string().valid(joi.ref('password')).required().error(err => {
                if (err[0].value === undefined || err[0].value === '' || err[0].value === null) {
                    return new Error('Confirm password is required');
                } else if (err[0].value !== req.body.password) {
                    return new Error('Password and confirm password must match');
                }
            }),
            allowMail: joi.boolean(),
            promoCode: joi.string().allow('').optional(),
            profileImage: joi.string().allow('').optional(),
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
    itemAddValidator: async (req, res, next) => {
        var itemType = ['NON VEG', 'VEG'];
        var discountType = ['FLAT', 'PERCENTAGE','NONE'];
        const rules = joi.object({
            customerId: joi.string().required().error(new Error('Customer id is required')),
            vendorId: joi.string().required().error(new Error('Vendor id is required')),
            categoryId: joi.string().required().error(new Error('Category id is required')),
            itemName: joi.string().required().error(new Error('Item name is required')),
            description: joi.string().allow('').optional(),
            type: joi.string().valid(...itemType).error(new Error('Item Type is required')),
            waitingTime: joi.number().required().error(new Error('Waiting time is required')),
            menuImage: joi.string().allow('').optional(),
            price: joi.number().required().error(new Error('Price is required')),
            itemExtra: joi.string().allow('').optional(),
            itemOption: joi.string().allow('').optional(),
            discountType: joi.string().valid(...discountType).error(new Error('Discount type is required')),
            discountAmount: joi.string().allow(''),
            // validityFrom: joi.string().regex(/^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4}$/).error(new Error('Validity from is required')),
            // validityTo: joi.string().regex(/^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4}$/).error(new Error('Validity to is required'))
            validityFrom: joi.string().allow(''),
            validityTo: joi.string().allow('')
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
    getItem: async (req, res, next) => {
        const rules = joi.object({
            customerId: joi.string().required().error(new Error('Customer id is required')),
            vendorId: joi.string().required().error(new Error('Vendor id is required')),
            itemId: joi.string().required().error(new Error('Item id is required'))
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
    updateItem: async (req, res, next) => {
        var itemType = ['NON VEG', 'VEG'];
        var discountType = ['FLAT', 'PERCENTAGE','NONE'];
        const rules = joi.object({
            customerId: joi.string().required().error(new Error('Customer id is required')),
            vendorId: joi.string().required().error(new Error('Vendor id is required')),
            itemId: joi.string().required().error(new Error('Item id is required')),
            categoryId: joi.string().required().error(new Error('Category id is required')),
            itemName: joi.string().required().error(new Error('Item name is required')),
            description: joi.string().allow('').optional(),
            type: joi.string().valid(...itemType).error(new Error('Item Type is required')),
            waitingTime: joi.number().required().error(new Error('Waiting time is required')),
            menuImage: joi.string().allow('').optional(),
            price: joi.number().required().error(new Error('Price is required')),
            itemExtra: joi.string().allow('').optional(),
            itemOption: joi.string().allow('').optional(),
            discountType: joi.string().valid(...discountType).error(new Error('Discount type is required')),
            discountAmount: joi.string().allow(''),
            validityFrom: joi.string().allow(''),
            validityTo: joi.string().allow('')
            // validityFrom: joi.string().regex(/^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4}$/).error(new Error('Validity from is required')),
            // validityTo: joi.string().regex(/^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4}$/).error(new Error('Validity to is required'))
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
    getItemOptions: async (req, res, next) => {
        const rules = joi.object({
            customerId: joi.string().required().error(new Error('Customer id is required')),
            vendorId: joi.string().required().error(new Error('Vendor id is required'))
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
    updateItemStatus: async (req, res, next) => {
        const rules = joi.object({
            customerId: joi.string().required().error(new Error('Customer id is required')),
            vendorId: joi.string().required().error(new Error('Vendor id is required')),
            itemId: joi.string().required().error(new Error('Item id is required')),
            isActive: joi.boolean().required().error(new Error('Active status is required')),
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
    itemList: async (req, res, next) => {
        const rules = joi.object({
            customerId: joi.string().required().error(new Error('Customer id is required')),
            vendorId: joi.string().required().error(new Error('Vendor id is required')),
            categoryId: joi.string().allow(''),
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
    deleteItem: async (req, res, next) => {
        const rules = joi.object({
            customerId: joi.string().required().error(new Error('Customer id is required')),
            vendorId: joi.string().required().error(new Error('Vendor id is required')),
            itemId: joi.string().required().error(new Error('Item id is required'))
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
    getCategoryValidator: async (req, res, next) => {
        const rules = joi.object({
            customerId: joi.string().required().error(new Error('Customer id is required'))
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
    getVendorDetails: async (req, res, next) => {
        const rules = joi.object({
            customerId: joi.string().required().error(new Error('Customer id is required')),
            vendorId: joi.string().required().error(new Error('Vendor id is required'))
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
    updateVendorReviews: async (req, res, next) => {
        const rules = joi.object({
            customerId: joi.string().required().error(new Error('Customer id is required')),
            vendorId: joi.string().required().error(new Error('Vendor id is required')),
            reviewId: joi.string().required().error(new Error('Review id is required')),
            reply: joi.string().required().error(new Error('Reply is required'))
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
    updateVendorDetails: async (req, res, next) => {
        var preOrderStatus = ['ON', 'OFF'];
        const rules = joi.object({
            customerId: joi.string().required().error(new Error('Customer id is required')),
            vendorId: joi.string().required().error(new Error('Vendor id is required')),
            restaurantName: joi.string().required().error(new Error('Restaurant name is required')),
            managerName: joi.string().allow('').optional(),
            restaurantType: joi.string().required().error(new Error('Restaurant type is required')),
            preOrder: joi.string().allow('').optional()
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
    updateVendorTime: async (req, res, next) => {
        var preOrderStatus = ['ON', 'OFF'];
        const rules = joi.object({
            vendorId: joi.string().required().error(new Error('Vendor id is required')),
            customerId: joi.string().required().error(new Error('Customer id is required')),
            restaurantTime: joi.any(),
            location: joi.string().allow('').optional(),
            latitude: joi.string().required().error(new Error('User latitude required')),
            longitude: joi.string().required().error(new Error('User longitude required')),
            preOrder: joi.string().allow('').optional(),
            restaurantClose : joi.boolean().required().error(new Error('Restaurant close is required')),
        });

       // console.log(req.body);
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
            vendorId: joi.string().required().error(new Error('Vendor id is required')),
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
    updateVendorEmail: async (req, res, next) => {
        console.log(req.body);
        const rules = joi.object({
            customerId: joi.string().required().error(new Error('Customer id is required')),
            vendorId: joi.string().required().error(new Error('Vendor id is required')),
            restaurantEmail: joi.string().email().error(new Error('Valid email is required')),
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
    updateVendorPhone: async (req, res, next) => {
        console.log(req.body);
        const rules = joi.object({
            customerId: joi.string().required().error(new Error('Customer id is required')),
            vendorId: joi.string().required().error(new Error('Vendor id is required')),
            countryCode: joi.string().required().error(new Error('Country code is required')),
            restaurantPhone: joi.number().integer().error(new Error('Valid phone no is required')),
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
    bannerUpload: async (req, res, next) => {
        const rules = joi.object({
            customerId: joi.string().required().error(new Error('Customer id is required')),
            vendorId: joi.string().required().error(new Error('Vendor id is required'))
        });

        const imageRules = joi.object({
            image: joi.object().required().error(new Error('File is required')),
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
        } else {
            next();
        }
    },
    getNotificationData: async (req, res, next) => {
        const rules = joi.object({
            customerId: joi.string().required().error(new Error('Customer id is required')),
            vendorId: joi.string().required().error(new Error('Vendor id is required'))
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
    updateNotificationData: async (req, res, next) => {
        const rules = joi.object({
            customerId: joi.string().required().error(new Error('Customer id is required')),
            vendorId: joi.string().required().error(new Error('Vendor id is required')),
            notificationData: joi.any().allow('')
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
    notificationList: async (req, res, next) => {
        const rules = joi.object({
            customerId: joi.string().required().error(new Error('Customer id is required')),
            vendorId: joi.string().required().error(new Error('Vendor id is required'))
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