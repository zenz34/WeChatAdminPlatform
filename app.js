'use strict'


var Koa = require('koa')
var sha1 = require('sha1')

var config = {
    wechat: {
        appId: 'wx2a32f51211b880fc',
        appSecret: '8bff89eb2f84cc08cd8dc2c7bd5ef61e',
        token: 'aadfdadifusaopfupfuepour'
    }
}

var app = new Koa()

app.use(function *(next) {
    console.log(this.query)

    var token = config.wechat.token
    var signature = this.query.signature
    var nonce = this.query.nonce
    var timestamp = this.query.timestamp
    var echostr = this.query.echostr
    var str = [token, timestamp, nonce].sort().join('');
    var sha = sha1(str)

    if (sha === signature) {
        this.body = echostr + ''
    } else {
        this.body = 'wrong'
    }
})

app.listen(8080)
console.log('listen : 8080')
//console.log(this.query)
