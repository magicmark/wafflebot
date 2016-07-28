import 'mocha';
import sinon from 'sinon';
import chai from 'chai';
import Promise from 'bluebird';

import ircFactory from 'wafflebot/lib/ircconnect.js';

describe('IRC Connection Factory', function () {
    let meme;
    let sandbox;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('should connect with correct args', function () {
        const ircStub = { Client: sandbox.stub(), };

        const connection = ircFactory({
            server: 'dummyServer',
            password: 'dummyPassword',
            botname: 'dummyBotname',
            _irc: ircStub,
        });

        chai.assert(ircStub.Client.calledWith('dummyServer', 'dummyBotname'));
        chai.assert.instanceOf(connection, ircStub.Client);
    });
});
