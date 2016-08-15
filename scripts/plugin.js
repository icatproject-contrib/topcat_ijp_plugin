

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

		setup: function($uibModal, tc){

			tc.ui().registerMainTab('my-jobs', viewsUrl + 'my-jobs.html',
                {
				    insertAfter: 'my-data',
				    multiFacility: true,
				    controller: 'MyJobsController as myJobsController'
			    });

			tc.ui().registerCartButton('configure-job', {
				insertBefore: 'cancel',
				class: 'btn btn-success'
			}, function(){
				$uibModal.open({
	                templateUrl : viewsUrl + 'configure-job.html',
	                controller: "ConfigureJobController as configureJobController",
	                size : 'lg',
	                resolve: {
	                    inputEntities: function() {
	                        return getCartItems().then(function(cartItems){
	                            return _.filter(cartItems, function(cartItem){
	                                return cartItem.facilityName === facilityName
	                            })
	                        })
	                    },
	                    facilityName: function() { return facilityName }
	                }
	            });
			});

		}
	};
});

