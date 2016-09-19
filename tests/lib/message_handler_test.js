import 'mocha';

import chai from 'chai';
import sinon from 'sinon';

import Message from '../../src/lib/message.js';
import MessageHandler from '../../src/lib/message_handler.js';
import {
    LoggerStub,
} from '../../testing/stub_factories.js';

describe('Message Handler', function () {
    let messageHandler;
    let sandbox;
    let dummyMessage;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        messageHandler = new MessageHandler({
            logger: LoggerStub(),
            client: {},
        });

        dummyMessage = new Message({
            body: 'dummy body',
            author: 'dummy author',
            channel: 'dummy channel',
        });
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe('#_handleMessage', function () {
        it('should handle notify', function () {
            dummyMessage._body = 'wafflebot notify blah blah';
            messageHandler.actions.notifications = sandbox.stub();

            messageHandler._handleMessage(dummyMessage);
            chai.assert(messageHandler.actions.notifications.calledWith(dummyMessage));
        });

        it('should handle join', function () {
            dummyMessage._body = 'wafflebot join #whatever';
            messageHandler.actions.joinRoom = sandbox.stub();

            messageHandler._handleMessage(dummyMessage);
            chai.assert(messageHandler.actions.joinRoom.calledWith(dummyMessage, '#whatever'));
        });

        it('should handle fight', function () {
            dummyMessage._body = 'fight marley';
            messageHandler.actions.fightMarley = sandbox.stub();

            messageHandler._handleMessage(dummyMessage);
            chai.assert(messageHandler.actions.fightMarley.calledWith(dummyMessage));
        });

        it('should handle meme', function () {
            dummyMessage._body = 'meme me';
            messageHandler.actions.makeMeme = sandbox.stub();

            messageHandler._handleMessage(dummyMessage);
            chai.assert(messageHandler.actions.makeMeme.calledWith(dummyMessage));
        });

        it('should handle default', function () {
            dummyMessage._body =
                'Allow me to be the first to offer Dr. Johnson my most sincere contrafibularities';
            messageHandler.actions.handleOther = sandbox.stub();

            messageHandler._handleMessage(dummyMessage);
            chai.assert(messageHandler.actions.handleOther.calledWith(dummyMessage));
        });
    });

    describe('#message', function () {
        beforeEach(function () {
            messageHandler.Message = sandbox.stub();

            sandbox.stub(messageHandler, '_handleMessage');
            messageHandler.watchlist = {
                checkMessage: sandbox.stub(),
            };
        });

        it('should handle a message', function () {
            messageHandler.message('baldrick', '#pieshop', 'I have a cunning plan');

            chai.assert.deepEqual(messageHandler.Message.getCall(0).args[0], {
                body: 'I have a cunning plan',
                author: 'baldrick',
                channel: '#pieshop',
            });
            chai.assert(messageHandler._handleMessage.calledOnce);
            chai.assert(messageHandler.watchlist.checkMessage.calledOnce);
        });
    });

    describe('#pm', function () {
        beforeEach(function () {
            messageHandler.Message = sandbox.stub();
            sandbox.stub(messageHandler, '_handleMessage');
        });

        it('should handle a private message', function () {
            messageHandler.pm('baldrick', 'I have a cunning plan');

            chai.assert.deepEqual(messageHandler.Message.getCall(0).args[0], {
                body: 'I have a cunning plan',
                author: 'baldrick',
                channel: null,
            });
            chai.assert(messageHandler._handleMessage.calledOnce);
        });
    });
});
