export const LoggerStub = () => ({
    info: () => {},
    error: () => {},
    debug: () => {},
    warn: () => {},
});

export const fsStub = () => ({
    readFileAsync: () => {},
});

export const AuthStub = () => ({
    username: 'dummy username',
    password: 'dummy password',
});

export const MessageStub = () => ({
    body: 'dummy body',
    author: 'isaac asimov',
    channel: '#bbcthree',
});

export const WatchListStub = () => ({});

export const ActionHandlerStub = () => ({});
