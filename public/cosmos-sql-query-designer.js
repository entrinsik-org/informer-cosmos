(function () {
    'use strict';

    function CosmosSqlQueryDesignerCtrl($scope, $rootScope, $timeout, api, actions) {
        this.$scope = $scope;
        this.$rootScope = $rootScope;
        this.$timeout = $timeout;
        this.api = api;
        this.$actions = actions;
    }

    CosmosSqlQueryDesignerCtrl.prototype.$onInit = function () {
        var self = this;
        this.datasource = this.query.embedded('inf:datasource');
        this.$scope.$watch('ctrl.query.payload.source.mappingId', this.loadMapping.bind(this));
        this.query.fields = this.query.fields || {};

        if (this.query.payload.query) this.editCtrl.enableSample(true);

        this.loadHints()
            .finally(function () {
                self.queryActions = self.$actions.get('query.edit', {
                    queryEntity: self.query,
                    datasource: self.datasource
                });
                if (!self.query.payload.query) {
                    // wait for inf-edit-panel-target to attach to the DOM
                    self.$timeout(function () {
                        self.editQuery();
                        self.editCtrl.enableSample(true);
                    });
                }
            });

        this.$scope.$on('query-inputs-changed', this.onInputsChanged.bind(this));
    };

    CosmosSqlQueryDesignerCtrl.prototype.loadMapping = function () {
        var self = this;
        if (!_.get(this.query, 'payload.source.mappingId')) {
            return;
        }
        return this.api.link('inf:mapping').get({
            id: this.query.datasourceId,
            schemaId: this.query.payload.source.schemaId,
            mappingId: this.query.payload.source.mappingId
        })
            .then(function (mapping) {
                self.mapping = mapping;
            });
    };

    CosmosSqlQueryDesignerCtrl.prototype.onInputsChanged = function () {
        this.$rootScope.$broadcast('query-changed', this.query);
        return this.loadHints();
    };

    CosmosSqlQueryDesignerCtrl.prototype.loadHints = function () {
        var self = this;
        return this.api.link('inf:datasource-autohint').get({ id: this.query.datasourceId })
            .then(function (result) {
                self.hints = {
                    tables: _.reduce(result.mappings, function (acc, value, key) {
                        return _.set(acc, key, _.pluck(value.fields, 'id'));
                    }, {})
                };
            })
            .catch(function (err) {
                self.$log.error(['sql'], 'Unable to get auto-hints for SQL Datasource', err);
            });
    };

    CosmosSqlQueryDesignerCtrl.prototype.editQuery = function ($event) {
        var self = this;
        var tempQuery = { payload: this.query.payload.query };

        if (this.editing) return this.editPanel
            .then(function (ref) {
                ref.close();
            });
        this.editing = true;
        this.editPanel = this.$panel.show($event, {
            bindToController: true,
            controllerAs: 'ctrl',
            controller: 'NativeSqlCodeAreaCtrl',
            onDomRemoved: function () {
                self.editing = false;
                self.$rootScope.$broadcast('query-changed');
                self.query.payload.query = tempQuery.payload;
                this.editCtrl.enableSample(!!tempQuery.payload);
            },
            templateUrl: '/informer/sql/native-sql/code-area-tpl.html'
        }, {
            query: tempQuery,
            hints: this.hints
        });
    };

    function infCosmosSqlQueryDesigner() {
        return {
            restrict: 'E',
            controller: CosmosSqlQueryDesignerCtrl,
            controllerAs: 'ctrl',
            bindToController: true,
            scope: {
                query: '=ngModel'
            },
            require: {
                editCtrl: '^infQueryEditor',
                $panel: '^infEditPanel'
            },
            templateUrl: '/assets/cosmos/cosmos-sql-query-designer-tpl.html'
        };
    }

    angular.module('informer')
        .directive('cosmosSqlQueryDesigner', infCosmosSqlQueryDesigner);
})();

