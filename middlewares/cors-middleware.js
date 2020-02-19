module.exports = function(req, res, next) {
    req.setEncoding('utf8');
    /** Websites you want to allow to connect */
    res.setHeader('Access-Control-Allow-Origin', '*')

    /** Request Methods */
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    /** Request Headers */
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-access-token');

    if ('OPTIONS' === req.method) {
        res.sendStatus(200);
    } else {
        next();
    }
}