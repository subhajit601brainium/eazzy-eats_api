var joi = require('@hapi/joi');

module.exports = {
    addVendorValidator: async (req, res, next) => {
        const rules = joi.object({
            customerId: joi.string().required().error(new Error('Customer id is required')),
            restaurantName: joi.string().required().error(new Error('Restaurant name is required')),
            managerName: joi.string().required().error(new Error('Manager name is required')),
            description: joi.string().allow('').optional(),
            restaurantType: joi.string().required().error(new Error('Restaurant type is required')),
            restaurantEmail: joi.string().email().error(new Error('Valid email is required')),
            restaurantPhone: joi.number().integer().error(new Error('Valid phone no is required')),
            latitude: joi.string().required().error(new Error('User latitude required')),
            longitude: joi.string().required().error(new Error('User longitude required')),
            logo: joi.string().allow('').optional(),
            banner: joi.string().allow('').optional(),
            offer_banner: joi.string().allow('').optional(),
            licenceImage: joi.string().allow('').optional(),
            isActive: joi.string().required().error(new Error('Please select restaurant status.')),

            firstName: joi.string().required().error(new Error('First name is required')),
            lastName: joi.string().required().error(new Error('Last name is required')),
            email: joi.string().email().error(new Error('Valid email is required')),
            phone: joi.number().integer().error(new Error('Valid phone no is required')),
            location: joi.string().allow('').optional()
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
            customerId: joi.string().required().error(new Error('Customer id is required')),
            vendorId: joi.string().required().error(new Error('Vendor id is required')),
            restaurantTime: joi.any(),
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
            customerId: joi.string().required().error(new Error('Customer id is required')),
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
            itemExtra: joi.string().allow('').optional()
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
    getVendorInfoValidator: async (req, res, next) => {
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
    }
    
}