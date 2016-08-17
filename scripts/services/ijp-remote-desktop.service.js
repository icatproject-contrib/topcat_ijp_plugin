

(function() {
    'use strict';

    var app = angular.module('topcat');

    app.service('tcIjpRemoteDesktop', function($q, $state, helpers){

    	this.create = function(ijp){
    		return new IjpRemoteDesktop(ijp);
    	};

    	function IjpRemoteDesktop(ijp){
        var that = this;
        var facility = ijp.facility();

        this.openSession = function(sessionDetails){
          var out = $q.defer();
          this.get('rdp', {
            accountName: sessionDetails.username,
            password: sessionDetails.password,
            hostName: sessionDetails.host
          }).then(function(response){
            var filename = $state.params.facilityName + '_remote_session.rdp';
            var contentType = 'application/x-rdp';
            var blob = new Blob([response], { type: contentType });

            var urlCreator = window.URL || window.webkitURL || window.mozURL || window.msURL;
            var url = urlCreator.createObjectURL(blob);

            var downloadLink = angular.element('<a></a>');
            downloadLink.css({ display: 'none' });
            angular.element(document.body).append(downloadLink);
            downloadLink.attr('href', url);
            downloadLink.attr('download', filename);
            downloadLink[0].click();

            out.resolve(response);
          }, function(){ out.reject(); });
          return out.promise;
        };

        if (facility.config().ijpUrl == undefined) console.error('ijpUrl is undefined for facility ' + facility.config().title);
        helpers.generateRestMethods(this, facility.config().ijpUrl + '/ijp/');

    	}

	});

})();