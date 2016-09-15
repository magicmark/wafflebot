'use strict';

var fs = require('fs');
var unirest = require('unirest');
var file_actions = require('./file_actions');

var send_notification = function send_notification(email, channel, body) {
    unirest.post('https://api.pushbullet.com/v2/pushes').header('Accept', 'application/json').header('Access-Token', process.env.WBPBAUTH).send({
        email: email,
        type: 'note',
        title: 'You were mentioned in ' + channel,
        body: body
    }).end(function (response) {});
};

function WatchList() {
    var me = this;
    fs.readFile(file_actions.WATCH_USERS, 'utf8', function (err, data) {
        if (err) {
            console.log('There was an error reading: ' + file_actions.WATCH_USERS);
            console.log(err);
            throw err;
            return;
        }

        me.users = JSON.parse(data);
    });
}

WatchList.prototype.subscribe = function (user, email) {
    this.users[user] = {
        email: email
    };

    return file_actions.add_user_watch(user, email);
};

WatchList.prototype.check = function (from, channel, message) {
    var me = this;
    Object.keys(this.users).forEach(function (user) {
        if (RegExp('(^| +)' + user, 'ig').test(message)) {
            send_notification(me.users[user].email, channel, from + ': ' + message);
        }
    });
};

module.exports = WatchList;