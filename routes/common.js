var express = require('express');
const cityValidator = require('../middlewares/validators/admin/city-validator');

const commonService = require('../services/common-service');

var commonApi = express.Router();
commonApi.use(express.json());
commonApi.use(express.urlencoded({extended: false}));

commonApi.get('/getAllStates', function(req, res) {
    commonService.getAllStates(function(result) {
        res.status(200).send(result);
    })
});

commonApi.post('/getAllCities', cityValidator.getCityByStateValidator, function(req, res) {
    commonService.getAllCities(req.body, function(result) {
        res.status(200).send(result);
    })
})
module.exports = commonApi;