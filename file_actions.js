var fs = require('fs');
var Q  = require('q');

var WATCH_USERS = 'notification_users.json';
var ROOMS       = 'rooms.json';

var readWrite = function (file, callback) {

  var d = Q.defer();

  /* Read file */
  fs.readFile(file, 'utf8', function (err, data) {
    if (err) {
      console.log('There was an error reading: ' + file);
      console.log(err);
      d.reject();
      return ;
    }
    
    /* Find out how we should amend file */
    data = JSON.parse(data);
    data = callback(data);

    /* Write to file */
    fs.writeFile(file, JSON.stringify(data, null, 2), function(err) {
      if (err) {
        console.log('There was an error writing to : ' + file);
        console.log(err);
        d.reject();
        return ;
      }
      d.resolve();
    });
  });

  return d.promise;

};


var add_user_watch = function (user, email) {
  return readWrite(WATCH_USERS, function (data) {
    var users = data;

    users[user] = {
      email: email
    };

    return users;
  });
};


var add_room = function (room) {
  return readWrite(ROOMS, function (data) {

    /* Check if we're already in the file */
    if (data.rooms.indexOf(room) === -1) {
      data.rooms.push(room);
    }

    return data;
  });
};

module.exports = {
  add_user_watch: add_user_watch,
  add_room: add_room,
  WATCH_USERS: WATCH_USERS,
  ROOMS: ROOMS,
}
