import 'mocha';
import sinon from 'sinon';
import chai from 'chai';
import Promise from 'bluebird';

import {
    LoggerStub,
    AuthStub,
} from 'testing/stub_factories.js';

import Meme from 'wafflebot/lib/meme.js';

describe('Meme', function () {
    let meme;
    let sandbox;
    let authStub;
    let requestStub;

    beforeEach(function () {
        authStub = AuthStub();
        requestStub = {};

        meme = new Meme({
            auth: authStub,
            logger: LoggerStub(),
            _request: requestStub,
        });
        sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('#_parseLines should work', function () {
        const validResults = {
            'meme me "testing testing" "one two three four"': [
                'testing testing',
                'one two three four',
            ],
            'meme me  "testing with"   "some whitespace" ': [
                'testing with',
                'some whitespace',
            ],
            'meme me "one line"': [
                'one line',
            ],
            'meme me asjdhzkagsdjzh': [
            ],
        };

        for (const input in validResults) {
            const lines = validResults[input];
            const result = meme._parseLines(input);
            chai.assert.deepEqual(result, lines, 'meme lines are incorrect');
        }
    });

    describe('#create', function () {
        let dummyLines;
        let expectedPostBody;
        let expectedResponse;

        beforeEach(function () {
            expectedPostBody = { 'form': {
                'template_id': '63278523',
                'username': authStub.username,
                'password': authStub.password,
            }, };
            expectedResponse = {
                'success': true,
                'data': {
                    'url': 'http://dummyurl',
                },
            };
        });

        it('should do nothing with invalid lines', function () {
            dummyLines = [];
            sandbox.stub(meme, '_parseLines').returns(dummyLines);

            return meme.create('').catch(err => {
                chai.assert(err);
            });
        });

        it('should create a meme with 1 line', function () {
            dummyLines = ['line 1', ];
            expectedPostBody.form.text0 = dummyLines[0];

            sandbox.stub(meme, '_parseLines').returns(dummyLines);
            requestStub.post = sandbox.stub().returns(Promise.resolve(JSON.stringify(expectedResponse)));

            return meme.create('').then(url => {
                const postCallArgs = requestStub.post.firstCall.args;
                chai.assert.equal('https://api.imgflip.com/caption_image', postCallArgs[0]);
                chai.assert.deepEqual(expectedPostBody, postCallArgs[1]);
                chai.assert.equal(expectedResponse.data.url, url);
            });
        });

        it('should create a meme with 2 lines', function () {
            dummyLines = ['line 1', 'line 2', ];
            expectedPostBody.form.text0 = dummyLines[0];
            expectedPostBody.form.text1 = dummyLines[1];

            sandbox.stub(meme, '_parseLines').returns(dummyLines);
            requestStub.post = sandbox.stub().returns(Promise.resolve(JSON.stringify(expectedResponse)));

            return meme.create('').finally(url => {
                const postCallArgs = requestStub.post.firstCall.args;
                chai.assert.deepEqual(expectedPostBody, postCallArgs[1]);
            });
        });

        it('should throw error with bad API request', function () {
            expectedResponse.success = false;

            sandbox.stub(meme, '_parseLines').returns(['', ]);
            requestStub.post = sandbox.stub().returns(Promise.resolve(JSON.stringify(expectedResponse)));

            return meme.create('').catch(err => {
                chai.assert(err);
            });
        });
    });
});
