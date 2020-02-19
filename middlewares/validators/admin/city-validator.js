var joi = require('@hapi/joi');

module.exports = {
    addCityValidator: async (req, res, next) => {
        const rules = joi.object({
            stateId: joi.string().required().error(new Error('State is required')),
            name: joi.string().required().error(new Error('City name is required'))
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

    getCityByStateValidator: async (req, res, next) => {
        const rules = joi.object({
            stateId: joi.string().required().error(new Error('State is required')),
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