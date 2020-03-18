var joi = require('@hapi/joi');

module.exports = {
    addCategoryValidator: async (req, res, next) => {
        const rules = joi.object({
            customerId: joi.string().required().error(new Error('Customer id is required')),
            categoryName: joi.string().required().error(new Error('Category name is required'))
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
    }

    
}

function getExtension(filename) {
    return filename.substring(filename.indexOf('.') + 1);
}