import 'mocha';

import chai from 'chai';
import sinon from 'sinon';

import ircClient from '../../src/lib/irc_client.js';

describe('IRC Connection Factory', function () {
    let sandbox;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('should connect with correct args', function () {
        const ircStub = { Client: sandbox.stub() };

        const connection = ircClient({
            server: 'dummyServer',
            password: 'dummyPassword',
            botname: 'dummyBotname',
            _irc: ircStub,
        });

        chai.assert(ircStub.Client.calledWith('dummyServer', 'dummyBotname'));
        chai.assert.instanceOf(connection, ircStub.Client);
    });
});
