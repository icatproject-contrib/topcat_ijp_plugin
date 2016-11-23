(function() {

    var app = angular.module('topcat');

    app.directive('provenanceDetails', function($stateParams) {
        return {
            restrict: 'E',
            scope: {
                provenanceId: "@"
            },
            templateUrl: $stateParams.pluginUrl + 'views/' + 'provenance-details.html',
            controller: function($scope, $timeout, $state) {
                var dataQueryTypes = {
                    dataset: {
                        "type": "dataset",
                        "classType": "Dataset",
                        "view": "datasets"
                    },
                    datafile: {
                        "type": "datafile",
                        "classType": "Datafile",
                        "view": "datafiles"
                    }
                };

                var ioTypes = {
                    input: {
                        "type": "input",
                        "classType": "Input",
                        "view": "input"
                    },
                    output: {
                        "type": "output",
                        "classType": "Output",
                        "view": "output"
                    }
                };

                var that = this;
                that.input = {
                    datasets: [],
                    datafiles: []
                }
                that.output = {
                    datasets: [],
                    datafiles: []
                }
                that.arguments = "";

                var facility = tc.facility($state.params.facilityName);
                var icat = facility.icat();

                function createDataQuery(dataQueryType, ioType, provenanceId) {
                    return icat
                        .query("select d "
                            + " from Job job, "
                            + " DataCollection dc, "
                            + " DataCollection" + dataQueryType.classType + " dcs, "
                            + " " + dataQueryType.classType + " d "
                            + " where job.id = " + provenanceId + " "
                            + " and job." + ioType.type + "DataCollection = dc "
                            + " and dc.dataCollection" + dataQueryType.classType + "s = dcs "
                            + " and dcs." + dataQueryType.type + " = d");
                }

                function createJobQuery(provenanceId) {
                    return icat
                        .query("select job "
                            + " from Job job "
                            + " where job.id = " + provenanceId);
                }

                Object.keys(dataQueryTypes).forEach(function(dataQueryTypeKey) {
                    Object.keys(ioTypes).forEach(function(ioTypeKey) {
                        var dataQueryType = dataQueryTypes[dataQueryTypeKey];
                        var ioType = ioTypes[ioTypeKey];
                        createDataQuery(dataQueryType, ioType, $scope.provenanceId).then(function(results) {
                            results.forEach(function(dataset) {
                                that[ioType.view][dataQueryType.view].push(dataset);
                            });
                        });
                    });
                });

                createJobQuery($scope.provenanceId).then(function(results) {
                    that.arguments = results[0].arguments;
                })

            },
            controllerAs:"provenanceDetailsController"
        }
    });

})();