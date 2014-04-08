'use strict';

var UserService = angular.module('np.user.service', []);


UserService.factory('UserService', [
    '$resource',
    '$http',
    'config',
    '$window',
    '$rootScope',
    '$location',
    function ($resource, $http, config, $window, $rootScope, $location) {

        var history = [];

        var baseAuthUrl = config.api.AUTH_SERVER;

        $rootScope.$on('$routeChangeSuccess', function () {
            history.push($location.$$path);
        });

        var $token = $resource(baseAuthUrl + '/oauth/token', {client_id: 'nextprotui', grant_type: 'password', username: '@username', password: '@password'}, {
            get: { method: 'POST' }
        });

        var $googleToken = $resource(baseAuthUrl + '/google/token', {}, {
            get: { method: 'POST' }
        });

        var $userProfile = $resource(baseAuthUrl + '/user/profile.json?token=:token', {token: '@token'}, {
            get: { method: 'POST' }
        });

        var $userLogout = $resource(baseAuthUrl + '/user/logout.json?token=:token', {token: '@token'}, {
            get: { method: 'POST' }
        });

        var UserService = function () {

            this.userProfile = {};
            this.setGuestUser();

            if ($window.sessionStorage.token) {
                this.getUserProfile();
            }
        };

        UserService.prototype.login = function (username, password, cb) {
            $token.get({username: username, password: password}, function (data) {
                //$cookieStore.put('sessionToken', data.access_token);
                $window.sessionStorage.token = data.access_token;
                console.log('got token' + $window.sessionStorage.token);
                var prevUrl = history.length > 1 ? history.splice(-2)[0] : "/";
                $location.path(prevUrl);

                if (cb)cb(null, data);
            });
        }

        UserService.prototype.googleSignin = function(authResult, cb) {
            $googleToken.get({ 
                access_token : authResult.access_token, 
                refresh_token: authResult.refresh_token,
                code: authResult.code,
                id_token: authResult.id_token,
                expires_at: authResult.expires_at, 
                expires_in: authResult.expires_in
            }, function(response) {
                $window.sessionStorage.token = response.access_token;
                console.log('got token' + $window.sessionStorage.token);
                var prevUrl = history.length > 1 ? history.splice(-2)[0] : "/";
                $location.path(prevUrl);
                if(cb)cb(response);
            });

        }

        UserService.prototype.getUserProfile = function (cb) {
            console.log('getting user profile')
            var me = this;
            $userProfile.get({token: $window.sessionStorage.token}, function (data) {
                if(data.authorities && data.username){
                    me.userProfile.authorities = data.authorities;
                    me.userProfile.username = data.username;
                    me.userProfile.identifier = data.identifier;
                    me.userProfile.userLoggedIn = true;
                }else {
                    this.logout;
                }
                console.log("me", me);
                if (cb)cb(data);
            });
        };

        UserService.prototype.logout = function (cb) {
            $userLogout.get({token: $window.sessionStorage.token}, function (data) {
                if (cb)cb(data);
            });

            console.log('deleting session storage')
            delete $window.sessionStorage.token;
            this.setGuestUser();
        }

        UserService.prototype.setGuestUser = function () {
            this.userProfile.authorities = '[]';
            this.userProfile.username = 'Guest';
            this.userProfile.userLoggedIn = false;
        }

        var service = new UserService();
        return service;

    }
]);