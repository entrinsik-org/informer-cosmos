(function () {
    'use strict';

    function cosmosSqlQueryViewer () {
        return {
            restrict: 'E',
            controller: _.noop,
            controllerAs: 'ctrl',
            bindToController: true,
            scope: { query: '=ngModel' },
            templateUrl: '/assets/cosmos/cosmos-sql-query-viewer-tpl.html'
        };
    }

    angular.module('informer')
        .directive('cosmosSqlQueryViewer', cosmosSqlQueryViewer);
})();

