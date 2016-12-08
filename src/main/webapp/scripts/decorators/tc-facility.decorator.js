(function() {
    'use strict';

    var app = angular.module('topcat');

    app.decorator('tcFacility', function tcFacilityDecorator($delegate, tcIjp){

        var create = $delegate.create;

        function decoratedCreate(tc, name, APP_CONFIG) {
            var decoratedFacility = create.apply($delegate, arguments);
            decoratedFacility.ijp = ijp;
            return decoratedFacility;
        };

        function ijp() {
            if(!this.ijpInstance) this.ijpInstance = tcIjp.create(this);
            return this.ijpInstance;
        };

        $delegate.create = decoratedCreate;

        return $delegate;

   })

})();