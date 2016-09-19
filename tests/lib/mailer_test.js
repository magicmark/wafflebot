import 'mocha';

import chai from 'chai';
import sinon from 'sinon';

import Mailer from '../../src/lib/mailer.js';
import { MessageStub, LoggerStub } from '../../testing/stub_factories.js';

describe('Mailer', function () {
    let sandbox;
    let mailer;
    let loggerStub;
    let transporterFactoryStub;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        transporterFactoryStub = sandbox.stub();
        loggerStub = LoggerStub();

        mailer = new Mailer('dummyMailString', {
            logger: loggerStub,
            nodemailer: { createTransport: transporterFactoryStub },
        });
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('should create a transporter object', function () {
        chai.assert(transporterFactoryStub.calledWith('dummyMailString'));
    });

    describe('#send', function () {
        beforeEach(function () {
            mailer.transporter = {};
            mailer.moment = sandbox.stub().returns({
                format: sandbox.stub().returns('dummyTime'),
            });
        });

        it('should send a message', function () {
            mailer.transporter.sendMail = sandbox.stub().callsArgWith(1, null, {});

            mailer.send('dummy@test.com', MessageStub);

            chai.assert(mailer.transporter.sendMail.calledOnce);
            const mailOptions = mailer.transporter.sendMail.args[0][0];
            chai.assert.equal(mailOptions.to, 'dummy@test.com');
            chai.assert.include(mailOptions.text, MessageStub.body);
        });

        it('should log an error when not sending a message', function () {
            mailer.transporter.sendMail = sandbox.stub().callsArgWith(1, 'derp', null);
            loggerStub.error = sandbox.stub();

            mailer.send('dummy@test.com', MessageStub);

            chai.assert(loggerStub.error.calledWith('derp'));
        });
    });
});
