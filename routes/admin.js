var express = require('express');
const stateValidator = require('../middlewares/validators/admin/state-validator');
const cityValidator = require('../middlewares/validators/admin/city-validator');
const adminStateService = require('../services/admin/state-service');
const adminCityService = require('../services/admin/city-service');

var apiAdmin = express.Router();
apiAdmin.use(express.json());
apiAdmin.use(express.urlencoded({extended: false}));


apiAdmin.post('/addState', stateValidator.addSateValidator, function(req, res) {
    adminStateService.addSate(req.body, function(result) {
        res.status(200).send(result);
    })
});

apiAdmin.post('/addCity', cityValidator.addCityValidator, function(req, res) {
    adminCityService.addCity(req.body, function(result) {
        res.status(200).send(result);
    })
});

module.exports = apiAdmin;