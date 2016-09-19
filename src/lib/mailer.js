import moment from 'moment';
import nodemailer from 'nodemailer';
import { LentilBase, LentilDep } from 'lentildi';

export default class Mailer extends LentilBase {

    /**
     * Declare Dependencies
     */
    static lentilDeps() {
        return {
            logger: LentilDep.Provided('logger'),
            nodemailer,
            moment,
        };
    }

    /**
     * Constructs a Mailer object
     *
     * @param  {string} mailTransportString - SMTP connection string
     * @see {@link https://github.com/nodemailer/nodemailer}
     */
    constructor(mailTransportString, ...args) {
        super(...args);

        this.transporter = this.nodemailer.createTransport(mailTransportString);
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
