import moment from 'moment';
import nodemailer from 'nodemailer';
import Promise from 'bluebird';

export default class Mailer {

    /**
     * Constructs a Mailer object
     *
     * @param  {string} options.mail_transport_string - SMTP connection string
     * @param  {log4js} options.logger - Logger instance
     * @param  {object} options._nodemailer - npm nodemailer module
     * @param  {object} options._moment - npm moment module
     */
    constructor({
        mail_transport_string,
        logger,
        _nodemailer = nodemailer,
        _moment = moment,
    }) {
        this.logger = logger;
        this.moment = _moment;
        this.transporter = _nodemailer.createTransport(mail_transport_string);
    }

    /**
     * Sends an email
     *
     * @param  {string} to - Email address to send notification to
     * @param  {Message} message - Message
     */
    send(to, message) {
        const timeNow = this.moment().format('dddd MMMM Do, [a]t h:mma');
        const messageString = `\
You were mentioned in ${message.channel} on ${timeNow}

${message.author} said:

${message.body}

--
Sent to you by Wafflebot. Here is a horse 🐴`;

        const mailOptions = {
            from: 'Wafflebot <markl+wafflebot@yelp.com>',
            to,
            subject: `💬 IRC Notification | ${message.channel} 💬`,
            text: messageString,
            replyTo: `${message.author}@yelp.com`,
            priority: 'high',
        };

        this.transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                this.logger.error(error);
                return;
            }
            this.logger.info('Message sent: ', info.response);
        });
    }
}
