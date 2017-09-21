(function () {
    'use strict';

    function NewCosmosSqlQueryDesignerCtrl (api, $scope) {
        this.$scope = $scope;
        this.api = api;
    }

    NewCosmosSqlQueryDesignerCtrl.prototype.$onInit = function () {
        this.$scope.$watch('ctrl.query.datasourceId', this.loadDatasource.bind(this));
        this.$scope.$watch('ctrl.mappingEntity', this.setSource.bind(this));
    };

    NewCosmosSqlQueryDesignerCtrl.prototype.setSource = function () {
        if (!this.mappingEntity) return;
        _.assign(this.query, {
            language: 'cosmos-sql',
            payload: {
                source: {
                    id: this.mappingEntity.id,
                    mappingId: this.mappingEntity.mappingId,
                    schemaId: this.mappingEntity.schemaId
                },
                fields: []
            },
            flow: []
        });
    };

    NewCosmosSqlQueryDesignerCtrl.prototype.loadDatasource = function () {
        var self = this;
        if (!this.query.datasourceId) return;
        return this.api.link('inf:datasource').get({ id: this.query.datasourceId })
            .then(function (datasource) {
                self.datasource = datasource;
                self.driver = datasource.embedded('inf:driver');
            });
    };

    function cosmosNewSqlQueryDesigner () {
        return {
            restrict: 'E',
            controller: NewCosmosSqlQueryDesignerCtrl,
            controllerAs: 'ctrl',
            bindToController: true,
            scope: {
                name: '=',
                query: '=ngModel'
            },
            templateUrl: '/assets/cosmos/cosmos-new-sql-query-designer-tpl.html'
        };
    }

    angular.module('informer')
        .directive('cosmosNewSqlQueryDesigner', cosmosNewSqlQueryDesigner);
})();

