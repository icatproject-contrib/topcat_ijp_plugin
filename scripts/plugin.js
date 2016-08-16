

registerTopcatPlugin(function(pluginUrl){

    var controllersUrl = pluginUrl + '/scripts/controllers/';
    var servicesUrl = pluginUrl + '/scripts/services/';
    var decoratorsUrl = pluginUrl + '/scripts/decorators/';
    var viewsUrl = pluginUrl + '/views/';
    var stylesUrl = pluginUrl + '/styles/';

    return {
        scripts: [
            controllersUrl + 'my-jobs.controller.js',
            controllersUrl + 'configure-job.controller.js',
            servicesUrl + 'ijp-remote-desktop.service.js',
            servicesUrl + 'ijp.service.js',
            decoratorsUrl + 'tc-facility.decorator.js',
            decoratorsUrl + 'tc.decorator.js'
        ],

        stylesheets: [
            stylesUrl + 'main.css'
        ],

        configSchema: function(){
            this.attribute('facilities', function(){
                    this.type('array');
                    this.attribute('*', function(){
                        this.attribute('title', function(){ this.type("string"); });
                        this.attribute('name', function(){ this.type("string"); });
                        this.attribute('idsUrl', function(){ this.type("string"); });
                        this.attribute('icatUrl', function(){ this.type("string"); this.mandatory(false); });
                        this.attribute('ijpUrl', function(){ this.type("string"); this.mandatory(false); });
                        this.attribute('hierarchy', function(){
                            this.type('array');
                            this.attribute('*', function(){
                                this.type("string");
                            });
                        });
                        this.attribute('authenticationTypes', function(){
                            this.type('array');
                            this.attribute('*', function(){
                                this.attribute('title', function(){ this.type("string"); });
                                this.attribute('plugin', function(){ this.type("string"); });
                                this.attribute('casUrl', function(){ this.type("string"); this.mandatory(function(o){
                                    return o.plugin == 'cas';
                                }); });
                            });
                        });
                        this.attribute('downloadTransportTypes', function(){
                            this.type('array');
                            this.mandatory(false);
                            this.attribute('*', function(){
                                this.attribute('type', function(){ this.type("string"); });
                                this.attribute('idsUrl', function(){ this.type("string"); });
                            });
                        });
                        this.attribute('admin', function(){
                            this.attribute('gridOptions', function(){
                                this.attribute('columnDefs', function(){
                                    this.type('array');
                                    this.attribute('*', function(){
                                        this.attribute('title', function(){ this.type("string"); this.mandatory(false); });
                                        this.attribute('field', function(){ this.type("string"); });
                                        this.attribute('cellTemplate', function(){ this.type('string'); this.mandatory(false); });
                                    });
                                });
                            });
                        });
                        this.attribute('myData', function(){
                            this.attribute('entityType', function(){ this.type('string'); });
                            this.attribute('gridOptions', function(){
                                this.attribute('enableSelection', function(){ this.type('boolean'); this.mandatory(false); });
                                this.attribute('columnDefs', function(){
                                    this.type('array');
                                    this.attribute('*', function(){
                                        this.attribute('title', function(){ this.type("string"); this.mandatory(false); });
                                        this.attribute('field', function(){ this.type("string"); });
                                        this.attribute('cellTemplate', function(){ this.type('string'); this.mandatory(false); });
                                        this.attribute('jpqlFilter', function(){ this.type('string'); this.mandatory(false); });
                                        this.attribute('jpqlSort', function(){ this.type('string'); this.mandatory(false); });
                                        this.attribute('link', function(){ this.type('boolean|string'); this.mandatory(false); });
                                        this.attribute('where', function(){ this.type('string'); this.mandatory(false); });
                                        this.attribute('excludeFuture', function(){ this.type('boolean'); this.mandatory(false); });
                                        this.attribute('sort', function(){
                                            this.mandatory(false);
                                            this.attribute('direction', function(){ this.type("string"); });
                                            this.attribute('priority', function(){ this.type("number"); this.mandatory(false); });
                                        });
                                    });
                                });
                            });
                        });
                        this.attribute('browse', function(){
                            var that = this;
                            _.each(["instrument", "facilityCycle", "investigation", "proposal", "dataset", "datafile"], function(entityType){
                                that.attribute(entityType, function(){
                                    this.mandatory(false);
                                    this.attribute('skipSingleEntities', function(){ this.type('boolean'); this.mandatory(false); });
                                    this.attribute('gridOptions', function(){
                                        if(entityType == 'investigation' || entityType == 'dataset' || entityType == 'datafile'){
                                            this.attribute('enableSelection', function(){ this.type('boolean'); this.mandatory(false); });
                                        }
                                        if(entityType == 'dataset' || entityType == 'datafile'){
                                            this.attribute('enableConfigureJob', function(){ this.type('boolean'); this.mandatory(false); });
                                        }
                                        if(entityType == 'datafile'){
                                            this.attribute('enableDownload', function(){ this.type('boolean'); this.mandatory(false); });
                                        }
                                        this.attribute('columnDefs', function(){
                                            this.type('array');
                                            this.attribute('*', function(){
                                                this.attribute('title', function(){ this.type("string"); this.mandatory(false); });
                                                this.attribute('field', function(){ this.type("string"); });
                                                this.attribute('cellTemplate', function(){ this.type('string'); this.mandatory(false); });
                                                this.attribute('jpqlFilter', function(){ this.type('string'); this.mandatory(false); });
                                                this.attribute('jpqlSort', function(){ this.type('string'); this.mandatory(false); });
                                                this.attribute('link', function(){ this.type('boolean|string'); this.mandatory(false); });
                                                this.attribute('where', function(){ this.type('string'); this.mandatory(false); });
                                                this.attribute('excludeFuture', function(){ this.type('boolean'); this.mandatory(false); });
                                                this.attribute('breadcrumb', function(){ this.type('boolean'); this.mandatory(false); });
                                                this.attribute('breadcrumbTemplate', function(){ this.type('string'); this.mandatory(false); });
                                                this.attribute('sort', function(){
                                                    this.mandatory(false);
                                                    this.attribute('direction', function(){ this.type("string"); });
                                                    this.attribute('priority', function(){ this.type("number"); this.mandatory(false); });
                                                });
                                            });
                                        });
                                    });
                                    this.attribute('metaTabs', function(){
                                        this.type('array');
                                        this.mandatory(false);
                                        this.attribute('*', function(){
                                            this.attribute('title', function(){ this.type("string"); });
                                            this.attribute('items', function(){
                                                this.type('array');
                                                this.attribute('*', function(){
                                                    this.attribute('field', function(){ this.type("string"); });
                                                    this.attribute('label', function(){ this.type("string"); this.mandatory(false); });
                                                    this.attribute('template', function(){ this.type("string"); this.mandatory(false); });
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });

                    });
                });
},

        setup: function($state, $uibModal, tc){

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

            //If there is more than 1 facility logged in, specify the facility on the 'Configure Job' button
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
                entityTypes: ['dataset', 'datafile'],
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

        }
    };
});

