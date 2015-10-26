var unirest      = require('unirest');

var send_notification = function (email, title, body) {

  unirest.post('https://api.pushbullet.com/v2/pushes')
  .header('Accept', 'application/json')
  .header('Access-Token', 'lzk9EkrwPT4b0A6jvAOsBkKIcPHov7Uh')
  .send({
    email: email,
    type: 'note',
    title: title,
    body: "You were mentioned in #frontend:"
  })
  .end(function (response) {
    console.log(response.body);
  });

};

send_notification('marklarah@me.com', 'title', 'msg');