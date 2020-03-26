var async = require('async');
var jwt = require('jsonwebtoken');
var customerSchema = require('../../schema/Customer');
var deliveryBoySchema = require('../../schema/DeliveryBoy');
var vendorOwnerSchema = require('../../schema/VendorOwner');
const config = require('../../config');
const mail = require('../../modules/sendEmail');
var bcrypt = require('bcryptjs');

module.exports = {
    //Customer 
    customerRegistration: (data, callBack) => {
        if (data) {
            async.waterfall([
                function (nextCb) {
                    if (data.socialId != '') {

                        /** Check for customer existence */
                        customerSchema.countDocuments({ socialId: data.socialId }).exec(function (err, count) {
                            if (err) {
                                console.log(err);
                                nextCb(null, {
                                    success: false,
                                    STATUSCODE: 500,
                                    message: 'Internal DB error',
                                    response_data: {}
                                });
                            } if (count) {
                                console.log(count);
                                nextCb(null, {
                                    success: false,
                                    STATUSCODE: 422,
                                    message: 'User already exists for this information.',
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
                        });

                    } else {
                        /** Check for customer existence */
                        customerSchema.countDocuments({ email: data.email, loginType: 'GENERAL' }).exec(function (err, count) {
                            if (err) {
                                console.log(err);
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
                                    customerSchema.countDocuments({ phone: data.phone, loginType: 'GENERAL' }).exec(function (err, count) {
                                        if (err) {
                                            console.log(err);
                                            nextCb(null, {
                                                success: false,
                                                STATUSCODE: 500,
                                                message: 'Internal DB error',
                                                response_data: {}
                                            });

                                        } if (count) {
                                            nextCb(null, {
                                                success: false,
                                                STATUSCODE: 422,
                                                message: 'User already exists for this phone no.',
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
                                    });
                                }
                            }
                        })

                    }
                },
                function (arg1, nextCb) {
                    if (arg1.STATUSCODE === 200) {
                        var customerdata = data;
                        new customerSchema(customerdata).save(async function (err, result) {
                            if (err) {
                                console.log(err);
                                nextCb(null, {
                                    success: false,
                                    STATUSCODE: 500,
                                    message: 'Internal DB error',
                                    response_data: {}
                                });
                            } else {
                                //Developer: Subhajit Singha
                                //Date: 20/02/2020
                                //Description: Update Login Type
                                var loginType = data.loginType;

                                if ((data.loginType == undefined) || (data.loginType == '')) { //IF NO SOCIAL SIGN UP THEN GENERAL LOGIN
                                    loginType = 'GENERAL';
                                }

                                const authToken = generateToken(result);

                                if (data.profileImage != '') { // IF SOCIAL PROFILE PIC PRESENT THEN UPLOAD IT IN OUR SERVER

                                    const download = require('image-downloader')

                                    // Download to a directory and save with the original filename
                                    const options = {
                                        url: data.profileImage,
                                        dest: `public/img/profile-pic/`   // Save to /path/to/dest/image.jpg
                                    }
                                    const FileType = require('file-type');
                                    download.image(options)
                                        .then(({ filename, image }) => {
                                            (async () => {
                                                var fileInfo = await FileType.fromFile(filename);
                                                var fileExt = fileInfo.ext;
                                                // console.log(fileExt);

                                                var fs = require('fs');

                                                var file_name = `customerprofile-${Math.floor(Math.random() * 1000)}-${Math.floor(Date.now() / 1000)}.${fileExt}`;

                                                let image_path = `public/img/profile-pic/${file_name}`;

                                                fs.rename(filename, image_path, function (err) { //RENAME THE FILE
                                                    if (err) console.log('ERROR: ' + err);
                                                })
                                                updateUser({ //UPDATE THE DATA IN DB
                                                    profileImage: file_name
                                                }, { _id: result._id });

                                                var response = {
                                                    userDetails: {
                                                        firstName: result.firstName,
                                                        lastName: result.lastName,
                                                        email: result.email,
                                                        phone: result.phone.toString(),
                                                        socialId: result.socialId,
                                                        id: result._id,
                                                        profileImage: `${config.serverhost}:${config.port}/img/profile-pic/` + file_name,
                                                        userType: 'customer',
                                                        loginType: loginType
                                                    },
                                                    authToken: authToken
                                                }

                                                updateUser({
                                                    loginType: loginType
                                                }, { _id: result._id });

                                                nextCb(null, {
                                                    success: true,
                                                    STATUSCODE: 200,
                                                    message: 'Registration Successfull',
                                                    response_data: response
                                                })

                                            })();
                                        })
                                } else {
                                    var response = {
                                        userDetails: {
                                            firstName: result.firstName,
                                            lastName: result.lastName,
                                            email: result.email,
                                            phone: result.phone.toString(),
                                            socialId: result.socialId,
                                            id: result._id,
                                            profileImage: '',
                                            userType: 'customer',
                                            loginType: loginType
                                        },
                                        authToken: authToken
                                    }

                                    updateUser({
                                        loginType: loginType
                                    }, { _id: result._id });

                                    nextCb(null, {
                                        success: true,
                                        STATUSCODE: 200,
                                        message: 'Registration Successfull',
                                        response_data: response
                                    })
                                }




                            }
                        })
                    } else {
                        nextCb(null, arg1);
                    }
                },
                function (arg2, nextCb) {
                    if (arg2.STATUSCODE === 200) {
                        /** Send Registration Email */
                        mail('userRegistrationMail')(arg2.response_data.userDetails.email, arg2.response_data.userDetails).send();
                        nextCb(null, arg2);
                    } else {
                        nextCb(null, arg2);
                    }
                }
            ], function (err, result) {
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
    customerLogin: (data, callBack) => {
        if (data) {

            var loginUser = '';


            if (data.loginType != 'EMAIL') {
                loginUser = 'SOCIAL';
                var loginCond = { socialId: data.user };
            } else {
                if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(data.user)) {
                    var loginCond = { email: data.user,loginType: 'GENERAL'};
                    loginUser = 'EMAIL';
                } else {
                    var loginCond = { phone: data.user,loginType: 'GENERAL'};
                    loginUser = 'PHONE';
                }
            }

            customerSchema.findOne(loginCond, function (err, result) {
                if (err) {
                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Internal DB error',
                        response_data: {}
                    });
                } else {
                    if (result) {
                        if (loginUser == 'SOCIAL') { //IF SOCIAL LOGIN THEN NO NEED TO CHECK THE PASSWORD 
                            const authToken = generateToken(result);
                            let response = {
                                userDetails: {
                                    firstName: result.firstName,
                                    lastName: result.lastName,
                                    email: result.email,
                                    phone: result.phone.toString(),
                                    socialId: result.socialId,
                                    id: result._id,
                                    profileImage: `${config.serverhost}:${config.port}/img/profile-pic/` + result.profileImage,
                                    userType: data.userType,
                                    loginType: data.loginType
                                },
                                authToken: authToken
                            }

                            callBack({
                                success: true,
                                STATUSCODE: 200,
                                message: 'Login Successfull',
                                response_data: response
                            })

                        } else { //NORMAL LOGIN
                            console.log('hello');
                            if ((data.password == '') || (data.password == undefined)) {
                                callBack({
                                    success: false,
                                    STATUSCODE: 422,
                                    message: 'Password is required',
                                    response_data: {}
                                });
                            } else {
                                const comparePass = bcrypt.compareSync(data.password, result.password);
                                if (comparePass) {
                                    const authToken = generateToken(result);
                                    let response = {
                                        userDetails: {
                                            firstName: result.firstName,
                                            lastName: result.lastName,
                                            email: result.email,
                                            phone: result.phone.toString(),
                                            socialId: result.socialId,
                                            id: result._id,
                                            profileImage: `${config.serverhost}:${config.port}/img/profile-pic/` + result.profileImage,
                                            userType: data.userType,
                                            loginType: data.loginType
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
                            }
                        }
                    } else {
                        if ((data.loginType != 'EMAIL') && (loginUser == 'SOCIAL')) {
                            callBack({
                                success: true,
                                STATUSCODE: 201,
                                message: 'New User',
                                response_data: {}
                            });
                        } else {
                            callBack({
                                success: false,
                                STATUSCODE: 422,
                                message: 'Invalid email or password',
                                response_data: {}
                            });
                        }

                    }
                }
            })
        }
    },
    customerForgotPassword: (data, callBack) => {
        if (data) {
            customerSchema.findOne({ email: data.email, loginType: 'GENERAL' }, function (err, customer) {
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
    customerResetPassword: (data, callBack) => {
        if (data) {
            customerSchema.findOne({ email: data.email, loginType: 'GENERAL' }, { _id: 1 }, function (err, customer) {
                if (err) {
                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Internal DB error',
                        response_data: {}
                    });
                } else {
                    if (customer) {
                        bcrypt.hash(data.password, 8, function (err, hash) {
                            if (err) {
                                callBack({
                                    success: false,
                                    STATUSCODE: 500,
                                    message: 'Something went wrong while setting the password',
                                    response_data: {}
                                });
                            } else {
                                customerSchema.update({ _id: customer._id }, {
                                    $set: {
                                        password: hash
                                    }
                                }, function (err, res) {
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
    customerResendForgotPasswordOtp: (data, callBack) => {
        if (data) {
            customerSchema.findOne({ email: data.email, loginType: 'GENERAL' }, function (err, customer) {
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
    customerViewProfile: (data, callBack) => {
        if (data) {

            customerSchema.findOne({ _id: data.customerId }, function (err, customer) {
                if (err) {
                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Internal DB error',
                        response_data: {}
                    });
                } else {
                    if (customer) {
                        let response = {
                            firstName: customer.firstName,
                            lastName: customer.lastName,
                            email: customer.email,
                            phone: customer.phone.toString(),
                            countryCode: customer.countryCode
                        }

                        if (customer.profileImage != '') {
                            response.profileImage = `${config.serverhost}:${config.port}/img/profile-pic/` + customer.profileImage
                        } else {
                            response.profileImage = ''
                        }
                        callBack({
                            success: true,
                            STATUSCODE: 200,
                            message: 'User profile fetched successfully',
                            response_data: response
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
            });

        }
    },
    customerEditProfile: (data, callBack) => {
        if (data) {
            /** Check for customer existence */
            console.log(data.customerId);
            console.log(data.email);
            customerSchema.countDocuments({ email: data.email, loginType: data.loginType, _id: { $ne: data.customerId } }).exec(function (err, count) {
                if (err) {
                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Internal DB error',
                        response_data: {}
                    });
                } else {
                    if (count) {
                        callBack({
                            success: false,
                            STATUSCODE: 422,
                            message: 'User already exists for this email',
                            response_data: {}
                        });
                    } else {
                        customerSchema.countDocuments({ phone: data.phone, loginType: data.loginType, _id: { $ne: data.customerId } }).exec(function (err, count) {
                            if (err) {
                                callBack({
                                    success: false,
                                    STATUSCODE: 500,
                                    message: 'Internal DB error',
                                    response_data: {}
                                });

                            } if (count) {
                                callBack({
                                    success: false,
                                    STATUSCODE: 422,
                                    message: 'User already exists for this phone no.',
                                    response_data: {}
                                });
                            } else {

                                let updateData = {
                                    firstName: data.firstName,
                                    lastName: data.lastName,
                                    email: data.email,
                                    phone: data.phone,
                                    countryCode: data.countryCode,
                                }

                                updateUser(updateData, { _id: data.customerId });

                                callBack({
                                    success: true,
                                    STATUSCODE: 200,
                                    message: 'User updated Successfully',
                                    response_data: {}
                                })

                            }
                        })
                    }
                }
            });
        }
    },
    customerChangePassword: (data, callBack) => {
        if (data) {

            customerSchema.findOne({ _id: data.customerId }, function (err, result) {
                if (err) {
                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Internal DB error',
                        response_data: {}
                    });
                } else {
                    if (result) {
                        const comparePass = bcrypt.compareSync(data.oldPassword, result.password);
                        if (comparePass) {

                            bcrypt.hash(data.newPassword, 8, function (err, hash) {
                                if (err) {
                                    callBack({
                                        success: false,
                                        STATUSCODE: 500,
                                        message: 'Something went wrong while setting the password',
                                        response_data: {}
                                    });
                                } else {
                                    customerSchema.update({ _id: data.customerId }, {
                                        $set: {
                                            password: hash
                                        }
                                    }, function (err, res) {
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
                                message: 'Invalid old password',
                                response_data: {}
                            });
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
            });




        }
    },
    customerProfileImageUpload: (data, callBack) => {
        if (data) {

            customerSchema.findOne({ _id: data.body.customerId }, function (err, result) {
                if (err) {
                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Internal DB error',
                        response_data: {}
                    });
                } else {
                    if (result) {
                        if (result.profileImage != '') {
                            var fs = require('fs');
                            var filePath = `public/img/profile-pic/${result.profileImage}`;
                            fs.unlink(filePath, (err) => { });
                        }

                        //Get image extension
                        var ext = getExtension(data.files.image.name);

                        // The name of the input field (i.e. "image") is used to retrieve the uploaded file
                        let sampleFile = data.files.image;

                        var file_name = `customerprofile-${Math.floor(Math.random() * 1000)}-${Math.floor(Date.now() / 1000)}.${ext}`;

                        // Use the mv() method to place the file somewhere on your server
                        sampleFile.mv(`public/img/profile-pic/${file_name}`, function (err) {
                            if (err) {
                                callBack({
                                    success: false,
                                    STATUSCODE: 500,
                                    message: 'Internal error',
                                    response_data: {}
                                });
                            } else {
                                updateUser({ profileImage: file_name }, { _id: data.body.customerId });
                                callBack({
                                    success: true,
                                    STATUSCODE: 200,
                                    message: 'Profile image updated Successfully',
                                    response_data: {}
                                })
                            }
                        });
                    }
                }
            });


        }
    },
    //Delivery Boy
    deliveryboyLogin: (data, callBack) => {
        if (data) {
            if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(data.user)) {
                var loginCond = { email: data.user };
            } else {
                var loginCond = { phone: data.user };
            }

            deliveryBoySchema.findOne(loginCond, function (err, result) {
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
                                    phone: result.phone.toString(),
                                    cityId: result.cityId,
                                    location: result.location,
                                    id: result._id,
                                    profileImage: `${config.serverhost}:${config.port}/img/profile-pic/` + result.profileImage
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
    deliveryboyForgotPassword: (data, callBack) => {
        if (data) {
            deliveryBoySchema.findOne({ email: data.email}, function (err, customer) {
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
    deliveryboyResetPassword: (data, callBack) => {
        if (data) {
            deliveryBoySchema.findOne({ email: data.email }, { _id: 1 }, function (err, customer) {
                if (err) {
                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Internal DB error',
                        response_data: {}
                    });
                } else {
                    if (customer) {
                        bcrypt.hash(data.password, 8, function (err, hash) {
                            if (err) {
                                callBack({
                                    success: false,
                                    STATUSCODE: 500,
                                    message: 'Something went wrong while setting the password',
                                    response_data: {}
                                });
                            } else {
                                deliveryBoySchema.update({ _id: customer._id }, {
                                    $set: {
                                        password: hash
                                    }
                                }, function (err, res) {
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
    deliveryboyResendForgotPasswordOtp: (data, callBack) => {
        if (data) {
            deliveryBoySchema.findOne({ email: data.email }, function (err, customer) {
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
    deliveryboyViewProfile: (data, callBack) => {
        if (data) {

            deliveryBoySchema.findOne({ _id: data.customerId }, function (err, customer) {
                if (err) {
                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Internal DB error',
                        response_data: {}
                    });
                } else {
                    if (customer) {
                        let response = {
                            firstName: customer.firstName,
                            lastName: customer.lastName,
                            email: customer.email,
                            phone: customer.phone.toString(),
                            countryCode: customer.countryCode
                        }

                        if (customer.profileImage != '') {
                            response.profileImage = `${config.serverhost}:${config.port}/img/profile-pic/` + customer.profileImage
                        } else {
                            response.profileImage = ''
                        }
                        callBack({
                            success: true,
                            STATUSCODE: 200,
                            message: 'User profile fetched successfully',
                            response_data: response
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
            });

        }
    },
    deliveryboyEditProfile: (data, callBack) => {
        if (data) {
            /** Check for customer existence */
            deliveryBoySchema.countDocuments({ email: data.email, _id: { $ne: data.customerId } }).exec(function (err, count) {
                if (err) {
                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Internal DB error',
                        response_data: {}
                    });
                } else {
                    if (count) {
                        callBack({
                            success: false,
                            STATUSCODE: 422,
                            message: 'User already exists for this email',
                            response_data: {}
                        });
                    } else {
                        deliveryBoySchema.countDocuments({ phone: data.phone, _id: { $ne: data.customerId } }).exec(function (err, count) {
                            if (err) {
                                callBack({
                                    success: false,
                                    STATUSCODE: 500,
                                    message: 'Internal DB error',
                                    response_data: {}
                                });

                            } if (count) {
                                callBack({
                                    success: false,
                                    STATUSCODE: 422,
                                    message: 'User already exists for this phone no.',
                                    response_data: {}
                                });
                            } else {

                                let updateData = {
                                    firstName: data.firstName,
                                    lastName: data.lastName,
                                    email: data.email,
                                    phone: data.phone,
                                    countryCode: data.countryCode,
                                }

                                updateDeliveryBoy(updateData, { _id: data.customerId });

                                callBack({
                                    success: true,
                                    STATUSCODE: 200,
                                    message: 'User updated Successfully',
                                    response_data: {}
                                })

                            }
                        })
                    }
                }
            });
        }
    },
    deliveryboyChangePassword: (data, callBack) => {
        if (data) {

            deliveryBoySchema.findOne({ _id: data.customerId }, function (err, result) {
                if (err) {
                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Internal DB error',
                        response_data: {}
                    });
                } else {
                    if (result) {
                        const comparePass = bcrypt.compareSync(data.oldPassword, result.password);
                        if (comparePass) {

                            bcrypt.hash(data.newPassword, 8, function (err, hash) {
                                if (err) {
                                    callBack({
                                        success: false,
                                        STATUSCODE: 500,
                                        message: 'Something went wrong while setting the password',
                                        response_data: {}
                                    });
                                } else {
                                    deliveryBoySchema.update({ _id: data.customerId }, {
                                        $set: {
                                            password: hash
                                        }
                                    }, function (err, res) {
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
                                message: 'Invalid old password',
                                response_data: {}
                            });
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
            });




        }
    },
    deliveryboyProfileImageUpload: (data, callBack) => {
        if (data) {

            deliveryBoySchema.findOne({ _id: data.body.customerId }, function (err, result) {
                if (err) {
                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Internal DB error',
                        response_data: {}
                    });
                } else {
                    if (result) {
                        if (result.profileImage != '') {
                            var fs = require('fs');
                            var filePath = `public/img/profile-pic/${result.profileImage}`;
                            fs.unlink(filePath, (err) => { });
                        }

                        //Get image extension
                        var ext = getExtension(data.files.image.name);

                        // The name of the input field (i.e. "image") is used to retrieve the uploaded file
                        let sampleFile = data.files.image;

                        var file_name = `dbprofile-${Math.floor(Math.random() * 1000)}-${Math.floor(Date.now() / 1000)}.${ext}`;

                        // Use the mv() method to place the file somewhere on your server
                        sampleFile.mv(`public/img/profile-pic/${file_name}`, function (err) {
                            if (err) {
                                callBack({
                                    success: false,
                                    STATUSCODE: 500,
                                    message: 'Internal error',
                                    response_data: {}
                                });
                            } else {
                                updateDeliveryBoy({ profileImage: file_name }, { _id: data.body.customerId });
                                callBack({
                                    success: true,
                                    STATUSCODE: 200,
                                    message: 'Profile image updated Successfully',
                                    response_data: {}
                                })
                            }
                        });
                    }
                }
            });


        }
    },
    //Vendor Owner
    vendorownerLogin: (data, callBack) => {
        if (data) {
            if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(data.user)) {
                var loginCond = { email: data.user };
            } else {
                var loginCond = { phone: data.user };
            }
            vendorOwnerSchema.findOne(loginCond, function (err, result) {
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
                                    vendorId: result.vendorId,
                                    email: result.email,
                                    phone: result.phone.toString(),
                                    cityId: result.cityId,
                                    location: result.location,
                                    id: result._id,
                                    profileImage: '',
                                    userType: data.userType,
                                    loginType: data.loginType
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
    vendorownerForgotPassword: (data, callBack) => {
        if (data) {
            vendorOwnerSchema.findOne({ email: data.email }, function (err, customer) {
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
                            callBack({
                                success: false,
                                STATUSCODE: 500,
                                message: 'Something went wrong while sending email.',
                                response_data: {}
                            });
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
    vendorownerResetPassword: (data, callBack) => {
        if (data) {
            vendorOwnerSchema.findOne({ email: data.email }, { _id: 1 }, function (err, customer) {
                if (err) {
                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Internal DB error',
                        response_data: {}
                    });
                } else {
                    if (customer) {
                        bcrypt.hash(data.password, 8, function (err, hash) {
                            if (err) {
                                callBack({
                                    success: false,
                                    STATUSCODE: 500,
                                    message: 'Something went wrong while setting the password',
                                    response_data: {}
                                });
                            } else {
                                vendorOwnerSchema.update({ _id: customer._id }, {
                                    $set: {
                                        password: hash
                                    }
                                }, function (err, res) {
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
    vendorownerResendForgotPasswordOtp: (data, callBack) => {
        if (data) {
            vendorOwnerSchema.findOne({ email: data.email }, function (err, customer) {
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
    vendorownerViewProfile: (data, callBack) => {
        if (data) {

            vendorOwnerSchema.findOne({ _id: data.customerId }, function (err, customer) {
                if (err) {
                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Internal DB error',
                        response_data: {}
                    });
                } else {
                    if (customer) {
                        let response = {
                            firstName: customer.firstName,
                            lastName: customer.lastName,
                            email: customer.email,
                            phone: customer.phone.toString(),
                            countryCode: customer.countryCode
                        }

                        if (customer.profileImage != '') {
                            response.profileImage = `${config.serverhost}:${config.port}/img/profile-pic/` + customer.profileImage
                        } else {
                            response.profileImage = ''
                        }
                        callBack({
                            success: true,
                            STATUSCODE: 200,
                            message: 'User profile fetched successfully',
                            response_data: response
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
            });

        }
    },
    vendorownerEditProfile: (data, callBack) => {
        if (data) {
            /** Check for customer existence */
            vendorOwnerSchema.countDocuments({ email: data.email, _id: { $ne: data.customerId } }).exec(function (err, count) {
                if (err) {
                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Internal DB error',
                        response_data: {}
                    });
                } else {
                    if (count) {
                        callBack({
                            success: false,
                            STATUSCODE: 422,
                            message: 'User already exists for this email',
                            response_data: {}
                        });
                    } else {
                        vendorOwnerSchema.countDocuments({ phone: data.phone, _id: { $ne: data.customerId } }).exec(function (err, count) {
                            if (err) {
                                callBack({
                                    success: false,
                                    STATUSCODE: 500,
                                    message: 'Internal DB error',
                                    response_data: {}
                                });

                            } if (count) {
                                callBack({
                                    success: false,
                                    STATUSCODE: 422,
                                    message: 'User already exists for this phone no.',
                                    response_data: {}
                                });
                            } else {

                                let updateData = {
                                    firstName: data.firstName,
                                    lastName: data.lastName,
                                    email: data.email,
                                    phone: data.phone,
                                    countryCode: data.countryCode,
                                }

                                updateVendor(updateData, { _id: data.customerId });

                                callBack({
                                    success: true,
                                    STATUSCODE: 200,
                                    message: 'User updated Successfully',
                                    response_data: {}
                                })

                            }
                        })
                    }
                }
            });
        }
    },
    vendorownerChangePassword: (data, callBack) => {
        if (data) {

            vendorOwnerSchema.findOne({ _id: data.customerId }, function (err, result) {
                if (err) {
                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Internal DB error',
                        response_data: {}
                    });
                } else {
                    if (result) {
                        const comparePass = bcrypt.compareSync(data.oldPassword, result.password);
                        if (comparePass) {

                            bcrypt.hash(data.newPassword, 8, function (err, hash) {
                                if (err) {
                                    callBack({
                                        success: false,
                                        STATUSCODE: 500,
                                        message: 'Something went wrong while setting the password',
                                        response_data: {}
                                    });
                                } else {
                                    vendorOwnerSchema.update({ _id: data.customerId }, {
                                        $set: {
                                            password: hash
                                        }
                                    }, function (err, res) {
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
                                message: 'Invalid old password',
                                response_data: {}
                            });
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
            });




        }
    },
    vendorownerProfileImageUpload: (data, callBack) => {
        if (data) {
            vendorOwnerSchema.findOne({ _id: data.body.customerId }, function (err, result) {
                if (err) {
                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Internal DB error',
                        response_data: {}
                    });
                } else {
                    if (result) {
                        if (result.profileImage != '') {
                            var fs = require('fs');
                            var filePath = `public/img/profile-pic/${result.profileImage}`;
                            fs.unlink(filePath, (err) => { });
                        }

                        //Get image extension
                        var ext = getExtension(data.files.image.name);

                        // The name of the input field (i.e. "image") is used to retrieve the uploaded file
                        let sampleFile = data.files.image;

                        var file_name = `vendorprofile-${Math.floor(Math.random() * 1000)}-${Math.floor(Date.now() / 1000)}.${ext}`;

                        // Use the mv() method to place the file somewhere on your server
                        sampleFile.mv(`public/img/profile-pic/${file_name}`, function (err) {
                            if (err) {
                                callBack({
                                    success: false,
                                    STATUSCODE: 500,
                                    message: 'Internal error',
                                    response_data: {}
                                });
                            } else {
                                updateVendor({ profileImage: file_name }, { _id: data.body.customerId });
                                callBack({
                                    success: true,
                                    STATUSCODE: 200,
                                    message: 'Profile image updated Successfully',
                                    response_data: {}
                                })
                            }
                        });
                    }
                }
            });


        }
    },
    //Admin
    adminForgotPassword: (data, callBack) => {
        if (data) {
            customerSchema.findOne({ email: data.email, userType: 'admin' }, function (err, customer) {
                if (err) {
                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Internal DB error',
                        response_data: {}
                    });
                } else {
                    if (customer) {
                        var passwordReset = {};
                        passwordReset.password = generatePassword();
                        passwordReset.firstName = customer.firstName;
                        passwordReset.email = customer.email;
                        passwordReset.adminLink = `${config.adminUrl}forgotpassword/${customer._id}`;

                        try {
                            mail('forgotPasswordAdminMail')(customer.email, passwordReset).send();
                            callBack({
                                success: true,
                                STATUSCODE: 200,
                                message: 'Please check your email to setup your password.',
                                response_data: {}
                            });
                        } catch (Error) {
                            console.log(Error);
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
    adminResetPassword: (data, callBack) => {
        if (data) {
            customerSchema.findOne({ _id: data.id, userType: 'admin' }, function (err, customer) {
                if (err) {
                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Internal DB error',
                        response_data: {}
                    });
                } else {
                    if (customer) {
                       // console.log(customer);
                        console.log(data.password);
                        bcrypt.hash(data.password, 8, function (err, hash) {
                            if (err) {
                                callBack({
                                    success: false,
                                    STATUSCODE: 500,
                                    message: 'Something went wrong while setting the password',
                                    response_data: {}
                                });
                            } else {
                                console.log(hash);
                                console.log(customer._id);
                                customerSchema.update({ _id: customer._id }, {
                                    $set: {
                                        password: hash
                                    }
                                }, function (err, res) {
                                    if (err) {
                                        callBack({
                                            success: false,
                                            STATUSCODE: 500,
                                            message: 'Internal DB error',
                                            response_data: {}
                                        });
                                    } else {
                                        console.log(res);
                                        callBack({
                                            success: true,
                                            STATUSCODE: 200,
                                            message: 'Password Changed successfully.',
                                            response_data: {}
                                        })
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
    adminChangePassword: (data, callBack) => {
        if (data) {
            customerSchema.findOne({ _id: data.customerId }, function (err, result) {
                if (err) {
                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Internal DB error',
                        response_data: {}
                    });
                } else {
                    if (result) {
                        const comparePass = bcrypt.compareSync(data.oldPassword, result.password);
                        if (comparePass) {

                            bcrypt.hash(data.newPassword, 8, function (err, hash) {
                                if (err) {
                                    callBack({
                                        success: false,
                                        STATUSCODE: 500,
                                        message: 'Something went wrong while setting the password',
                                        response_data: {}
                                    });
                                } else {
                                    customerSchema.update({ _id: data.customerId }, {
                                        $set: {
                                            password: hash
                                        }
                                    }, function (err, res) {
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
                                message: 'Invalid old password',
                                response_data: {}
                            });
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
            });




        }
    },
}

function generatePassword() {
    var length = 8,
        charset = "abcdefghijklmnop1234567890qrstuvwxyzABCDEFGH1234567890IJKLMNOPQRSTUVWXYZ0123456789",
        retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}

function generateToken(userData) {
    let payload = { subject: userData._id, user: 'CUSTOMER' };
    return jwt.sign(payload, config.secretKey, { expiresIn: '3600000h' })
}

function updateUser(update, cond) {
    return new Promise(function (resolve, reject) {
        customerSchema.update(cond, {
            $set: update
        }, function (err, res) {
            if (err) {
                return reject(err);
            } else {
                return resolve(res);
            }
        });
    });
}

function updateDeliveryBoy(update, cond) {
    return new Promise(function (resolve, reject) {
        deliveryBoySchema.update(cond, {
            $set: update
        }, function (err, res) {
            if (err) {
                return reject(err);
            } else {
                return resolve(res);
            }
        });
    });
}

function updateVendor(update, cond) {
    return new Promise(function (resolve, reject) {
        vendorOwnerSchema.update(cond, {
            $set: update
        }, function (err, res) {
            if (err) {
                return reject(err);
            } else {
                return resolve(res);
            }
        });
    });
}

function getExtension(filename) {
    return filename.substring(filename.indexOf('.') + 1);
}
