'use strict';

const DocumentClient = require("documentdb").DocumentClient;
const QueryIteratorStream = require('./query-iterator-stream').QueryIteratorStream;
const url = require('url');
const _ = require('lodash');
const P = require('bluebird');
const es = require('ent-streams');
const path = require('path');
const boom = require('boom');
const joi = require('joi');

// schema for cosmos connections
const connectionSchema = joi.object().keys({
    url: joi.string().required(),
    key: joi.string().required(),
    database: joi.string().required()
});

/**
 * Creates a new cosmos client for a datasource
 * @param {{}} connection the datasource's connection property
 */
const newClient = ({ connection = {} }) => new DocumentClient(connection.url, { masterKey: connection.key });

/**
 * Constructs a db ref string
 * @param connection
 */
const dbLink = ({ connection = {} }) => `dbs/${connection.database}`;

/**
 * Returns a collection ref string for a datasource / mapping combo
 * @param ds
 * @param mapping
 */
const collectionLink = (ds, mapping) => `${dbLink(ds)}/colls/${mapping}`;

/**
 * Executes a cosmos sql query against a specific collection
 * @param datasource
 * @param query
 * @param reply
 * @return {*}
 */
const query = (datasource, query, reply) => {
    // no query defined so return an empty array
    if (!query.payload.query) return reply([]);

    const client = newClient(datasource);
    const collection = collectionLink(datasource, query.payload.source.mappingId);
    const cosmosQuery = {
        query: query.payload.query,
        parameters: _.map(query.params, (v, n) => ({ name: `@${n}`, value: _([]).concat(v).join(', ') }))
    };

    reply(new QueryIteratorStream(client.queryDocuments(collection, cosmosQuery)));
};

/**
 * Rethrows cosmos errors, extracting useful info from error body (if it exists)
 * @param err
 */
const rethrow = err => {
    if (err.body) {
        const { code, message } = JSON.parse(err.body);
        throw new Error(`${code}: ${message}`);
    }
    throw err;
};

/**
 * Pings a datasource by asking for its collections
 * @param datasource
 */
const ping = datasource => P.fromNode(cb => newClient(datasource).queryCollections(dbLink(datasource)).toArray(cb))
    .then(res => true)
    .catch(err => rethrow(err));

/**
 * Scans a datasource's collections. Field scanning has not been implemented yet per the schemaless nature of cosmos
 * collections
 * @param datasource
 * @return {Promise.<{}>}
 */
const scan = datasource => {
    const schemaWriter = datasource.schemaWriter('cosmos');
    const mappingStream = new QueryIteratorStream(newClient(datasource).queryCollections(dbLink(datasource)))
        .pipe(es.mapSync(collection => ({ mappingId: collection.id })));

    return schemaWriter.write({ mappings: mappingStream });
};

module.exports = {
    id: 'cosmos',
    name: 'Cosmos Document DB',
    languages: ['cosmos-sql'],
    connectionSchema: connectionSchema,
    connectionForm: path.join(__dirname, 'connection-tpl.html'),
    image: path.join(__dirname, 'cosmos.svg'),
    query,
    ping,
    scan
};