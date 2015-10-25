 "use strict";

var fs           = require('fs');
var http         = require('http');
var file_actions = require('./file_actions');


var send_notification function () {
  var options = {
    host: 'www.nodejitsu.com',
    path: '/',
    port: '1338',
    //This is the only line that is new. `headers` is an object with the headers to request
    headers: {'custom': 'Custom Header Demo works'}
  };
};



/* TODO: Investigate whether it's worth doing something like this. Seems like it could be. */
// var compile_users = function () {
//   this.user_list = Object.keys(this.users);
//   add regex here somewhere
// };

function WatchList () {

  var me = this;
  fs.readFile(file_actions.WATCH_USERS, 'utf8', function (err, data) {
    if (err) {
      console.log('There was an error reading: ' + file_actions.WATCH_USERS);
      console.log(err);
      throw err;
      return ;
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


WatchList.prototype.check = function (message) {

  for user in this.users {
    if (RegExp(user).test(message)) {

    }
  }

};

module.exports = WatchList
