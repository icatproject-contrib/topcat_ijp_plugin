

registerTopcatPlugin(function(){

	var baseUrl = 'https://localhost:8000/topcat_plugin_ijp';
	var controllersUrl = baseUrl + '/scripts/controllers/';
	var servicesUrl = baseUrl + '/scripts/services/'
	var viewsUrl = baseUrl + '/views/';
	var stylesUrl = baseUrl + '/styles/';

	return {
		scripts: [
			controllersUrl + 'my-jobs.controller.js',
			controllersUrl + 'configure-job.controller.js',
			servicesUrl + 'ijp-remote-desktop.service.js',
			servicesUrl + 'ijp.service.js'
		],

		stylesheets: [
			stylesUrl + 'main.css'
		],

		setup: function($uibModal, tc, ijpService){

			tc.ui().registerMainTab('my-jobs', 
			    {
                    '': {
                        templateUrl: viewsUrl + 'main-my-jobs.html'
                    },
                    '@home.my-jobs': {
                        templateUrl: viewsUrl + 'partial-my-jobs-panel.html',
                        controller: 'MyJobsController as myJobsController'
                    }
                },
                {
				    insertAfter: 'my-data',
				    multiFacility: true
			    });

			tc.ui().registerCartButton('configure-job', {
				insertBefore: 'cancel',
				class: 'btn btn-success',
				if: ijpService.ijpFacilities().length === 1
			}, function(){
				console.log(ijpService.ijpFacilities().length);
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

