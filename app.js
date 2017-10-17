'use strict'


var Koa = require('koa')
var path = require('path')
var wechat = require('./middle_ware/g') //  middlware
var util = require('./libs/util')
var wechat_file = path.join(__dirname, './config/wechat.txt')

var config = {
    wechat: {
        appId: 'wx2a32f51211b880fc',
        appSecret: '8bff89eb2f84cc08cd8dc2c7bd5ef61e',
        token: 'aadfdadifusaopfupfuepour',
        getAccessToken: function() {
            return util.readFileAsync(wechat_file)
        },
        saveAccessToken: function (data) {
            data = JSON.stringify(data);
            return util.writeFileAsync(wechat_file, data);
        }
    }
}

var app = new Koa();

app.use(wechat(config.wechat))

app.listen(8080)
console.log('listen : 8080')
