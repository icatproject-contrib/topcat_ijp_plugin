

registerTopcatPlugin(function(){
	return {
		scripts: [
			'https://localhost:8000/scripts/controllers/my-jobs.controller.js'
		],

		stylesheets: [],

		setup: function(tc){

			tc.ui().registerMainTab('my-jobs', 'https://localhost:8000/views/my-jobs.html', {
				insertAfter: 'my-data',
				controller: 'MyJobsController as myJobsController'
			});

			tc.ui().registerCartButton('configure-job', 'https://localhost:8000/views/my-jobs.html', {
				insertBefore: 'cancel',
				controller: 'MyJobsController as myJobsController'
			});

		}
	};
});

