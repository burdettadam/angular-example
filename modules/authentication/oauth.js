; (function()

{
    window.wrangler = {};

    // ------------------------------------------------------------------------
    wrangler.clientKey = "CDEAACCE-85F9-11E6-884F-74B0E71C24E1&state=1239234";
    wrangler.anonECI = "85255500-0b65-0130-243c-00163ebcdddd";
    wrangler.callbackURL = "https://burdettadam.github.io/angular-example/code.html";
    wrangler.host = "kibdev.kobj.net"; // change to cs.kobj.net when in production
    wrangler.login_server = "kibdev.kobj.net"; // change to accounts.kobj.net when in production
    wrangler.eventPath = 'sky/event';
    wrangler.functionPath ='sky/cloud';

    wrangler.defaultECI = "none";
    wrangler.access_token = "none";

/**
 * check_eci , returns a valid cid.......
 * @param  {String} cid, channel id.
 * @return {String} returns the cid, if no cid passed then check_eci returns wrangler.defaultECI.
 */
    var check_eci = function(cid) {
	var res = cid || wrangler.defaultECI;
	if (res === "none") {
            throw "No wrangler event channel identifier (ECI) defined";
	}
	return res;
    };

    var mkEsl = function(parts,host,apiRoot) {
	if (wrangler.host === "none") { // I dont think this will ever be true.....
            throw "No wrangler host defined";
	}
  var res = "";
  if (typeof apiRoot === "undefined"){
      parts.unshift(host); // adds host to beginning of array
      res = 'https://'+ parts.join("/"); // returns a url structure string
  }else{
      parts.shift(); // removes path from beginning of array
      parts.unshift(apiRoot); // adds host to beginning of array
      res = 'https://'+ parts.join("/"); // returns a url structure string
  }
	return res;
    };

    
    get_rid = function(name) {
        
        var rids = {
            "rulesets": {"prod": "b507901x1.prod",//"v1_wrangler.prod", 
                         "dev" : "b507901x1.prod" //"v1_wrangler.prod"
			},
            "bootstrap":{"prod": "b507901x0.prod", 
                         "dev": "b507901x0.prod"
			}
        };

        return rids[name].prod;
    };




    // ========================================================================
    // Login functions
    // ========================================================================
    wrangler.login = function(username, password, success, failure) {


       var parameters = {"email": username, "pass": password};

       if (typeof wrangler.anonECI === "undefined") {
           console.error("wrangler.anonECI undefined. Configure wrangler.js in wrangler-config.js; failing...");
           return null;
       }

       return wrangler.skyQuery("wrangler",
        "cloudAuth", 
        parameters, 
        function(res){
				    // patch this up since it's not OAUTH
				    if(res.status) {
                       var tokens = {"access_token": "none",
                       "OAUTH_ECI": res.token
                   };
                   wrangler.saveSession(tokens); 
                   if(typeof success == "function") {
                       success(tokens);
                   }
               } else {
                   console.log("Bad login ", res);
                   if(typeof failure == "function") {
                       failure(res);
                   }
               }
           },
           {eci: wrangler.anonECI,
               errorFunc: failure
           }
           );


   };



    // ========================================================================
    // OAuth functions
    // ========================================================================

    // ------------------------------------------------------------------------
    wrangler.getOAuthURL = function(fragment)
    {
        if (typeof wrangler.login_server === "undefined") {
            wrangler.login_server = wrangler.host;
        }


        var client_state = Math.floor(Math.random() * 9999999);
        var current_client_state = window.localStorage.getItem("wrangler_CLIENT_STATE");
        if (!current_client_state) {
            window.localStorage.setItem("wrangler_CLIENT_STATE", client_state.toString());
        }
        var url = 'https://' + wrangler.login_server +
        '/oauth/authorize?response_type=code' +
        '&redirect_uri=' + encodeURIComponent(wrangler.callbackURL + (fragment || "")) +
        '&client_id=' + wrangler.clientKey +
        '&state=' + client_state;

        return (url)
    };

    wrangler.getOAuthNewAccountURL = function(fragment)
    {
        if (typeof wrangler.login_server === "undefined") {
            wrangler.login_server = wrangler.host;
        }


        var client_state = Math.floor(Math.random() * 9999999);
        var current_client_state = window.localStorage.getItem("wrangler_CLIENT_STATE");
        if (!current_client_state) {
            window.localStorage.setItem("wrangler_CLIENT_STATE", client_state.toString());
        }
        var url = 'https://' + wrangler.login_server +
        '/oauth/authorize/newuser?response_type=code' +
        '&redirect_uri=' + encodeURIComponent(wrangler.callbackURL + (fragment || "")) +
        '&client_id=' + wrangler.clientKey +
        '&state=' + client_state;

        return (url)
    };

//https://kibdev.kobj.net/oauth/authorize/newuser?response_type=code&redirect_uri=http%3A%2F%2Fjoinfuse.com%2Fcode.html&client_id=D98022C6-C4F4-11E3-942D-E857D61CF0AC&state=6970625


    // ------------------------------------------------------------------------
    wrangler.getOAuthAccessToken = function(code, callback, error_func)
    {
        var returned_state = parseInt(getQueryVariable("state"));
        var expected_state = parseInt(window.localStorage.getItem("wrangler_CLIENT_STATE"));
        if (returned_state !== expected_state) {
            console.warn("OAuth Security Warning. Client states do not match. (Expected %d but got %d)", wrangler.client_state, returned_state);
        }
        console.log("getting access token with code: ", code);
        if (typeof (callback) !== 'function') {
            callback = function() { };
        }
        var url = 'https://' + wrangler.login_server + '/oauth/access_token';
        var data = {
            "grant_type": "authorization_code",
            "redirect_uri": wrangler.callbackURL,
            "client_id": wrangler.clientKey,
            "code": code
        };

        return $.ajax({
            type: 'POST',
            url: url,
            data: data,
            dataType: 'json',
            success: function(json)
            {
                console.log("Recieved following authorization object from access token request: ", json);
                if (!json.OAUTH_ECI) {
                    console.error("Received invalid OAUTH_ECI. Not saving session.");
                    callback(json);
                    return;
                };
                wrangler.saveSession(json);
                window.localStorage.removeItem("wrangler_CLIENT_STATE");
                callback(json);
            },
            error: function(json)
            {
                console.log("Failed to retrieve access token " + json);
                error_func = error_func || function(){};
                error_func(json);
            }
        });
    };

    // ========================================================================
    // Session Management

    // ------------------------------------------------------------------------
    wrangler.retrieveSession = function()
    {
        var SessionCookie = kookie_retrieve();

        console.log("Retrieving session ", SessionCookie);
        if (SessionCookie != "undefined") {
            wrangler.defaultECI = SessionCookie;
        } else {
            wrangler.defaultECI = "none";
        }
        return wrangler.defaultECI;
    };

    // ------------------------------------------------------------------------
    wrangler.saveSession = function(token_json)
    {
       var Session_ECI = token_json.OAUTH_ECI;
       var access_token = token_json.access_token;
       console.log("Saving session for ", Session_ECI);
       wrangler.defaultECI = Session_ECI;
       wrangler.access_token = access_token;
       kookie_create(Session_ECI);
   };
    // ------------------------------------------------------------------------
    wrangler.removeSession = function(hard_reset)
    {
        console.log("Removing session ", wrangler.defaultECI);
        if (hard_reset) {
            var cache_breaker = Math.floor(Math.random() * 9999999);
            var reset_url = 'https://' + wrangler.login_server + "/login/logout?" + cache_breaker;
            $.ajax({
                type: 'POST',
                url: reset_url,
                headers: { 'Kobj-Session': wrangler.defaultECI },
                success: function(json)
                {
                    console.log("Hard reset on " + wrangler.login_server + " complete");
                }
            });
        }
        wrangler.defaultECI = "none";
        kookie_delete();
    };

    // ------------------------------------------------------------------------
    wrangler.authenticatedSession = function()
    {
        var authd = wrangler.defaultECI != "none";
        if (authd) {
            console.log("Authenicated session");
        } else {
            console.log("No authenicated session");
        }
        return (authd);
    };

    // exchange OAuth code for token
    // updated this to not need a query to be passed as it wasnt used in the first place.
    wrangler.retrieveOAuthCode = function()
    {
        var code = getQueryVariable("code");
        return (code) ? code : "NO_OAUTH_CODE";
    };

    function getQueryVariable(variable)
    {
        var query = window.location.search.substring(1);
        var vars = query.split('&');
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split('=');
            if (decodeURIComponent(pair[0]) == variable) {
                return decodeURIComponent(pair[1]);
            }
        }
        console.log('Query variable %s not found', variable);
        return false;
    };

    wrangler.clean = function(obj) {
       delete obj._type;
       delete obj._domain;
       delete obj._async;

   };

   var SkyTokenName = '__SkySessionToken';
   var SkyTokenExpire = 7;

    // --------------------------------------------
    function kookie_create(SkySessionToken)
    {
        if (SkyTokenExpire) {
            // var date = new Date();
            // date.setTime(date.getTime() + (SkyTokenExpire * 24 * 60 * 60 * 1000));
            // var expires = "; expires=" + date.toGMTString();
            var expires = "";
        }
        else var expires = "";
        var kookie = SkyTokenName + "=" + SkySessionToken + expires + "; path=/";
        document.cookie = kookie;
        // console.debug('(create): ', kookie);
    }

    // --------------------------------------------
    function kookie_delete()
    {
        var kookie = SkyTokenName + "=foo; expires=Thu, 01-Jan-1970 00:00:01 GMT; path=/";
        document.cookie = kookie;
        // console.debug('(destroy): ', kookie);
    }

    // --------------------------------------------
    function kookie_retrieve()
    {
        var TokenValue = 'undefined';
        var TokenName = '__SkySessionToken';
        var allKookies = document.cookie.split('; ');
        for (var i = 0; i < allKookies.length; i++) {
            var kookiePair = allKookies[i].split('=');
            // console.debug("Kookie Name: ", kookiePair[0]);
            // console.debug("Token  Name: ", TokenName);
            if (kookiePair[0] == TokenName) {
                TokenValue = kookiePair[1];
            };
        }
        // console.debug("(retrieve) TokenValue: ", TokenValue);
        return TokenValue;
    }

})();
