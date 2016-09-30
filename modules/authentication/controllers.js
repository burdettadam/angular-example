'use strict';

angular.module('Authentication')

.controller('LoginController',
    ['$scope', '$rootScope', '$location', 'AuthenticationService',
    function ($scope, $rootScope, $location, AuthenticationService) {
        // reset login status
        AuthenticationService.ClearCredentials();

        $scope.login = function () {
            $scope.dataLoading = true;
            AuthenticationService.Login($scope.username, $scope.password, function (response) {
                if (response.success) {
                    AuthenticationService.SetCredentials($scope.username, $scope.password);
                    $location.path('/');
                } else {
                    $scope.error = response.message;
                    $scope.dataLoading = false;
                }
            });
        };
    }]);
wrangler.clientKey = "CDEAACCE-85F9-11E6-884F-74B0E71C24E1&state=1239234";
wrangler.anonECI = "85255500-0b65-0130-243c-00163ebcdddd";
wrangler.callbackURL = "https://burdettadam.github.io/angular-example/";
wrangler.host = "kibdev.kobj.net"; // change to cs.kobj.net when in production
wrangler.login_server = "kibdev.kobj.net"; // change to accounts.kobj.net when in production
wrangler.eventPath = 'sky/event';
wrangler.functionPath ='sky/cloud';