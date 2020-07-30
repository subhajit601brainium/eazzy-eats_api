var nodeMailer = require('nodemailer');
var nodeMailerSmtpTransport = require('nodemailer-smtp-transport');
var config = require('../config');
var handlebars = require('handlebars');
var fs = require('fs');
var path = require('path');

module.exports = function (emailType) {
    const emailFrom = config.emailConfig.MAIL_USERNAME;
    const emailPass = config.emailConfig.MAIL_PASS;

    // define mail types
    var mailDict = {
        "userRegistrationMail": {
            subject: "Welcome to Eazzy-Eats",
            html    : '../modules/emails/userRegistrationMail.html',
            //html    : require('./welcomeUser'),
        },
        "vendorOwnerRegistrationMail": {
            subject: "Welcome to Eazzy-Eats",
            html    : '../modules/emails/vendorOwnerRegistrationMail.html',
            //html    : require('./welcomeUser'),
        },
        "forgotPasswordMail": {
            subject: "Forgot Password",
            html    : '../modules/emails/forgotPasswordMail.html',
            //html    : require('./forgotPasswordMail'),
        },
        "forgotEmailMail": {
            subject: "Forgot Email",
            html    : '../modules/emails/forgotPasswordMail.html',
            //html    : require('./forgotPasswordMail'),
        },
        "verifyUserlMail": {
            subject: "Verify User",
            html    : '../modules/emails/forgotPasswordMail.html',
            //html    : require('./forgotPasswordMail'),
        },
        "forgotPasswordAdminMail": {
            subject: "Forgot Password",
            //html    : require('./forgotPasswordMail'),
        },
        "sendOTPdMail": {
            subject: "OTP verification email",
            html    : '../modules/emails/verifyOtpEmail.html',
            //html    : require('./otpVerificationMail'),
        },
        "resendOtpMail": {
            subject: "Resend OTP",
            html    : '../modules/emails/verifyOtpEmail.html',
        }
    };

    const filePath = path.join(__dirname, mailDict[emailType].html);
    const source = fs.readFileSync(filePath, 'utf-8').toString();
    const template = handlebars.compile(source);


    var transporter = nodeMailer.createTransport(nodeMailerSmtpTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        debug: true,
        auth: {
            user: emailFrom,
            // pass    : emailPass,
            pass: new Buffer(emailPass, 'base64').toString('ascii'),
        },
        maxMessages: 100,
        requireTLS: true,
    }));


    return function (to, data) {
        var self = {
            send: () => {
                var mailOption = {
                    from: `Eazzy Eats <${emailFrom}>`,
                    to: to,
                    subject: mailDict[emailType].subject,
                    // text: `Hello ${data.name}, please verify your studiolive account. Your verification code is ${data.otp}`
                };

                data.imageUrl = `${config.serverhost}:${config.port}/img/email/`

                var emailTemp = config.emailTemplete;
                let mergedObj = {...data, ...emailTemp};
                mailOption.html = template(mergedObj);

                // /** Temporary Email text */
                // switch (emailType) {
                //     case 'userRegistrationMail':
                //         mailOption.text = `Hello ${data.firstName}, welcome to Eazzy eats. Enjoy delicious food hassle free .`
                //         break;
                //     case 'vendorOwnerRegistrationMail':
                //         mailOption.text = `Hello ${data.firstName}, welcome to Eazzy eats. Please check your login details below
                //         Email:  ${data.email}
                //         Password: ${data.password}`
                //         break;
                //     case 'forgotPasswordMail':
                //         mailOption.text = `Hello ${data.firstName}, use ${data.forgotPasswordOtp} code to reset your password.`
                //         break;
                //     case 'forgotEmailMail':
                //         mailOption.text = `Hello ${data.firstName}, use ${data.forgotPasswordOtp} code to verify your account.`
                //         break;
                //     case 'verifyUserlMail':
                //         mailOption.text = `Hello, use ${data.forgotPasswordOtp} code to verify your account.`
                //         break;
                //     case 'forgotPasswordAdminMail':
                //         mailOption.text = `Hello ${data.firstName}, Please copy below link and paste it in your browser to change your password.
                //         ${data.adminLink}`
                //         break;
                //     case 'resendOtpMail':
                //         mailOption.text = `Hello ${data.firstName}, use ${data.otp} code to verify your account.`
                //         break;
                // }


                transporter.sendMail(mailOption, function (error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Email Sent', info.response);
                    }
                });
            }
        }
        return self;
    }
}

