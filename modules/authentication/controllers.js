'use strict';

    wrangler.clientKey = "CDEAACCE-85F9-11E6-884F-74B0E71C24E1&state=1239234";
    wrangler.anonECI = "85255500-0b65-0130-243c-00163ebcdddd";
    wrangler.callbackURL = "https://burdettadam.github.io/angular-example/code";
    wrangler.host = "kibdev.kobj.net"; // change to cs.kobj.net when in production
    wrangler.login_server = "kibdev.kobj.net"; // change to accounts.kobj.net when in production
    wrangler.eventPath = 'sky/event';
    wrangler.functionPath ='sky/cloud';

function plant_authorize_button()
    {
        //Oauth through kynetx
        console.log("plant authorize button");
        var OAuth_kynetx_URL = wrangler.getOAuthURL();
        $('#authorize-link').attr('href', OAuth_kynetx_URL);
        var OAuth_kynetx_newuser_URL = wrangler.getOAuthNewAccountURL();
        $('#create-link').attr('href', OAuth_kynetx_newuser_URL);
        
        $('#account-link').attr('href', "https://" + wrangler.login_server + "/login/profile");
        $('#account-link-2').attr('href', "https://" + wrangler.login_server + "/login/profile");
        
        $('#logout-link').off('tap').on('tap', function(event) {
            window.open("https://" + wrangler.login_server + "/login/logout?" + Math.floor(Math.random() * 9999999), "_blank");
            wrangler.removeSession(true); // true for hard reset (log out of login server too)
            $.mobile.changePage('#page-authorize', {
                transition: 'slide'
            }); // this will go to the authorization page.
        });
    };


var app = angular.module('Authentication');

app.controller('LoginController',
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

        console.log("document ready");
        wrangler.retrieveSession();
        // only put static stuff here...
        plant_authorize_button();

    }]);


app.controller('CodeController',
    ['$scope', '$rootScope', '$location', 'AuthenticationService',
    function ($scope, $rootScope, $location, AuthenticationService) {
/*
    wrangler.clientKey = "CDEAACCE-85F9-11E6-884F-74B0E71C24E1&state=1239234";
    wrangler.anonECI = "85255500-0b65-0130-243c-00163ebcdddd";
    wrangler.callbackURL = "https://burdettadam.github.io/angular-example/#/code";
    wrangler.host = "kibdev.kobj.net"; // change to cs.kobj.net when in production
    wrangler.login_server = "kibdev.kobj.net"; // change to accounts.kobj.net when in production
    wrangler.eventPath = 'sky/event';
    wrangler.functionPath ='sky/cloud';

    wrangler.getOAuthAccessToken(wrangler.retrieveOAuthCode(), function(oauth_payload)
    {
      if (!oauth_payload.OAUTH_ECI) {
        alert("Authentication failed. We apologize for this inconvenience. Please try again.");
      } else {
             console.log("Authorized");            // display authorization 
            /// Devtools.initAccount({}, function(kns_directives){ // bootstraps
            //  console.log("Received directives from bootstrap.execute: ", kns_directives);
            //  $.mobile.loading("hide");
           //   window.location = "index.html";
           // });
             window.location = "index.html";
           }
         },
         function(json){
          console.log("something went wrong with the OAuth authorization " + json);
          alert("Something went wrong with your authorization. Please try again. ");
          // not ideal, but...
          window.location = "https://kibdev.kobj.net/login";
        }
        );
        */
    }]);