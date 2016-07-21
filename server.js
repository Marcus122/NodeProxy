var express = require('express');
var http = require('http');
var proxy = require('express-http-proxy');
var app = express();

app.use('/js',express.static('js'));
app.use('/css',express.static('css'));

app.use('*', function(){
     return proxy('https://test-b2c.weaveability.com', {
        forwardPath: function(req, res) {
            return require('url').parse(req.originalUrl).path;
        },
        intercept: function(rsp, data, req, res, callback) {
            res.removeHeader('public-key-pins');
            res.removeHeader('content-security-policy');
            if(req.originalUrl.indexOf("/images/") > -1){
                return callback(null,data);
            }
            data = data.toString('utf8');
            data=data.replace(/https:\/\/test-b2c.weaveability.com\/css\/c\/theme\/demo-b2c/g,"/css");
            data=data.replace(/https:\/\/test-b2c.weaveability.com\/js\/c\/theme\/demo-b2c/g,"/js");
            callback(null,data);
        }
     })
}());

app.listen(process.env.PORT || 8089);