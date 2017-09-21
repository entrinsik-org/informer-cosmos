(function () {
    'use strict';

    function config(componentProvider) {
        componentProvider.component('cosmos-sqlQueryEditor', '<cosmos-sql-query-designer ng-model="$component.ngModel"></cosmos-sql-query-designer>');
        componentProvider.component('cosmos-sqlQueryViewer', '<cosmos-sql-query-viewer ng-model="$component.ngModel"></cosmos-sql-query-viewer>');
        componentProvider.component('cosmosNewSqlQueryEditor', '<cosmos-new-sql-query-designer name="$component.ngModel.name" ng-model="$component.ngModel"></cosmos-new-sql-query-designer>');
        componentProvider.component('cosmosNewSqlDatasetEditor', '<cosmos-new-sql-query-designer name="$component.ngModel.name" ng-model="$component.ngModel.query"></cosmos-new-sql-query-designer>');
    }

    angular.module('informer').config(config);
})();
