wafflebot
=========

[![Greenkeeper badge](https://badges.greenkeeper.io/magicmark/wafflebot.svg)](https://greenkeeper.io/)
[![Build Status](https://travis-ci.org/magicmark/wafflebot.svg?branch=master)](https://travis-ci.org/magicmark/wafflebot)
[![Coverage Status](https://coveralls.io/repos/github/magicmark/wafflebot/badge.svg?branch=master)](https://coveralls.io/github/magicmark/wafflebot?branch=master)
[![npm](https://img.shields.io/npm/v/wafflebot.svg)](https://www.npmjs.com/package/wafflebot)

An IRC wafflebot.

![](http://i.imgur.com/YMLz9gi.png)

## Fun Features
- Waffles
- Wafflebot will send you an email if you get pinged in a channel
- *Far* too many to describe, you'll have to explore!

## Have Wafflebot join a room
```IRC
/msg wafflebot join #myawesomechannel
```

## Subscribe to Wafflebot for notifications
Wafflebot did use Pushbullet for sending iOS notifications, but this has now been replaced by emails. If you would like iOS push notifications to be reenabled, let me know!

To subscribe, send wafflebot a private message with your email address:
```IRC
/msg wafflebot notify subscribe markl@yelp.com
```

Protip: You can enable browser/mobile notifications from wafflebot:
- https://support.google.com/mail/answer/1075549?hl=en
- http://www.howtogeek.com/171178/how-to-get-notifications-for-only-the-emails-you-care-about-with-gmail-on-android/

## How to run:
So you want to run your own Wafflebot? Good decision!

Suggested method of running Wafflebot is inside Docker.

```bash
git clone git@github.com/magicmark/wafflebot
cd wafflebot
make docker-run
```

## Mailing
Note: Wafflebot uses [nodemailer](https://github.com/nodemailer/nodemailer) for sending emails - see their documentation for info about the `mail_transport_string`.

## TODO
- Add more delicious british foods

## Contributing
Go for it! Submit a pull request :)

## Licence
![](http://i.imgur.com/UOkGhYi.gif)
