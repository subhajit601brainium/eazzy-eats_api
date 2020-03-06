var vendorSchema = require('../../schema/Vendor');

module.exports = {
    //Customer Home/Dashboard API
    customerHome: (data, callBack) => {
        if (data) {
            var latt = data.body.latitude;
            var long = data.body.longitude;
            //   console.log(data.body);

            vendorSchema.find({
                location: {
                    $near: {
                        $maxDistance: 10000,
                        $geometry: {
                            type: "Point",
                            coordinates: [long, latt]
                        }
                    }
                },
                isActive: true
            })
            .limit(4)
            .populate('vendorOpenCloseTime')
            .exec(function (err, results) {
                    console.log('err',err);
                    console.log(results);
                });
        }
    }
}
