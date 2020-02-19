var joi = require('@hapi/joi');

module.exports = {
    addSateValidator: async (req, res, next) => {
        const rules = joi.object({
            name: joi.string().required().error(new Error('State name is required'))
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