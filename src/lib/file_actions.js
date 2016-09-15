'use strict';

import Promise from 'bluebird';
import fs from 'fs';
import path from 'path';

// import { JSONFiles } from './lib/config_files.js';


Promise.promisifyAll(fs);

export default class FileActions {

    constructor({
        logger,
        _fs: fs,
        _path: path,
    }) {
        this.logger = logger;
        this.fs = _fs;
        this.path = _path;
    }
};

