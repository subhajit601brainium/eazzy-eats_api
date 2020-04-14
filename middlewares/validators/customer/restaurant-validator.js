var joi = require('@hapi/joi');

module.exports = {
    customerHomeValidator: async (req, res, next) => {
        var userType = ['CUSTOMER','GUEST']
        const rules = joi.object({
            customerId: joi.string().allow('').optional(),
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
            categoryId: joi.string().allow('').optional(),
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
        const rules = joi.object({
            customerId: joi.string().allow('').optional(),
            appType: joi.string().required().valid(...appTypeVal).error(new Error('App type required')),
            vendorId: joi.string().required().error(new Error('vendor Id is required')),
            deliveryPincode: joi.string().required().error(new Error('Delivery Pincode is required')),
            deliveryHouseNo: joi.string().required().error(new Error('House no or building name is required')),
            deliveryRoad: joi.string().required().error(new Error('Road name, area, colony is required')),
            deliveryCountryCode: joi.string().required().error(new Error('Country code is required')),
            deliveryPhone: joi.string().required().error(new Error('Delivery phone no required')),
            deliveryState: joi.string().required().error(new Error('Delivery state is required')),
            deliveryCity: joi.string().required().error(new Error('Delivery city is required')),
            deliveryLandmark: joi.string().allow('').optional(),
            deliveryName: joi.string().required().error(new Error('Delivery name required')),
            userType: joi.string().valid(...userType).error(new Error('Please send userType')),
            orderType: joi.string().required().error(new Error('Please send orderType')),
            price: joi.string().required().error(new Error('Please enter price')),
            discount: joi.string().allow('').optional(),
            finalPrice: joi.string().required().error(new Error('Please enter final price')),
            specialInstruction: joi.string().allow('').optional(),
            promocodeId: joi.string().allow('').optional(),
            offerId: joi.string().allow('').optional(),
            items: joi.any().required().error(new Error('Item information required')),
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
    }
}