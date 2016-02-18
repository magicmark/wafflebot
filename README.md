# wafflebot
An IRC wafflebot.

## Fun Features
- Waffles
- Wafflebot will send you an email if you get pinged in a channel
- *Far* too many to describe, you'll have to explore!

## Subscribe to Wafflebot for notifications
Wafflebot did use Pushbullet for sending iOS notifications, but this has now been replaced by emails. If you would like iOS push notifications to be reenabled, let me know!

To subscribe, send wafflebot a private message with your email address:
```IRC
/msg wafflebot notify subscribe markl@yelp.com
```

## How to run:
So you want to run your own Wafflebot? Good decision!

Create a `config.json` file with the following sample content
```JSON
{
	"mail_transport_string": "smtps://example%40gmail.com:passwordhere@smtp.gmail.com",
	"irc_server": "irc.example.com",
	"irc_server_password": "serverpassword"
}
```

Note: Wafflebot uses [nodemailer](https://github.com/nodemailer/nodemailer) for sending emails - see their documentation for info about the `mail_transport_string` 

You can then run wafflebot by running
```bash
node wafflebot.js
```

## TODO
- Refactor to have a 'message' class rather than pass around room, to, message arguments etc
- Maybe make rooms.json a hash table? Not a big deal really

## Contributing
Go for it! Submit a pull request :)

## License
![](http://i.imgur.com/UOkGhYi.gif)