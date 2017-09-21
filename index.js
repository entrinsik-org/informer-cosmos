'use strict';

exports.register = function (server, opts, next) {
    // scans public folder and creates a "cosmos" ui asset bundle
    let bundle = server.bundle('cosmos').scan(__dirname, 'public');

    // injects ui bundle into host page
    server.injector().inject(bundle);

    // registers the new cosmos-sql query language
    server.driver('queryLanguage', require('./lib/language'));

    // registers the new cosmos datasource driver
    const driver = server.driver('datasource', require('./lib/datasource'));

    // detective that is bound to the "new datasource" action
    server.driver('datasource-builder', {
        discover: function () {
            return {
                group: 'Microsoft',
                name: 'Cosmos Document DB',
                edit: driver.connectionForm,
                datasource: {
                    type: driver.id,
                    connection: {}
                }
            };
        }
    });

    // detective bound to the "new query" action
    server.driver('report-builder:global', {
        isEligible: r => r.model('Datasource').scope('query_access').count({ where: { type: 'cosmos' } }),
        discover: r => r.model('Datasource')
            .scope('query_access')
            .findAll({ where: { type: 'cosmos' } })
            .then(() => ({
                group: 'Ad hoc Query',
                name: 'Cosmos SQL',
                priority: 200,
                iconSvg: '/images/query/native-sql-query.svg',
                language: 'cosmos-sql',
                editOnCreate: true,
                rel: 'inf:queries',
                searchDriver: 'adhoc',
                editorComponent: {
                    newReportDialog: {
                        name: 'Ad hoc Native SQL Query',
                        description: `Write your own query through a SQL statement`,
                        iconSvg: '/images/query/native-sql-query.svg',
                        color: 'deepPurple',
                        component: 'cosmosNewSqlQueryEditor'
                    }
                },
                report: { language: 'cosmos-sql' }
            }))
    });

    // detective that is bound to the "new dataset" action
    server.driver('dataset-builder', {
        isEligible: r => r.model('Datasource').scope('query_access').count({ where: { type: 'cosmos' } }),
        discover: r => r.model('Datasource')
            .scope('query_access')
            .findAll({ where: { type: 'cosmos' } })
            .then(() => ({
                group: '__top',
                name: 'Microsoft Cosmos',
                editOnCreate: true,
                iconSvg: '/images/query/native-sql-query.svg',
                editorComponent: {
                    newDatasetDialog: {
                        name: 'Cosmos SQL',
                        description: `Create a Dataset based on a Cosmos SQL statement`,
                        iconSvg: '/images/query/native-sql-query.svg',
                        color: 'deepPurple',
                        component: 'cosmosNewSqlDatasetEditor'
                    }
                },
                dataset: { query: {} }
            }))
    });

    next();
};

exports.register.attributes = { name: 'informer-cosmos' };