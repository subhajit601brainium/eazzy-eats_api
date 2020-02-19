var async = require('async');
var jwt = require('jsonwebtoken');
var customerSchema = require('../../schema/Customer');
const config = require('../../config');
const mail = require('../../modules/sendEmail');
var bcrypt = require('bcryptjs');

module.exports = {
    customerRegistration: (data, callBack) => {
        if (data) {
            async.waterfall([
                function(nextCb) {
                    /** Check for customer existence */
                    customerSchema.countDocuments({email: data.email}).exec(function(err, count) {
                        if (err) {
                            nextCb(null, {
                                success: false,
                                STATUSCODE: 500,
                                message: 'Internal DB error',
                                response_data: {}
                            });
                        } else {
                            if (count) {
                                nextCb(null, {
                                    success: false,
                                    STATUSCODE: 422,
                                    message: 'User already exists for this email',
                                    response_data: {}
                                });
                            } else {
                                nextCb(null, {
                                    success: true,
                                    STATUSCODE: 200,
                                    message: 'success',
                                    response_data: {}
                                })
                            }
                        }
                    })
                },
                function(arg1, nextCb) {
                    if (arg1.STATUSCODE === 200) {
                        new customerSchema(data).save(function(err, result) {
                            if (err) {
                                nextCb(null, {
                                    success: false,
                                    STATUSCODE: 500,
                                    message: 'Internal DB error',
                                    response_data: {}
                                });
                            } else {
                                const authToken = generateToken(result);
                                let response = {
                                    userDetails: {
                                        firstName: result.firstName,
                                        lastName: result.lastName,
                                        email: result.email,
                                        phone: result.phone,
                                        cityId: result.cityId,
                                        location: result.location,
                                        profileImage: result.profileImage,
                                        id: result._id
                                    },
                                    authToken: authToken
                                }

                                nextCb(null, {
                                    success: true,
                                    STATUSCODE: 200,
                                    message: 'Registration Successfull',
                                    response_data: response
                                })

                            }
                        })
                    } else {
                        nextCb(null, arg1);
                    }
                },
                function(arg2, nextCb) {
                    if (arg2.STATUSCODE === 200) {
                        /** Send Registration Email */
                        mail('userRegistrationMail')(arg2.response_data.userDetails.email, arg2.response_data.userDetails).send();
                        nextCb(null, arg2);
                    } else {
                        nextCb(null, arg2);
                    }
                }
            ], function(err, result) {
                if (err) {
                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Internal DB error',
                        response_data: {}
                    });
                } else {
                    callBack(result);
                }
            })
        }
    },

    customerLogin: (data,  callBack) => {
        if (data) {
            customerSchema.findOne({email: data.email}, function(err, result) {
                if (err) {
                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Internal DB error',
                        response_data: {}
                    });
                } else {
                    if (result) {
                        const comparePass = bcrypt.compareSync(data.password, result.password);
                        if (comparePass) {
                            const authToken = generateToken(result);
                            let response = {
                                userDetails: {
                                    firstName: result.firstName,
                                    lastName: result.lastName,
                                    email: result.email,
                                    phone: result.phone,
                                    cityId: result.cityId,
                                    location: result.location,
                                    profileImage: result.profileImage,
                                    id: result._id
                                },
                                authToken: authToken
                            }

                            callBack({
                                success: true,
                                STATUSCODE: 200,
                                message: 'Login Successfull',
                                response_data: response
                            })
                        } else {
                            callBack({
                                success: false,
                                STATUSCODE: 422,
                                message: 'Invalid email or password',
                                response_data: {}
                            });
                        }
                    } else {
                        callBack({
                            success: false,
                            STATUSCODE: 422,
                            message: 'Invalid email or password',
                            response_data: {}
                        });
                    }
                }
            })
        }
    },

    forgotPassword: (data, callBack) => {
        if (data) {
            customerSchema.findOne({email: data.email}, function(err, customer) {
                if (err) {
                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Internal DB error',
                        response_data: {}
                    });
                } else {
                    if (customer) {
                        let forgotPasswordOtp = Math.random().toString().replace('0.', '').substr(0, 4);
                        customer = customer.toObject();
                        customer.forgotPasswordOtp = forgotPasswordOtp;
                        try {
                            mail('forgotPasswordMail')(customer.email, customer).send();
                            callBack({
                                success: false,
                                STATUSCODE: 200,
                                message: 'Please check your email. We have sent a code to be used to reset password.',
                                response_data: {
                                    email: customer.email,
                                    forgotPassOtp: forgotPasswordOtp 
                                }
                            });
                        } catch (Error) {
                            console.log('Something went wrong while sending email');
                        }
                    } else {
                        callBack({
                            success: false,
                            STATUSCODE: 422,
                            message: 'User not found',
                            response_data: {}
                        });
                    }
                }
            })
        }
    },

    resetPassword: (data, callBack) => {
        if (data) {
            customerSchema.findOne({email: data.email}, {_id: 1}, function(err, customer) {
                if (err) {
                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Internal DB error',
                        response_data: {}
                    });
                } else {
                    if (customer) {
                        bcrypt.hash(data.password, 8, function(err, hash) {
                            if (err) {
                                callBack({
                                    success: false,
                                    STATUSCODE: 500,
                                    message: 'Something went wrong while setting the password',
                                    response_data: {}
                                });
                            } else {
                                customerSchema.update({_id: customer._id}, {
                                    $set: {
                                        password: hash
                                    }
                                }, function(err, res) {
                                    if (err) {
                                        callBack({
                                            success: false,
                                            STATUSCODE: 500,
                                            message: 'Internal DB error',
                                            response_data: {}
                                        });
                                    } else {
                                        callBack({
                                            success: true,
                                            STATUSCODE: 200,
                                            message: 'Password updated successfully',
                                            response_data: {}
                                        });
                                    }
                                })
                            }
                        })
                    } else {
                        callBack({
                            success: false,
                            STATUSCODE: 422,
                            message: 'User not found',
                            response_data: {}
                        });
                    }
                }
            })
        }
    },

    resendForgotPasswordOtp: (data, callBack) => {
        if (data) {
            customerSchema.findOne({email: data.email}, function(err, customer) {
                if (err) {
                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Internal DB error',
                        response_data: {}
                    });
                } else {
                    if (customer) {
                        let forgotPasswordOtp = Math.random().toString().replace('0.', '').substr(0, 4);
                        customer = customer.toObject();
                        customer.forgotPasswordOtp = forgotPasswordOtp;
                        try {
                            mail('forgotPasswordMail')(customer.email, customer).send();
                            callBack({
                                success: false,
                                STATUSCODE: 200,
                                message: 'Please check your email. We have sent a code to be used to reset password.',
                                response_data: {
                                    email: customer.email,
                                    forgotPassOtp: forgotPasswordOtp 
                                }
                            });
                        } catch (Error) {
                            console.log('Something went wrong while sending email');
                        }
                    } else {
                        callBack({
                            success: false,
                            STATUSCODE: 422,
                            message: 'User not found',
                            response_data: {}
                        });
                    }
                }
            })  
        }
    }
}

function generateToken(userData) {
    let payload = { subject: userData._id, user: 'CUSTOMER' };
    return jwt.sign(payload, config.secretKey, {expiresIn : '24h'})
}