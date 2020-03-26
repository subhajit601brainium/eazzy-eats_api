var joi = require('@hapi/joi');

module.exports = {
    orderListValidator: async (req, res, next) => {
        const rules = joi.object({
            customerId: joi.string().required().error(new Error('customer Id is required')),
            vendorId: joi.string().required().error(new Error('vendor Id is required')),
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