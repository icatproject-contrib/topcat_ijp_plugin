(function() {
    'use strict';

    var app = angular.module('topcat');

    app.decorator('tc', function tcDecorator($delegate){

        function ijp(facilityName) {
            return $delegate.facility(facilityName).ijp();
        };

        function ijpFacilities() {
            return _.select($delegate.userFacilities(), function(facility){ return facility.config().ijpUrl !== undefined; });
        };

        $delegate.ijp = ijp;
        $delegate.ijpFacilities = ijpFacilities;

        return $delegate;

   })

})();