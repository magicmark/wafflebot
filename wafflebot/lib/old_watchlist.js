 'use strict';

 const fs = require('fs');
 const unirest = require('unirest');
 const file_actions = require('./file_actions');


 const send_notification = function (email, channel, body) {
     unirest.post('https://api.pushbullet.com/v2/pushes')
  .header('Accept', 'application/json')
  .header('Access-Token', process.env.WBPBAUTH)
  .send({
      email,
      type: 'note',
      title: 'You were mentioned in ' + channel,
      body,
  })
  .end(function (response) {
    // console.log(response.body);
  });
 };


/* TODO: Investigate whether it's worth doing something like this. Seems like it could be. */
// var compile_users = function () {
//   this.user_list = Object.keys(this.users).map(...
//   add regex here somewhere

 function WatchList() {
     const me = this;
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
         email,
     };

     return file_actions.add_user_watch(user, email);
 };


 WatchList.prototype.check = function (from, channel, message) {
  // TODO: factor this regex out into a small testable function
     const me = this;
     Object.keys(this.users).forEach(function (user) {
         if (RegExp('(^| +)' + user, 'ig').test(message)) {
             send_notification(
        me.users[user].email,
        channel,
        from + ': ' + message
      );
         }
     });
 };

 module.exports = WatchList;
