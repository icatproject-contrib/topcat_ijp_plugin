


(function(){
    'use strict';

    var app = angular.module('topcat');

    app.controller('ConfigureJobController', function($q, $scope, $rootScope, $uibModal, $uibModalInstance, $filter, $translate, tc, inputEntities, facilityName, pluginUrl, helpers, uiGridConstants){

        var that = this;
        var inputEntityTypes = _.uniq(_.map(inputEntities, 'entityType'));
        var inputContainsDatasets = _.includes(inputEntityTypes, 'dataset');
        var inputContainsDatafiles = _.includes(inputEntityTypes, 'datafile');
        var multipleInputEntities = inputEntities.length > 1;
        var inputDatasetTypes = [];
        var booleanGroupNames = [];
        var previousEntityHash;
        that.numInputEntities = inputEntities.length;
        that.loadingJobTypes = true;
        that.form = {};
        getCompatibleJobTypes();

        var pagingConfig = tc.config().paging;
        var isScroll = pagingConfig.pagingType == 'scroll';
        var pageSize = isScroll ? pagingConfig.scrollPageSize : pagingConfig.paginationNumberOfRows;
        
        this.tabs = (function() {
            var active = 1;
            return {
                isActive: function(n) {
                    return active === n;
                },
                setActive: function(n) {
                    active = n;
                }
            }
        })();
        
        // metaTabs is used in the Details panel
        that.metaTabs = [];
        
        var datasetGridOptions = _.merge({
            	data: [],
            	appScopeProvider: this
            }, {
            "enableFiltering": false,
            "columnDefs": [
                {
                    "field": "id",
                    sortingAlgorithm: function(a, b) { return Math.sign(a - b);}
                },
                {
                    "field": "name"
                },
                {
                    "field": "datasetType"
                }            ]
            });

        var datafileGridOptions = _.merge({
	        	data: [],
	        	appScopeProvider: this
	        }, {
	        "enableFiltering": false,
	        "columnDefs": [
	            {
	                "field": "id",
	                sortingAlgorithm: function(a, b) { return Math.sign(a - b);}
	            },
	            {
	                "field": "name"
	            },
	            {
	                "field": "location"
	            },
	            {
	                "field": "fileSize"
	            }            ]
	        });

        // I have used slightly different mechanisms for getInputData{set,file}s;
        // both seem to work, or at least neither seems worse than the other.
        // In future, I may find an approach that works with one way but not the other,
        // so am leaving both in place at the moment.
        
        if (inputContainsDatasets) {
	        setUpGridOptions(datasetGridOptions,'Dataset');
	        this.datasetGridOptions = datasetGridOptions;
	        getInputDatasetFields().then(function(datasetFields){
	        	that.datasetGridOptions.data = datasetFields;
	        });
	        this.tabs.setActive(1);
        }

        if (inputContainsDatafiles) {
	        setUpGridOptions(datafileGridOptions,'Datafile');
	        this.datafileGridOptions = datafileGridOptions;
	        getInputDatafileFields();
	        if (! inputContainsDatasets) { this.tabs.setActive(2); }
        }
        
        that.details = "";
        that.detailsEntity = 0;
        
        var submitJob = function(submitMultipleJobs) {
            var promises = [];
            var jobParameters = [];
            that.jobIds = [];
            that.interactiveSessionDetails = undefined;
            that.platformIsWindows = navigator.platform.match(/Win/);
            that.failedSubmissions = [];

            if (that.confirmModal) that.confirmModal.close();
            that.isSubmitting = true;
            that.submittingModal = $uibModal.open({
                        templateUrl : pluginUrl + 'views/submitting-job-modal.html',
                        scope: $scope,
                        size : 'med',
                        backdrop: 'static'
            });

            //Build all the job parameters from the configure job form
                _.each(that.selectedJobType.jobOptions, function (jobOption){
                    switch (jobOption.type) {
                        case "boolean":
                            if (jobOption.value === true) { jobParameters.push(jobOption.programParameter) }
                            break;
                        case "booleanGroup":
                            if (jobOption.value !== "") { jobParameters.push(jobOption.value) }
                            break;
                        default:
                            if (jobOption.value || jobOption.value === 0) {
                                jobParameters.push(jobOption.programParameter);
                                jobParameters.push(jobOption.value);
                            }
                    }
            });

            if (submitMultipleJobs === true) {
                //If multiple jobs are to be submitted, the datasetIds and datafileIds params must be added for each submit
                _.each(inputEntities, function(inputEntity){

                    var jobParameters_ = _.clone(jobParameters);
                    if (inputEntity.entityType === 'datafile') jobParameters_.unshift('--datafileIds=' + inputEntity.entityId);
                    if (inputEntity.entityType === 'dataset') jobParameters_.unshift('--datasetIds=' + inputEntity.entityId);
                    promises.push(tc.ijp(facilityName).submitJob(that.selectedJobType.name, jobParameters_).then(function(response){
                        //Multiple jobs can only be submitted at once if the job is a batch job, so the response must have an id
                        that.jobIds.push(response.jobId);
                    }, function(response){
                        that.failedSubmissions.push({
                            inputEntityIds: inputEntity.entityId,
                            error: response || "No error response"
                        });
                    }));
                });

            } else {
                //If only one job is to be submitted, the datasetIds and datafileIds params are all added at once
                if (inputContainsDatafiles) jobParameters.unshift('--datafileIds=' + _.map(_.filter(inputEntities, function(o) { return o.entityType === 'datafile'}), 'entityId').join(','));
                if (inputContainsDatasets) jobParameters.unshift('--datasetIds=' + _.map(_.filter(inputEntities, function(o) { return o.entityType === 'dataset'}), 'entityId').join(','));
                promises.push(tc.ijp(facilityName).submitJob(that.selectedJobType.name, jobParameters).then(function(response){
                    if (response.jobId) {
                        //If response has a job id, the submitted job was a batch job
                        that.jobIds.push(response.jobId);
                    } else if (response.rdp) {
                        //If response has an rdp attribute, the submitted job was interactive
                        that.interactiveSessionDetails = response.rdp;
                        tc.ijp(facilityName).remoteDesktop().openSession(response.rdp);
                    }

                }, function(response){
                    that.failedSubmissions.push({
                        inputEntityIds: _.map(inputEntities, 'entityId').join(', '),
                        error: response || "No error response"
                    });
                }));
            }

            //Wait for all submits to resolve/reject before displaying results to user
            $q.all(promises).finally(function(){
                that.isSubmitting = false;
                $rootScope.$broadcast('jobSubmitted');
            });

        };

        this.submitSingleJob = function() {
            submitJob(false);
        };

        this.submitMultipleJobs = function() {
            submitJob(true);
        };

        this.isInteractive = function() {
            return that.selectedJobType.type === 'interactive';
        }

        this.isBatchSingular = function() {
            return that.selectedJobType.type === 'batch' && that.numInputEntities <= 1;
        }

        this.isBatchMultiple = function() {
            return that.selectedJobType.type === 'batch' && that.selectedJobType.multiple === true && that.numInputEntities > 1;
        }

        this.isMultipleBatch = function() {
            return that.selectedJobType.type === 'batch' && that.selectedJobType.multiple !== true && that.numInputEntities > 1;
        }

        this.isSingleJobForced = function() {
            console.log(that.selectedJobType.forceSingleJob);
            return that.selectedJobType.forceSingleJob;
        }

        this.checkFormValidity = function() {
            that.form.$setSubmitted();
            if (that.form.$valid){ return true; }
            return false;
        }

        this.openConfirmJobModal = function() {
            //Opens a modal asking user whether they want to submit a single or multiple jobs
            that.form.$setSubmitted();
            if (that.form.$valid){
                that.confirmModal = $uibModal.open({
                    templateUrl : pluginUrl + 'views/confirm-job-modal.html',
                    scope: $scope,
                    size : 'med'
                });
            }
        };

        this.close = function(modal){
            if (modal === undefined) {
                $uibModalInstance.close()
            } else {
                modal.close();
            }
        };

        this.jobTypeSelected = function(){
            setupJobDefaults();
            that.form.$setPristine();
        };
        
        this.showDetails = function(entity) {
        	
        	// The body of this function was copied from the rowClick handler
        	// in topcat's meta-panel.controller.js
        	
            var facility = tc.facility(entity.facilityName);
            var config;
            if(entity.type == 'facility'){
                config = tc.config().browse.metaTabs;
            } else if(facility.config() && facility.config().browse[entity.type]) {
                config = facility.config().browse[entity.type].metaTabs;
            } else {
            	// debugging
            	if( ! facility.config() ) {
            		that.errMsg = "No config found for '" + entity.facilityName + "'";
            	}
            	// ultimate fallback?
            	config = tc.config().browse.metaTabs;
            }

            if(!config) return;

            helpers.setupMetatabs(config, entity.type);

            var entityHash = entity.facilityName + ":" + entity.type + ":" + entity.id;
            if(entityHash == previousEntityHash){
                that.metaTabs = [];
                previousEntityHash = undefined;
                return;
            }
            previousEntityHash = entityHash;
            
            var queryBuilder = facility.icat().queryBuilder(entity.type).where(entity.type + ".id = " + entity.id);

            if(entity.type == 'instrument'){
                queryBuilder.include('instrumentScientistUser');
            }

            if(entity.type == 'investigation'){
                queryBuilder.include('user');
                queryBuilder.include('investigationParameterType');
                queryBuilder.include('sample');
                queryBuilder.include('publication');
                queryBuilder.include('investigationUser');
            }

            if(entity.type == 'dataset'){
                queryBuilder.include('datasetParameterType');
                queryBuilder.include('sample');
                queryBuilder.include('datasetType');
            }

            if(entity.type == 'datafile'){
                queryBuilder.include('datafileParameterType');
            }



            queryBuilder.run().then(function(entity){
                entity = entity[0];

                var tabs = [];
                _.each(config, function(tabConfig){
                    var tab = {
                        title: $translate.instant(tabConfig.title),
                        items: []
                    };
                    _.each(tabConfig.items, function(itemConfig){
                        var find = entity.entityType;
                        var field = itemConfig.field;
                        var matches;
                        if(matches = itemConfig.field.replace(/\|.+$/, '').match(/^(.*)?\.([^\.\[\]]+)$/)){
                            find = matches[1];
                            field = matches[2]
                        }
                        if(!find.match(/\]$/)) find = find + '[]';
                        _.each(entity.find(find), function(entity){
                            var value = entity.find(field)[0];
                            if(value !== undefined){
                                tab.items.push({
                                    label: itemConfig.label ? $translate.instant(itemConfig.label) : null, 
                                    template: itemConfig.template,
                                    value: value,
                                    entity: entity
                                });
                            }
                        });
                    });

                    tabs.push(tab);
                });

                that.metaTabs = tabs;
            });
        };

        function getAllJobTypes(){
            var promises = [];
            var allJobTypes = [];
            return tc.ijp(facilityName).getJobType().then(function(jobTypeNames){
                _.each(jobTypeNames, function(jobTypeName){
                    promises.push(
                        tc.ijp(facilityName).getJobType(jobTypeName).then(function (jobType){
                            allJobTypes.push(jobType);
                        }, function(){
                            console.error("Failed to get job type data for " + jobTypeName);
                        })
                    );
                });
                return $q.all(promises).then(function(){
                    return allJobTypes;
                });
            }, function(){
                console.error("Failed to get job type names");
                return
            })
        }

        function getCompatibleJobTypes(){
            getAllJobTypes().then(function(allJobTypes){
                if (inputContainsDatasets) {
                    getInputDatasetTypes().then(function(inputDatasetTypes){

                        //Only include jobs that explicitly accept datasets
                        var compatibleJobTypes = _.filter(allJobTypes, function(jobType){ return jobType.acceptsDatasets});

                        //Filters the list of job types to only contain jobs that are compatible with all the input entity dataset types
                        compatibleJobTypes = _.filter(compatibleJobTypes, function(jobType){
                            return _.every(inputDatasetTypes, function(inputDatasetType){
                                return _.includes(jobType.datasetTypes, inputDatasetType);
                            });
                        });

                        //If there is more than one input entity, filters out interactive jobs that don't accept multiple inputs
                        if (multipleInputEntities) compatibleJobTypes = _.filter(compatibleJobTypes, function(jobType){ return (jobType.type === "batch" || jobType.multiple) });

                        //Only include jobs that explicitly accept datafiles
                        if (inputContainsDatafiles) compatibleJobTypes = _.filter(compatibleJobTypes, function(jobType){ return jobType.acceptsDatafiles});

                        that.compatibleJobTypes = compatibleJobTypes;
                        that.selectedJobType = _.find(that.compatibleJobTypes, function(jobType){ return jobType.name === $rootScope.selectedJobType; }) || $filter('orderBy')(that.compatibleJobTypes, 'name')[0] || "";
                        that.loadingJobTypes = false;
                        setupBooleanGroupOptions();
                        setupJobDefaults();
                    });

                } else if (inputContainsDatafiles) {

                    //If the input entities include datafiles, the job type must explicitly accept datafiles
                    var compatibleJobTypes = _.filter(allJobTypes, function(jobType) { return jobType.acceptsDatafiles });

                    //If there is more than one input entity, filters out interactive jobs that don't accept multiple inputs
                    if (multipleInputEntities) compatibleJobTypes = _.filter(compatibleJobTypes, function(jobType){ return (jobType.type === "batch" || jobType.multiple) });

                    that.compatibleJobTypes = compatibleJobTypes;
                    that.selectedJobType = _.find(that.compatibleJobTypes, function(jobType){ return jobType.name === $rootScope.selectedJobType; }) || $filter('orderBy')(that.compatibleJobTypes, 'name')[0] || "";
                    that.loadingJobTypes = false;
                    setupBooleanGroupOptions();
                    setupJobDefaults();

                } else {
                    //If there is no input, show 'job-only' jobs, where neither datasets nor datafiles are accepted
                    var compatibleJobTypes = _.filter(allJobTypes, function(jobType) { return !(jobType.acceptsDatafiles || jobType.acceptsDatasets) });
                    that.compatibleJobTypes = compatibleJobTypes;
                    that.selectedJobType = _.find(that.compatibleJobTypes, function(jobType){ return jobType.name === $rootScope.selectedJobType; }) || $filter('orderBy')(that.compatibleJobTypes, 'name')[0] || "";
                    that.loadingJobTypes = false;
                    setupBooleanGroupOptions();
                    setupJobDefaults();
                }

            });

        }

        function getInputDatasetTypes(){
            var inputDatasets = _.filter(inputEntities, function(inputEntity){ return inputEntity.entityType === 'dataset'; });
            var inputDatasetIds = _.map(inputDatasets, 'entityId');

            var deferred = $q.defer();
            tc.icat(facilityName).query("select distinct dataset.type.name from Dataset dataset where dataset.id in ('" + inputDatasetIds.join("','") + "')").then(function(datasetTypes) {
                deferred.resolve(datasetTypes);
            }, function(error){
                deferred.reject(error);
            });
            return deferred.promise;
        }

        function getInputDatasetFields(){
            var inputDatasets = _.filter(inputEntities, function(inputEntity){ return inputEntity.entityType === 'dataset'; });
            var inputDatasetIds = _.map(inputDatasets, 'entityId');

            return tc.icat(facilityName).query("select dataset.id, dataset.name, dataset.type.name from Dataset dataset where dataset.id in ('" + inputDatasetIds.join("','") + "')").then(function(results) {
                var inputDatasetFields = [];
                _.each(results, function(result){
                	inputDatasetFields.push({
                		id : result[0],
                		name : result[1],
                		datasetType : result[2],
                		type : "dataset",
                		facilityName : facilityName
                	});
                });
                // that.datasetGridOptions.data = inputDatasetFields;
                return inputDatasetFields;
            });
        }

        function getInputDatafileFields(){
            var inputDatafiles = _.filter(inputEntities, function(inputEntity){ return inputEntity.entityType === 'datafile'; });
            var inputDatafileIds = _.map(inputDatafiles, 'entityId');

            tc.icat(facilityName).query("select datafile.id, datafile.name, datafile.location, datafile.fileSize from Datafile datafile where datafile.id in ('" + inputDatafileIds.join("','") + "')").then(function(results) {
                that.inputDatafileFields = [];
                _.each(results, function(result){
                	that.inputDatafileFields.push({
                		id : result[0],
                		name : result[1],
                		location : result[2],
                		fileSize : result[3],
                		type : "datafile",
                		facilityName : facilityName
                	});
                });
                that.datafileGridOptions.data = that.inputDatafileFields;
            }, function(error){
                that.errMsg = "Failed to get datafile fields";
            });
        }

        function setupBooleanGroupOptions() {
            _.each(that.compatibleJobTypes, function(jobType){
                //Change structure of any 'boolean group' job options so they are more easily constructible in html
                //Find unique boolean group names
                var groupNames = _.uniq(_.filter(_.map(jobType.jobOptions, 'groupName'), undefined));
                _.each(groupNames, function(groupName){
                    //Find first option associated with that group, replace it with a single object containing all option information for that group,
                    //and remove all following objects associated with that group
                    var firstGroupMember = _.findIndex(jobType.jobOptions, function(option) { return option.groupName === groupName});
                    var newJobOption = {
                        groupName: groupName,
                        type: "booleanGroup",
                        programParameter: "",
                        values: []
                    };
                    _.each(_.filter(jobType.jobOptions, function(option){
                        return option.groupName === groupName;
                    }), function(groupJobOption) {
                        newJobOption.values.push({
                            name: groupJobOption.name,
                            programParameter: groupJobOption.programParameter
                        });
                    });
                    jobType.jobOptions[firstGroupMember] = newJobOption;
                    _.remove(jobType.jobOptions, function(option) { return option.groupName === groupName && option.type !== 'booleanGroup' });
                });

            });
        }

        function setupJobDefaults(){
            _.each(that.compatibleJobTypes, function(jobType){
                _.each(jobType.jobOptions, function(option){
                    switch (option.type) {
                        case "boolean":
                            option.value = option.defaultValue || false;
                            break;
                        case "integer":
                        case "float":
                            //isNaN check required instead of just ||, because option.defaultValue = false if defaultValue = 0
                            option.value = isNaN(parseFloat(option.defaultValue)) ? "" : parseFloat(option.defaultValue);
                            break;
                        case "string":
                            option.value = option.defaultValue || "";
                            break;
                        case "enumeration":
                            option.value = option.defaultValue || option.values[0];
                            break;
                        case "booleanGroup":
                            option.value = option.values[0].programParameter;
                    }
                });
            });
        }

        function setUpGridOptions(gridOptions,entityType){

            gridOptions.enableHorizontalScrollbar = uiGridConstants.scrollbars.NEVER;
            gridOptions.enableRowSelection =  false;
            gridOptions.enableRowHeaderSelection =  false;
            gridOptions.gridMenuShowHideColumns =  false;
            gridOptions.pageSize =  !that.isScroll ? pagingConfig.paginationNumberOfRows : null;
            gridOptions.paginationPageSizes =  pagingConfig.paginationPageSizes;
            gridOptions.paginationNumberOfRows =  pagingConfig.paginationNumberOfRows;
            // Filtering is probably overkill, but we shall see...
            gridOptions.enableFiltering = false;
            // ng-click action no longer uses entityType to show dataset details
            gridOptions.rowTemplate = '<div ng-click="grid.appScope.showDetails(row.entity)" ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader }" ui-grid-cell></div>';

            _.each(gridOptions.columnDefs, function(columnDef){
                columnDef.enableHiding = false;

                // We don't have Date-valued columns at present, but might in future, so this might be handy...
                if(columnDef.field == 'date'){
                    columnDef.filters = [
                        {
                            "condition": function(filterDate, cellDate) {
                                if (filterDate == "") return true;
                                //Need to format dates so they are similar. Remove time from cellDate and remove double escapes from filterDate.
                                return new Date(cellDate.replace(/\s.*$/,'')) >= new Date(filterDate.replace(/\\/g,''));
                            },
                            "placeholder": "From..."
                        },
                        {
                            "condition": function(filterDate, cellDate) {
                                if (filterDate == "") return true;
                                //Need to format dates so they are similar. Remove time from cellDate and remove double escapes from filterDate.
                                return new Date(cellDate.replace(/\s.*$/,'')) <= new Date(filterDate.replace(/\\/g,''));
                            },
                            "placeholder": "To..."
                        }
                    ];
                    columnDef.filterHeaderTemplate = '<div class="ui-grid-filter-container" datetime-picker only-date ng-model="col.filters[0].term" placeholder="From..."></div><div class="ui-grid-filter-container" datetime-picker only-date ng-model="col.filters[1].term" placeholder="To..."></div>';
                    columnDef.sort = {
                        direction: uiGridConstants.DESC
                    };
                } else {
                    columnDef.filter = {
                        "condition": uiGridConstants.filter.CONTAINS,
                        "placeholder": "Containing...",
                        "type": "input"
                    };
                }

                columnDef.displayName = "CONFIGURE_JOB.MODAL.INPUTS.COLUMN." + helpers.constantify(columnDef.field);
                columnDef.headerCellFilter = 'translate';

            });

        }

    });

})();
