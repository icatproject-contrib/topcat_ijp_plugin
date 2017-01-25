

registerTopcatPlugin(function(pluginUrl){

    var controllersUrl = pluginUrl + '/scripts/controllers/';
    var servicesUrl = pluginUrl + '/scripts/services/';
    var directivesUrl = pluginUrl + '/scripts/directives/';
    var decoratorsUrl = pluginUrl + '/scripts/decorators/';
    var viewsUrl = pluginUrl + '/views/';
    var stylesUrl = pluginUrl + '/styles/';

    return {
        scripts: [
            [pluginUrl + '/bower_components/jquery-no-vnc/dist/jquery-no-vnc.js', function(){
				return $.fn.noVnc !== undefined;
			}],
            controllersUrl + 'my-jobs.controller.js',
            controllersUrl + 'configure-job.controller.js',
            directivesUrl + 'provenance-details.directive.js',
            directivesUrl + 'interactive-job.directive.js',
            servicesUrl + 'ijp-remote-desktop.service.js',
            servicesUrl + 'ijp.service.js',
            decoratorsUrl + 'tc-facility.decorator.js',
            decoratorsUrl + 'tc.decorator.js'
        ],

        stylesheets: [
            stylesUrl + 'main.css'
        ],

        configSchema: {
    	    facilities: {
    	        _item: {
    	            ijpUrl: { _type: 'string', _mandatory: false },
    	            browse:{
    	                dataset: {
    	                     gridOptions: {
        	                     enableConfigureJob: { _type: 'boolean' },
    	                         externalSelectFilters: {
    	                             enableJobTypeFilter: { _type: 'boolean' },
    	                             filters: {
    	                                    _type: 'array',
    	                                    _item: {
    	                                        field: { _type: 'string'}
    	                                    }
    	                             },
    	                         }
    	                     }
    	                },
    	                datafile: {
    	                     gridOptions: {
        	                     enableConfigureJob: { _type: 'boolean' },
    	                         externalSelectFilters: {
    	                             filters: {
    	                                    _type: 'array',
    	                                    _item: {
    	                                        field: { _type: 'string'}
    	                                    }
    	                             },
    	                         }
    	                     }
    	                }
    	            }
    	        }
    	    }
        },

        setup: function($rootScope, $state, $uibModal, $q, tc, icatSchema, helpers){

            //Add tab to show user's jobs
            tc.ui().registerMainTab('my-jobs', viewsUrl + 'my-jobs.html',
                {
                    insertAfter: 'my-data',
                    multiFacility: true,
                    controller: 'MyJobsController as myJobsController',
                    params: {
                        pluginUrl: pluginUrl
                    }
                });

            //If there is only one facility logged in, only show a generic 'Configure Job' button in the cart
            tc.ui().registerCartButton('configure-job', {
                insertBefore: 'cancel',
                class: 'btn btn-success',
                show: function() { return tc.userFacilities().length === 1 && tc.ijpFacilities().length === 1; }
            }, function(){
                $uibModal.open({
                    templateUrl: viewsUrl + 'configure-job.html',
                    controller: 'ConfigureJobController as configureJobController',
                    size: 'lg',
                    resolve: {
                        inputEntities: function() {
                            return tc.ijpFacilities()[0].user().cart().then(function(cart){
                                return cart.cartItems;
                            });
                        },
                        facilityName: function() { return tc.ijpFacilities()[0].config().name; },
                        pluginUrl: function() { return pluginUrl; }
                    }
                });
            });

            //If there is more than 1 facility logged in, specify the facility on the 'Configure Job' button in the cart
            _.each(_.select(tc.facilities(), function(facility){ return facility.config().ijpUrl !== undefined; }), function(ijpFacility){
                tc.ui().registerCartButton('configure-job-multi-facility', {
                    insertBefore: 'cancel',
                    class: 'btn btn-success',
                    show: function() { return tc.userFacilities().length > 1 && _.some(tc.ijpFacilities(), function(authenticatedIjpFacility){ return authenticatedIjpFacility.config().name === ijpFacility.config().name }); },
                    translateValues: '{ facilityTitle: \'' + ijpFacility.config().title + '\', facilityName: \'' + ijpFacility.config().name + '\' }'
                }, function(){
                    $uibModal.open({
                        templateUrl: viewsUrl + 'configure-job.html',
                        controller: 'ConfigureJobController as configureJobController',
                        size: 'lg',
                        resolve: {
                            inputEntities: function() {
                                return ijpFacility.user().cart().then(function(cart){
                                    return cart.cartItems;
                                });
                            },
                            facilityName: function() { return ijpFacility.config().name; },
                            pluginUrl: function() { return pluginUrl; }
                        }
                    });
                })
            });

            //Add button to configure a job straight from the 'Browse' table
            tc.ui().registerEntityActionButton('configure-job', {
                entityTypes: ['dataset','datafile'],
                class: 'btn btn-success',
                show: function() { var out = tc.facility($state.params.facilityName).config().browse[$state.current.param.entityType].gridOptions.enableConfigureJob; return out === undefined ? false : out}
            }, function(entity){
                $uibModal.open({
                    templateUrl: viewsUrl + 'configure-job.html',
                    controller: 'ConfigureJobController as configureJobController',
                    size: 'lg',
                    resolve: {
                        inputEntities: function() { return [{
                            entityType: entity.entityType.toLowerCase(),
                            entityId: entity.id
                        }]; },
                        facilityName:  function() { return entity.facility.config().name; },
                        pluginUrl: function() { return pluginUrl; }
                    }
                });
            });

            //Add button to show show the dataset on the 'browse' table
            tc.ui().registerEntityActionButton('show-dataset', {
                entityTypes: ['dataset'],
                class: 'btn btn-success'
            }, function(entity){
                entity.browse();
            });

            function modifyQueryForLatestVersion(query) {
                query.where('not exists ('
                              + 'SELECT 1 FROM dataset.parameters AS xDatasetParameter, xDatasetParameter.type AS xDatasetParameterType '
                              + 'WHERE xDatasetParameter.dataset = dataset AND xDatasetParameterType.name = \'vicat:superseded\''
                              + ')');
            }


            tc.ui().registerExternalGridFilter(['browse'], {
                modifyQuery: modifyQueryForLatestVersion
            });

            //Add select boxes above the 'Browse' grid to allow filtering by job type (or any Topcat jpql variable)
            tc.ui().registerExternalGridFilter(['browse'], {
                template: '<div ng-if="browseEntitiesController.gridOptions.externalSelectFilters.filters.length !== 0" class ="form-inline">' +
                              '<div class="form-group filter-row" ng-repeat="filter in browseEntitiesController.gridOptions.externalSelectFilters.filters">' +
                                  '<select ng-if="filter.options.length > 0" class="form-control filter-select" ng-model="filter.selectedOption" ng-options="option as option for option in filter.options | orderBy:option" ng-change="browseEntitiesController.externalGridFilterChanged()">' +
                                      '<option value="" selected translate="{{browseEntitiesController.gridOptions.externalSelectFilters.filterText}}" translate-values="{ filterName: (filter.label | translate) }"></option>' +
                                  '</select>' +
                              '</div>' +
                          '</div>',
                setup: function(){
                    var that = this;
                    var entityType = $state.current.param.entityType;
                    var facilityName = $state.params.facilityName;
                    var gridOptions = this.gridOptions;

                    gridOptions.externalSelectFilters = gridOptions.externalSelectFilters || {};
                    gridOptions.externalSelectFilters.filters = gridOptions.externalSelectFilters.filters || [];
                    gridOptions.externalSelectFilters.filterText = 'SELECT_FILTERS.FILTER_TEXT';

                    //Set up the filters (translate labels, entity paths etc.)
                    _.each(gridOptions.externalSelectFilters.filters, function(filter){
                        var matches = filter.field.match(/^(\w*)?\.?(\w*)$/);
                        if (matches[2]) {
                            filter.variableName = matches[1];
                            filter.fieldName = matches[2];
                        } else {
                            filter.fieldName = matches[1];
                        }

                        if (filter.variableName) {
                            _.each(icatSchema.entityTypes, function(entityType){
                                _.each(entityType.relationships, function(relationship){
                                    if (_.isEqual(relationship.variableName, filter.variableName)){
                                        filter.entityType = relationship.entityType;
                                    }
                                });

                            });

                            var variablePaths = icatSchema.entityTypes[entityType].variablePaths;
                            var variablePath = variablePaths[filter.variableName] || [];
                            filter.variablePath = _.flatten([[entityType], variablePath]).join('.');
                        } else {
                            filter.variablePath = entityType;
                        }

                        if(!filter.label){
                            var entityTypeNamespace = helpers.constantify(entityType);
                            if (filter.entityType) {
                                var fieldNamespace = helpers.constantify(filter.entityType)
                            } else {
                                var fieldNamespace = helpers.constantify(filter.field);
                            }
                            filter.label = "SELECT_FILTERS." + entityTypeNamespace + "." + fieldNamespace;
                        }

                        //Query icat to get the filter options
                        var out = tc.icat(facilityName).queryBuilder(filter.entityType || entityType);
                        _.each($state.params, function(id, name){
                            var matches;
                            if(matches = name.match(/^(.*)Id$/)){
                                var variableName = matches[1];
                                out.where(["?.id = ?", variableName.safe(), parseInt(id)]);
                            }
                        });
                        out.limit(0, 50);

                        out.run($q.defer().promise).then(function(entities){
                            filter.options = [];
                            var filterOptions = [];
                            _.each(entities, function(entity){
                                filterOptions.push(entity[filter.fieldName]);
                            });
                            filter.options = _.uniq(filterOptions);

                        }, function(error) {
                            var errorMessage = "Failed to load external filter: " + filter.field + "\n";
                            console.error(errorMessage.concat(JSON.stringify(error) || ""));
                        });

                    });

                    //Set up job type filter, a special case
                    if (gridOptions.externalSelectFilters.enableJobTypeFilter) {
                        tc.ijp(facilityName).getJobType().then(function(jobTypeNames) {

                            var filterConfig = {
                                isJobTypeFilter: true,
                                label: "SELECT_FILTERS.JOB_TYPE.NAME",
                                options: jobTypeNames,
                                datasetTypes: {}
                            };

                            _.each(jobTypeNames, function(jobTypeName){
                                tc.ijp(facilityName).getJobType(jobTypeName).then(function(jobType){
                                    filterConfig.datasetTypes[jobTypeName] = jobType.datasetTypes;
                                });
                            });

                            gridOptions.externalSelectFilters.filters.push(filterConfig);

                        }, function(error){
                            var errorMessage = "Failed to load job type filter\n";
                            console.error(errorMessage.concat(JSON.stringify(error) || ""));
                        });
                    }
                },
                modifyQuery: function(query){
                    _.each(this.gridOptions.externalSelectFilters.filters, function(filter){
                        if (filter.selectedOption) {
                            if (filter.variablePath) {
                                query.where(['?.? = ?', filter.variablePath.safe(), filter.fieldName.safe(), filter.selectedOption]);
                            } else {
                                //If there is no variable path, it must be the job type filter, which searches by dataset type
                                $rootScope.selectedJobType = filter.selectedOption;
                                query.where(['dataset.type.name in (?)', ("'" + filter.datasetTypes[filter.selectedOption].join("','") + "'").safe()]);
                            }
                        }
                   });
                }
            });
        }
    };
});

