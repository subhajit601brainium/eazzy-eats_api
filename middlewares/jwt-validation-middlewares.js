var jwt = require('jsonwebtoken');
const config = require('../config');
/**
 * @developer : Subhajit Singha
 * @date : 20th February 2020
 * @description : Middleware function for validating request data and JWT token.
 */
exports.validateToken = async (req, res, next) => {
    //console.log(req.body);
    var token = req.headers['authorization'];
    if (token) {
        if (token.startsWith('Bearer ') || token.startsWith('bearer ')) {
            // Remove Bearer from string
            token = token.slice(7, token.length);
        }
        // decode token
        if (token) {
            jwt
                .verify(token, config.secretKey, function (err, decoded) {
                    if (err) {
                        res.status(401).send({
                            success: false,
                            STATUSCODE: 401,
                            message: 'Token not valid',
                            response_data: {}
                        });
                    }
                    else {
                         //VALID USER CHECK
                         if (req.body.customerId != decoded.subject) {
                            res.status(401).send({
                                success: false,
                                STATUSCODE: 401,
                                message: 'Request info not valid',
                                response_data: {}
                            });
                        } else {
                            next();
                        }
                    }
                });

        } else {
            res.status(401).send({
                success: false,
                STATUSCODE: 401,
                message: 'Token format not valid',
                response_data: {}
            });

        }
    } else {
        res.status(401).send({
            success: false,
            STATUSCODE: 401,
            message: 'Token format not valid',
            response_data: {}
        });

    }

}