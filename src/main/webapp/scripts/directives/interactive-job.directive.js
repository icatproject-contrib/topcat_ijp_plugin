(function() {

    var app = angular.module('topcat');

    app.directive('interactiveJob', function($stateParams) {
        return {
            restrict: 'E',
            templateUrl: $stateParams.pluginUrl + 'views/' + 'interactive-job.html',
            controller: function($scope, $timeout, $state) {
                var noVnc = $('#interactive-job-vnc').noVnc();

                var ijpInteractivePort = 15900;

                noVnc.connect($scope.host, 15900, $scope.password, "");
            },
            controllerAs:"interactiveJobController"
        }
    });

})();
