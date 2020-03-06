var express = require('express');
const cityValidator = require('../middlewares/validators/admin/city-validator');

const commonService = require('../services/common-service');

var commonApi = express.Router();
commonApi.use(express.json());
commonApi.use(express.urlencoded({ extended: false }));

commonApi.get('/getAllStates', function (req, res) {
    commonService.getAllStates(function (result) {
        res.status(200).send(result);
    })
});

commonApi.post('/getAllCities', cityValidator.getCityByStateValidator, function (req, res) {
    commonService.getAllCities(req.body, function (result) {
        res.status(200).send(result);
    })
})

commonApi.get('/migrate-state', function (req, res) {
    const excelToJson = require('convert-excel-to-json');

    const citySchema = require('../schema/City');
    const stateSchema = require('../schema/State');

    const result = excelToJson({
        sourceFile: 'States and Cities.xlsx'
    });

    var statesArr = [];
    for (let resultVal of result.Sheet1) {
        //   console.log(resultVal);

        var statesNigeria = resultVal.A;
        var citiesNigeria = resultVal.B;
        if(statesNigeria != 'States in Nigeria') {
            statesArr.push(statesNigeria);
        }
    }

    //  console.log(statesArr);

    var unique = statesArr.filter(onlyUnique);

    for (let stateVal of unique) {
        var data = {
            name: stateVal,
            isActive: true
        }

        new stateSchema(data).save(function (err, result) {
            console.log(result);
            // console.log(result);
        });
    }

    console.log(unique);
})


commonApi.get('/migrate-city', async function (req, res) {
    const excelToJson = require('convert-excel-to-json');

    const citySchema = require('../schema/City');
    const stateSchema = require('../schema/State');

    const result = excelToJson({
        sourceFile: 'States and Cities.xlsx'
    });

    var cityArr = [];
    for (let resultVal of result.Sheet1) {
        var cityObj = {};
        //   console.log(resultVal);

        var statesNigeria = resultVal.A;
        var citiesNigeria = resultVal.B;
        if(statesNigeria != 'States in Nigeria') {
           
            
           var state = await stateSchema.findOne({name: statesNigeria});
                // console.log(result._id);
                // console.log(citiesNigeria);
                cityObj.name = citiesNigeria;
                cityObj.stateId = state._id;

                new citySchema(cityObj).save(function(err, result) {
                    console.log(err);
                    console.log(result);
                });
        }
        
    }
})

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}
module.exports = commonApi;