(function() {

    var app = angular.module('topcat');

    app.directive('provenanceDetails', function($stateParams, uiGridConstants) {
        return {
            restrict: 'E',
            scope: {
                provenanceId: "@"
            },
            templateUrl: $stateParams.pluginUrl + 'views/' + 'provenance-details.html',
            controller: function($scope, $timeout, $state) {

                var that = this;

                that.dataQueryTypes = {
                    dataset: {
                        "type": "dataset",
                        "classType": "Dataset",
                        "view": "datasets",
                        "include": " include d.type"
                    },
                    datafile: {
                        "type": "datafile",
                        "classType": "Datafile",
                        "view": "datafiles",
                        "include": " include d.datafileFormat"
                    }
                };

                that.ioTypes = {
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

                that.input = {
                    gridOptions: {
                        data: [],
                        appScopeProvider: this
                    }
                }
                that.output = {
                    gridOptions: {
                        data: [],
                        appScopeProvider: this
                    }
                }
                that.arguments = "";

                that.pagingConfig = tc.config().paging;

                function setUpGridOptions(grid){

                    grid.enableHorizontalScrollbar = uiGridConstants.scrollbars.NEVER;
                    grid.enableRowSelection =  false;
                    grid.enableRowHeaderSelection =  false;
                    grid.gridMenuShowHideColumns =  false;
                    grid.enablePaginationControls = false;
                    grid.pageSize =  !that.isScroll ? that.pagingConfig.paginationNumberOfRows : null;
                    grid.paginationPageSizes =  that.pagingConfig.paginationPageSizes;
                    grid.paginationNumberOfRows =  that.pagingConfig.paginationNumberOfRows;

                    grid.columnDefs = [
                        {
                            "field": "name",
                            "displayName": "MY_JOBS.JOB_DETAILS.MODAL.TABS.PROVENANCE.COLUMNS.NAME"
                        },
                        {
                            "field": "dt",
                            "displayName": "MY_JOBS.JOB_DETAILS.MODAL.TABS.PROVENANCE.COLUMNS.TYPE"
                        },
                        {
                            "field": "getType()",
                            "displayName": "MY_JOBS.JOB_DETAILS.MODAL.TABS.PROVENANCE.COLUMNS.DATATYPE"
                        }
                    ]

                    _.each(grid.columnDefs, function(columnDef){
                        columnDef.headerCellFilter = 'translate';
                        columnDef.enableHiding = false;
                    });
                }

                setUpGridOptions(that.input.gridOptions);
                setUpGridOptions(that.output.gridOptions);

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
                            + " and dcs." + dataQueryType.type + " = d"
                            + dataQueryType.include);
                }

                function createJobQuery(provenanceId) {
                    return icat
                        .query("select job "
                            + " from Job job "
                            + " where job.id = " + provenanceId);
                }

                Object.keys(that.dataQueryTypes).forEach(function(dataQueryTypeKey) {
                    Object.keys(that.ioTypes).forEach(function(ioTypeKey) {
                        var dataQueryType = that.dataQueryTypes[dataQueryTypeKey];
                        var ioType = that.ioTypes[ioTypeKey];
                        createDataQuery(dataQueryType, ioType, $scope.provenanceId).then(function(results) {
                            results.forEach(function(dataset) {
                                dataset.dt = dataQueryType.classType;

                                dataset.getType = function() {
                                    if (this.dt === that.dataQueryTypes.dataset.classType) {
                                        return this.type.name;
                                    } else {
                                        return this.datafileFormat.name;
                                    }
                                }

                                that[ioType.view].gridOptions.data.push(dataset);
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