'use strict'

var sha1 = require('sha1')
var Promise = require('bluebird')
var request = Promise.promisify(require('request'))

var prefix = 'https://api.weixin.qq.com/cgi-bin/token'
var api = {
    accessToken: prefix + '?grant_type=client_credential'
}

//  get token_access
function Wechat(opts) {
    var that = this;
    this.appId = opts.appId;
    this.appSecret = opts.appSecret;
    this.getAccessToken = opts.getAccessToken;
    this.saveAccessToken = opts.saveAccessToken;

    this.getAccessToken()
    .then(function(data) {
        try {
            console.log('Wechat*****    getAccessToken ');

            console.log("before json.parse  ****data :    " + data);

            data = JSON.parse(data) //  convert to JSON object?

            console.log("after json.parse  ****data :    " + data);

        } catch(e) {
            console.log('Wechat*****    catch error  start updateAccessToken ');
            return that.updateAccessToken()
        }

        if (that.isValidAccessToken(data)) {
            console.log('Wechat*****    isValidAccessToken yes ');
            return Promise.resolve(data)
        } else {
            console.log('Wechat*****    isValidAccessToken No ! start updateAccessToken ');
            console.log('this.appId:    ' + that.appId)

            return that.updateAccessToken()
        }
    })
    .then(function(data) {
        console.log("Problem happens*****    data :    " + data);
        console.log("data.access_token :    " + data.access_token);
        console.log("data.expires_in :    " + data.expires_in);

        that.access_token = data.access_token
        that.expires_in = data.expires_in

        console.log('Wechat*****    start saveAccessToken');
        that.saveAccessToken(data)
    })
}
// ?? why use prototype?
Wechat.prototype.isValidAccessToken = function(data) {
    if (!data || !data.access_token || !data.expires_in) {
        return false
    }

    console.log("isValidAccessToken*****    data :    " + data);
    console.log("isValidAccessToken*****    data.access_token :    " + data.access_token);
    console.log("isValidAccessToken*****    data.expires_in :    " + data.expires_in);


    var access_token = data.access_token
    var expires_in = data.expires_in
    var now = (new Date().getTime())

    if (now < expires_in) {
        return true
    } else {
        return false
    }
}

Wechat.prototype.updateAccessToken = function() {
    var appId = this.appId;
    var appSecret = this.appSecret;
    var url = api.accessToken + '&appId=' + appId + '&secret=' + appSecret

    console.log('appId:    ' + appId);
    console.log('appSecret:    ' + appSecret);
    console.log('url:    ' + url);

    //  if correct  return  {"access_token":"ACCESS_TOKEN","expires_in":7200}
    return new Promise(function(resolve, reject) {
        request({url: url, json: true}).then(function(response) {

            console.log('updateAccessToken***************');
            console.log(response.body);

            var data = response.body  //  means the expires_in
            var now = (new Date().getTime())
            var expires_in = now + (data.expires_in - 20) * 1000;   //  ms

            data.expires_in = expires_in

            resolve(data);   //   resolve ??  return a Promise object
        })
    })
}

//  request
// { request:
//    { method: 'GET',
//      url: '/?signature=223fc0a73b5cfa154bc651b69f12e80ce58134e5&echostr=6675965534288199668&timestamp=1508188788&nonce=2583573886',
//      header:
//       { 'user-agent': 'Mozilla/4.0',
//         accept: '*/*',
//         host: 'a876d7d0.ngrok.io',
//         pragma: 'no-cache',
//         connection: 'Keep-Alive',
//         'x-forwarded-for': '103.7.30.107' } },
//   response: { status: 404, message: 'Not Found', header: {} },
//   app: { subdomainOffset: 2, proxy: false, env: 'development' },
//   originalUrl: '/?signature=223fc0a73b5cfa154bc651b69f12e80ce58134e5&
//                  echostr=6675965534288199668
//                  &timestamp=1508188788
//                  &nonce=2583573886',
//   req: '<original node req>',
//   res: '<original node res>',
//   socket: '<original node socket>' }
//

//  query
// { signature: '223fc0a73b5cfa154bc651b69f12e80ce58134e5',
//   echostr: '6675965534288199668',
//   timestamp: '1508188788',
//   nonce: '2583573886' }

module.exports = function(opts) {
    console.log('function*****    opts.appId:    ' + opts.appId);
    var wechat = new Wechat(opts)

    return function *(next) {
//  koa need the Generator func as the router?
//  what is this next?
//  'this' means the context of request? the whole context of the http package
        //console.log(this)
        console.log(this.query)

        var token = opts.token
        var signature = this.query.signature
        var nonce = this.query.nonce
        var timestamp = this.query.timestamp
        var echostr = this.query.echostr
        var str = [token, timestamp, nonce].sort().join('');
        var sha = sha1(str)

        console.log("token: " + token)
        console.log("timestamp: " + timestamp)
        console.log("nonce: " + nonce)
        console.log("sha: " + sha)
        console.log("signature: " + signature)

        if (sha === signature) {
            this.body = echostr + ''
        } else {
            this.body = 'wrong'
        }

        console.log(this.body);
    }
}
