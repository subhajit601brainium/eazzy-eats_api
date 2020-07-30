var joi = require('@hapi/joi');

module.exports = {
    customerHomeValidator: async (req, res, next) => {
        var userType = ['CUSTOMER','GUEST']
        const rules = joi.object({
            customerId: joi.string().allow('').optional(),
            userType: joi.string().valid(...userType).error(new Error('Please send userType')),
            latitude: joi.string().required().error(new Error('Latitude required')),
            longitude: joi.string().required().error(new Error('Longitude required')),
            categoryId: joi.string().required().error(new Error('Category Id is required')),
        });

        const value = await rules.validate(req.body);
        if (value.error) {
            res.status(422).json({
                success: false,
                STATUSCODE: 422,
                message: value.error.message
            })
        } else {
            var customerId = req.body.customerId;

            if((userType == 'CUSTOMER') && (customerId == '')) {
                res.status(422).json({
                    success: false,
                    STATUSCODE: 422,
                    message: 'Customer Id is required'
                })
            } else {
                next();
            }
            
        }
    },
    restaurantDetailsValidator: async (req, res, next) => {
        var userType = ['CUSTOMER','GUEST']
        const rules = joi.object({
            customerId: joi.string().allow('').optional(),
            categoryId: joi.string().required().error(new Error('Category Id is required')),
            vendorId: joi.string().required().error(new Error('vendor Id is required')),
            restaurantInfo: joi.string().required().error(new Error('Need Restaurant info')),
            userType: joi.string().valid(...userType).error(new Error('Please send userType')),
            latitude: joi.string().required().error(new Error('Latitude required')),
            longitude: joi.string().required().error(new Error('Longitude required'))
        });

        const value = await rules.validate(req.body);
        if (value.error) {
            res.status(422).json({
                success: false,
                STATUSCODE: 422,
                message: value.error.message
            })
        } else {
            var customerId = req.body.customerId;
            if((userType == 'CUSTOMER') && (customerId == '')) {
                res.status(422).json({
                    success: false,
                    STATUSCODE: 422,
                    message: 'Customer Id is required'
                })
            } else {
                next();
            }
            
        }
    },
    postOrderValidator: async (req, res, next) => {
        var userType = ['CUSTOMER','GUEST']
        const appTypeVal = ["ANDROID", "IOS", "BROWSER"];
        const deliveryPreferenc = ["DELIVERY", "PICKUP"];
        const rules = joi.object({
            customerId: joi.string().allow('').optional(),
            appType: joi.string().required().valid(...appTypeVal).error(new Error('App type required')),
            vendorId: joi.string().required().error(new Error('vendor Id is required')),
            // deliveryPincode: joi.string().required().error(new Error('Delivery Pincode is required')),
            deliveryHouseNo: joi.string().allow('').optional(),
           // deliveryRoad: joi.string().required().error(new Error('Road name, area, colony is required')),
            deliveryCountryCode: joi.string().required().error(new Error('Country code is required')),
            deliveryPhone: joi.string().required().error(new Error('Delivery phone no required')),
           // deliveryState: joi.string().required().error(new Error('Delivery state is required')),
           // deliveryCity: joi.string().required().error(new Error('Delivery city is required')),
            deliveryLandmark: joi.string().allow('').optional(),
           // deliveryName: joi.string().required().error(new Error('Delivery name required')),
           fullAddress: joi.string().required().error(new Error('Full address is required')),
           addressType: joi.string().allow('').optional(),
            userType: joi.string().valid(...userType).error(new Error('Please send userType')),
            deliveryPreference : joi.string().valid(...deliveryPreferenc).required().error(new Error('Please send deliveryPreference')),
            orderType: joi.string().required().error(new Error('Please send orderType')),
            price: joi.string().required().error(new Error('Please enter price')),
            discount: joi.string().allow('').optional(),
            finalPrice: joi.string().required().error(new Error('Please enter final price')),
            specialInstruction: joi.string().allow('').optional(),
            promocodeId: joi.string().allow('').optional(),
            offerId: joi.string().allow('').optional(),
            items: joi.any().required().error(new Error('Item information required')),
            latitude: joi.string().required().error(new Error('Latitude required')),
            longitude: joi.string().required().error(new Error('Longitude required')),
            itemOptions: joi.string().allow('').optional(),
            orderExtras: joi.string().allow('').optional(),
        });

        const value = await rules.validate(req.body);
        if (value.error) {
            res.status(422).json({
                success: false,
                STATUSCODE: 422,
                message: value.error.message
            })
        } else {
            var customerId = req.body.customerId;
            if((userType == 'CUSTOMER') && (customerId == '')) {
                res.status(422).json({
                    success: false,
                    STATUSCODE: 422,
                    message: 'Customer Id is required'
                })
            } else {
                next();
            }
            
        }
    },
    submitReview: async (req, res, next) => {
        var userType = ['CUSTOMER','GUEST']
        const rules = joi.object({
            customerId: joi.string().allow('').optional(),
            userType: joi.string().valid(...userType).error(new Error('Please send userType')),
            vendorId: joi.string().required().error(new Error('vendor Id is required')),
            customerName: joi.string().required().error(new Error('Customer name is required')),
            customerComment: joi.string().required().error(new Error('Customer comment is required')),
            customerRating: joi.number().required().error(new Error('Customer rating is required')),
        });

        const value = await rules.validate(req.body);
        if (value.error) {
            res.status(422).json({
                success: false,
                STATUSCODE: 422,
                message: value.error.message
            })
        } else {
            var customerId = req.body.customerId;
            if((userType == 'CUSTOMER') && (customerId == '')) {
                res.status(422).json({
                    success: false,
                    STATUSCODE: 422,
                    message: 'Customer Id is required'
                })
            } else {
                next();
            }
            
        }
    },
    customerOrderListValidator: async (req, res, next) => {
        var userType = ['CUSTOMER','GUEST']
        var orderStatus = ['ONGOING','PAST']
        const rules = joi.object({
            customerId: joi.string().allow('').optional(),
            userType: joi.string().valid(...userType).error(new Error('Please send userType')),
            orderStatus: joi.string().valid(...orderStatus).error(new Error('Please send orderStatus'))
        });

        const value = await rules.validate(req.body);
        if (value.error) {
            res.status(422).json({
                success: false,
                STATUSCODE: 422,
                message: value.error.message
            })
        } else {
            var customerId = req.body.customerId;
            if((userType == 'CUSTOMER') && (customerId == '')) {
                res.status(422).json({
                    success: false,
                    STATUSCODE: 422,
                    message: 'Customer Id is required'
                })
            } else {
                next();
            }
            
        }
    },
    customerOrderDetailsValidator: async (req, res, next) => {
        var userType = ['CUSTOMER','GUEST']
        const rules = joi.object({
            customerId: joi.string().allow('').optional(),
            userType: joi.string().valid(...userType).error(new Error('Please send userType')),
            orderId: joi.string().required().error(new Error('Please send order Id'))
        });

        const value = await rules.validate(req.body);
        if (value.error) {
            res.status(422).json({
                success: false,
                STATUSCODE: 422,
                message: value.error.message
            })
        } else {
            var customerId = req.body.customerId;
            if((userType == 'CUSTOMER') && (customerId == '')) {
                res.status(422).json({
                    success: false,
                    STATUSCODE: 422,
                    message: 'Customer Id is required'
                })
            } else {
                next();
            }
            
        }
    },
    promoCodeList: async (req, res, next) => {
        var userType = ['CUSTOMER','GUEST']
        const rules = joi.object({
            customerId: joi.string().allow('').optional(),
            userType: joi.string().valid(...userType).error(new Error('Please send userType'))
        });

        const value = await rules.validate(req.body);
        if (value.error) {
            res.status(422).json({
                success: false,
                STATUSCODE: 422,
                message: value.error.message
            })
        } else {
            var customerId = req.body.customerId;
            if((userType == 'CUSTOMER') && (customerId == '')) {
                res.status(422).json({
                    success: false,
                    STATUSCODE: 422,
                    message: 'Customer Id is required'
                })
            } else {
                next();
            }
            
        }
    },
    applyPromoCode: async (req, res, next) => {
        var userType = ['CUSTOMER','GUEST']
        const rules = joi.object({
            customerId: joi.string().allow('').optional(),
            userType: joi.string().valid(...userType).error(new Error('Please send userType')),
            amount: joi.string().required().error(new Error('Amount required')),
            promoCode: joi.string().required().error(new Error('Promo code required')),
        });

        const value = await rules.validate(req.body);
        if (value.error) {
            res.status(422).json({
                success: false,
                STATUSCODE: 422,
                message: value.error.message
            })
        } else {
            var customerId = req.body.customerId;
            if((userType == 'CUSTOMER') && (customerId == '')) {
                res.status(422).json({
                    success: false,
                    STATUSCODE: 422,
                    message: 'Customer Id is required'
                })
            } else {
                next();
            }
            
        }
    },
    customerSearchValidator: async (req, res, next) => {
        var userType = ['CUSTOMER','GUEST']
        const rules = joi.object({
            customerId: joi.string().allow('').optional(),
            userType: joi.string().valid(...userType).error(new Error('Please send userType')),
            latitude: joi.string().required().error(new Error('Latitude required')),
            longitude: joi.string().required().error(new Error('Longitude required')),
            search: joi.string().required().error(new Error('Please enter search value')),
        });

        const value = await rules.validate(req.body);
        if (value.error) {
            res.status(422).json({
                success: false,
                STATUSCODE: 422,
                message: value.error.message
            })
        } else {
            var customerId = req.body.customerId;
            if((userType == 'CUSTOMER') && (customerId == '')) {
                res.status(422).json({
                    success: false,
                    STATUSCODE: 422,
                    message: 'Customer Id is required'
                })
            } else {
                next();
            }
            
        }
    },
    favouriteChange: async (req, res, next) => {
        var userType = ['CUSTOMER']
        var favVal = ['YES','NO']
        const rules = joi.object({
            customerId: joi.string().required().error(new Error('Customer id is required')),
            userType: joi.string().valid(...userType).error(new Error('Guest user is not allowed')),
            vendorId: joi.string().required().error(new Error('Vendor id is required')),
            favourite: joi.string().required().valid(...favVal).error(new Error('Favourite value is required')),
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
    favouriteList: async (req, res, next) => {
        var userType = ['CUSTOMER']
        const rules = joi.object({
            customerId: joi.string().required().error(new Error('Customer id is required')),
            userType: joi.string().valid(...userType).error(new Error('Guest user is not allowed')),
            latitude: joi.string().required().error(new Error('Latitude required')),
            longitude: joi.string().required().error(new Error('Longitude required')),
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
    protectGuestUser: async (req, res, next) => {
        var userType = ['GUEST'];
        var appType = ['Android'];
        const rules = joi.object({
            appType: joi.string().valid(...appType).error(new Error('Only android is allowed')),
            userType: joi.string().valid(...userType).error(new Error('Only guest is allowed')),
        });

        const value = await rules.validate(req.body);
        if (value.error) {
            res.status(422).json({
                success: false,
                STATUSCODE: 422,
                message: value.error.message
            })
        } else {
            var customerId = req.body.customerId;
            if((userType == 'CUSTOMER') && (customerId == '')) {
                res.status(422).json({
                    success: false,
                    STATUSCODE: 422,
                    message: 'Customer Id is required'
                })
            } else {
                next();
            }
        }
    },
    physicalAddressByLatlong: async (req, res, next) => {
        var userType = ['CUSTOMER','GUEST']
        const rules = joi.object({
            customerId: joi.string().allow('').optional(),
            userType: joi.string().valid(...userType).error(new Error('Guest user is not allowed')),
            latitude: joi.string().required().error(new Error('Latitude required')),
            longitude: joi.string().required().error(new Error('Longitude required'))
        });

        const value = await rules.validate(req.body);
        if (value.error) {
            res.status(422).json({
                success: false,
                STATUSCODE: 422,
                message: value.error.message
            })
        } else {
            var customerId = req.body.customerId;
            if((userType == 'CUSTOMER') && (customerId == '')) {
                res.status(422).json({
                    success: false,
                    STATUSCODE: 422,
                    message: 'Customer Id is required'
                })
            } else {
                next();
            }
        }
    },
    addAddress: async (req, res, next) => {
        var userType = ['CUSTOMER']
        const rules = joi.object({
            customerId: joi.string().allow('').optional(),
            userType: joi.string().valid(...userType).error(new Error('Please send userType')),
            fullAddress: joi.string().allow('').optional(),
            houseNo: joi.string().allow('').optional(),
            landMark: joi.string().allow('').optional(),
            phone: joi.string().allow('').optional(),
            countryCode: joi.string().allow('').optional(),
            addressType: joi.string().allow('').optional(),
            latitude: joi.string().required().error(new Error('Latitude required')),
            longitude: joi.string().required().error(new Error('Longitude required'))
        });

        const value = await rules.validate(req.body);
        if (value.error) {
            res.status(422).json({
                success: false,
                STATUSCODE: 422,
                message: value.error.message
            })
        } else {
            var customerId = req.body.customerId;
            if((userType == 'CUSTOMER') && (customerId == '')) {
                res.status(422).json({
                    success: false,
                    STATUSCODE: 422,
                    message: 'Customer Id is required'
                })
            } else {
                next();
            }
            
        }
    },
    editAddress: async (req, res, next) => {
        var userType = ['CUSTOMER']
        const rules = joi.object({
            customerId: joi.string().allow('').optional(),
            userType: joi.string().valid(...userType).error(new Error('Please send userType')),
            addressId: joi.string().required().error(new Error('Address id required')),
            fullAddress: joi.string().allow('').optional(),
            houseNo: joi.string().allow('').optional(),
            landMark: joi.string().allow('').optional(),
            phone: joi.string().allow('').optional(),
            countryCode: joi.string().allow('').optional(),
            addressType: joi.string().allow('').optional(),
            latitude: joi.string().required().error(new Error('Latitude required')),
            longitude: joi.string().required().error(new Error('Longitude required'))
        });

        const value = await rules.validate(req.body);
        if (value.error) {
            res.status(422).json({
                success: false,
                STATUSCODE: 422,
                message: value.error.message
            })
        } else {
            var customerId = req.body.customerId;
            if((userType == 'CUSTOMER') && (customerId == '')) {
                res.status(422).json({
                    success: false,
                    STATUSCODE: 422,
                    message: 'Customer Id is required'
                })
            } else {
                next();
            }
            
        }
    },
    listAddress: async (req, res, next) => {
        var userType = ['CUSTOMER']
        const rules = joi.object({
            customerId: joi.string().allow('').optional(),
            userType: joi.string().valid(...userType).error(new Error('Please send userType'))
        });

        const value = await rules.validate(req.body);
        if (value.error) {
            res.status(422).json({
                success: false,
                STATUSCODE: 422,
                message: value.error.message
            })
        } else {
            var customerId = req.body.customerId;
            if((userType == 'CUSTOMER') && (customerId == '')) {
                res.status(422).json({
                    success: false,
                    STATUSCODE: 422,
                    message: 'Customer Id is required'
                })
            } else {
                next();
            }
            
        }
    },
    deleteAddress: async (req, res, next) => {
        var userType = ['CUSTOMER']
        const rules = joi.object({
            customerId: joi.string().allow('').optional(),
            userType: joi.string().valid(...userType).error(new Error('Please send userType')),
            addressId: joi.string().required().error(new Error('Address id required')),
        });

        const value = await rules.validate(req.body);
        if (value.error) {
            res.status(422).json({
                success: false,
                STATUSCODE: 422,
                message: value.error.message
            })
        } else {
            var customerId = req.body.customerId;
            if((userType == 'CUSTOMER') && (customerId == '')) {
                res.status(422).json({
                    success: false,
                    STATUSCODE: 422,
                    message: 'Customer Id is required'
                })
            } else {
                next();
            }
            
        }
    },
    getNotificationData: async (req, res, next) => {
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
    updateNotificationData: async (req, res, next) => {
        const rules = joi.object({
            customerId: joi.string().required().error(new Error('Customer id is required')),
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
}