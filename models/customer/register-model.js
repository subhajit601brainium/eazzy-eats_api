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
                function (nextCb) {
                    /** Check for customer existence */
                    customerSchema.countDocuments({ email: data.email }).exec(function (err, count) {
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
                                customerSchema.countDocuments({ phone: data.phone }).exec(function (err, count) {
                                    if (err) {
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
                },
                function (arg1, nextCb) {
                    if (arg1.STATUSCODE === 200) {


                        new customerSchema(data).save(async function (err, result) {
                            if (err) {
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
                                
                                if (data.loginType == undefined) { //IF NO SOCIAL SIGN UP THEN GENERAL LOGIN
                                    loginType = 'GENERAL';
                                }

                                const authToken = generateToken(result);

                                if (data.profileImage != '') { // IF SOCIAL PROFILE PIC PRESENT THEN UPLOAD IT IN OUR SERVER

                                    const download = require('image-downloader')
        
                                    // Download to a directory and save with the original filename
                                    const options = {
                                        url: data.profileImage,
                                        dest: `public/img/`   // Save to /path/to/dest/image.jpg
                                    }
                                    const FileType = require('file-type');
                                    download.image(options)
                                        .then(({ filename, image }) => {
                                            (async () => {
                                                var fileInfo = await FileType.fromFile(filename);
                                                var fileExt = fileInfo.ext;
                                                // console.log(fileExt);
        
                                                var fs = require('fs');
        
                                                var file_name = `profile-${result._id}-${Math.floor(Date.now() / 1000)}.${fileExt}`;
                                                
                                                let image_path = `public/img/${file_name}`;
        
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
                                                        phone: result.phone,
                                                        cityId: result.cityId,
                                                        location: result.location,
                                                        id: result._id,
                                                        profileImage : `${config.serverhost}:${config.port}/img/` + file_name
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
                                            phone: result.phone,
                                            cityId: result.cityId,
                                            location: result.location,
                                            id: result._id,
                                            profileImage: ''
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
            if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(data.user)) {
                var loginCond = { email: data.user };
            } else {
                var loginCond = { phone: Number(data.user) };
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
                                    id: result._id,
                                    profileImage : `${config.serverhost}:${config.port}/img/` + result.profileImage
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
            customerSchema.findOne({ email: data.email }, function (err, customer) {
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
            customerSchema.findOne({ email: data.email }, { _id: 1 }, function (err, customer) {
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

    resendForgotPasswordOtp: (data, callBack) => {
        if (data) {
            customerSchema.findOne({ email: data.email }, function (err, customer) {
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

    viewProfile: (data, callBack) => {
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
                            phone: customer.phone,
                            countryCode: customer.countryCode
                        }

                        if(customer.profileImage != '') {
                            response.profileImage = `${config.serverhost}:${config.port}/img/` + customer.profileImage
                        } else {
                            response.profileImage = ''
                        }
                        callBack({
                            success: true,
                            STATUSCODE: 200,
                            message: 'User profile fetched successfully',
                            response_data: response
                        })

                    }
                }
            });

        }
    },

    editProfile: (data, callBack) => {
        if (data) {
            /** Check for customer existence */
            console.log(data.customerId);
            console.log(data.email);
            customerSchema.countDocuments({ email: data.email, _id: { $ne: data.customerId } }).exec(function (err, count) {
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
                        customerSchema.countDocuments({ phone: data.phone, _id: { $ne: data.customerId } }).exec(function (err, count) {
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
    changePassword: (data, callBack) => {
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
                    }
                }
            });




        }
    },
    profileImageUpload: (data, callBack) => {
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
                            var filePath = `public/img/${result.profileImage}`;
                            fs.unlink(filePath, (err) => { });
                        }

                        //Get image extension
                        var ext = getExtension(data.files.image.name);

                        // The name of the input field (i.e. "image") is used to retrieve the uploaded file
                        let sampleFile = data.files.image;

                        var file_name = `profile-${data.body.customerId}-${Math.floor(Date.now() / 1000)}.${ext}`;

                        // Use the mv() method to place the file somewhere on your server
                        sampleFile.mv(`public/img/${file_name}`, function (err) {
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
    }
}

function generateToken(userData) {
    let payload = { subject: userData._id, user: 'CUSTOMER' };
    return jwt.sign(payload, config.secretKey, { expiresIn: '24h' })
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

function getExtension(filename) {
    return filename.substring(filename.indexOf('.') + 1);
}

var fs = require('fs');
var https = require('https');
//Node.js Function to save image from External URL.
function saveImageToDisk(url, localPath) {
    var fullUrl = url;
    var file = fs.createWriteStream(localPath);
    console.log('url', url);
    var request = https.get(url, function (response) {
        console.log('response', response);
        response.pipe(file);
    });

}