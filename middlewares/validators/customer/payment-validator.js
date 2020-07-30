var joi = require('@hapi/joi');

module.exports = {
    paymentInitialize: async (req, res, next) => {
        var userType = ['CUSTOMER','GUEST']
        const rules = joi.object({
            customerId: joi.string().allow('').optional(),
            userType: joi.string().valid(...userType).error(new Error('Guest user is not allowed')),
            amount: joi.string().required().error(new Error('Amount required')),
            email: joi.string().email().error(new Error('Valid email is required'))
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
    }
}