'use strict';

const stream = require('stream');

/**
 * Shims a cosmos "query iterator" into a node read stream
 */
class QueryIteratorStream extends stream.Readable {
    constructor(iterator) {
        super({ objectMode: true });
        this.iterator = iterator;
    }

    _read() {
        this.iterator.nextItem((err, elt) => {
            if (err) {
                console.error(err);
                return this.emit('error', err);
            }

            this.push(elt || null);
        });
    }
}

exports.QueryIteratorStream = QueryIteratorStream;