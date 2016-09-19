import 'mocha';

import chai from 'chai';
import sinon from 'sinon';

import Command from '../../src/lib/command.js';
import Message from '../../src/lib/message.js';

describe('Message', function () {
    let message;
    let sandbox;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        message = new Message({
            body: 'dummy body',
            author: 'dummy author',
            channel: 'dummy channel',
        });
    });

    afterEach(function () {
        sandbox.restore();
    });

    // TODO(magicmark): fix underlying problem and remove
    it('should handle empty body', function () {
        message = new Message({
            body: null,
            author: 'dummy author',
            channel: 'dummy channel',
        });

        chai.assert.equal(message._body, '');
    });

    it('should set private message', function () {
        message = new Message({
            body: 'dummy body',
            author: 'dummy author',
            channel: null,
        });

        chai.assert.isTrue(message.isPrivateMessage);
    });

    it('should set channel', function () {
        chai.assert.equal(message.channel, 'dummy channel');
        chai.assert.isFalse(message.isPrivateMessage);
    });

    describe('#body', function () {
        it('should return body', function () {
            chai.assert.equal(message.body, 'dummy body');
        });

        it('should return body without wafflebot prefix', function () {
            const prefixes = [
                'wafflebot',
                ' wafflebot',
                'wafflebot:',
                'wafflebot  ',
                'wafflebot:   ',
                'wafflebot :',
            ];

            for (const prefix of prefixes) {
                message._body = `${prefix} waffle me`;
                chai.assert.equal(message.body, 'waffle me');
            }
        });
    });

    describe('#hasPrefix', function () {
        it('should be not prefixed', function () {
            message._body = 'waffle me';
            chai.assert.isFalse(message.hasPrefix);
        });

        it('should be prefixed', function () {
            message._body = 'wafflebot: waffle me';
            chai.assert.isTrue(message.hasPrefix);
        });
    });

    it('#rawBody', function () {
        message._body = ' wafflebot Unfiltered';
        chai.assert.equal(message.rawBody, ' wafflebot Unfiltered');
    });

    describe('#command', function () {
        it('should get correct command', function () {
            const mappings = {
                'join whatever': Command.JOIN,
                'fight whatever': Command.FIGHT,
                'wafflebot notify whatever': Command.NOTIFY,
                'wafflebot: meme whatever': Command.MEME,
            };

            Object.keys(mappings).forEach((body) => {
                message._body = body;
                chai.assert.equal(message.command, mappings[body]);
            });
        });

        it('should be give default command', function () {
            message._body = 'Bob Loblaw No Habla Espanol';
            chai.assert.equal(message.command, Command.DEFAULT);
        });
    });
});
