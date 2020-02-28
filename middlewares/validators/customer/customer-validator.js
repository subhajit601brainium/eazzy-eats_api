var joi = require('@hapi/joi');

module.exports = {
    customerRegister: async (req, res, next) => {
        const rules = joi.object({
            firstName: joi.string().required().error(new Error('First name is required')),
            lastName: joi.string().required().error(new Error('Last name is required')),
            email: joi.string().email().error(new Error('Valid email is required')),
            phone: joi.number().integer().error(new Error('Valid phone no is required')),
            socialId: joi.string().allow('').optional(),
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
            loginType: joi.string().allow('').optional(),
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

    customerLogin: async (req, res, next) => {
        const rules = joi.object({
            user: joi.string().required().error(new Error('Email/phone is required')),
            password: joi.string().required().error(new Error('Password is required')),
            userType: joi.string().required().error(new Error('Please send userType'))
        });

        const value = await rules.validate(req.body);
        if (value.error) {
            console.log(value.error);
            res.status(422).json({
                success: false,
                STATUSCODE: 422,
                message: value.error.message
            })
        } else {
            next();
        }
    },

    forgotPasswordEmail: async (req, res, next) => {
        const rules = joi.object({
            email: joi.string().required().email().error((err) => {
                if (err[0].value === undefined || err[0].value === '' || err[0].value === null) {
                    return new Error('Email is required');
                } else {
                    return new Error('Please enter valid email');
                }
            }),
            userType: joi.string().required().error(new Error('Please send userType'))
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
            userType: joi.string().required().error(new Error('Please send userType'))
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
        const rules = joi.object({
            email: joi.string().required().email().error((err) => {
                if (err[0].value === undefined || err[0].value === '' || err[0].value === null) {
                    return new Error('Email is required');
                } else {
                    return new Error('Please enter valid email');
                }
            }),
            userType: joi.string().required().error(new Error('Please send userType'))
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
        const rules = joi.object({
            customerId: joi.string().required().error(new Error('Customer id is required')),
            userType: joi.string().required().error(new Error('Please send userType'))
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
            userType: joi.string().required().error(new Error('Please send userType'))
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
            userType: joi.string().required().error(new Error('Please send userType'))
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
       // console.log(req.body);
       // console.log(req.files);
        const rules = joi.object({
            customerId: joi.string().required().error(new Error('Customer id is required')),
            userType: joi.string().required().error(new Error('Please send userType'))
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
    }
}

function getExtension(filename) {
    return filename.substring(filename.indexOf('.')+1); 
}