'use strict';

var UserService = angular.module('np.user.service', []);


UserService.factory('UserService', [
   '$resource',
   '$http',
   'config',
   '$window',
   'Tools',
   function($resource, $http, config, $window, Tools) {

       var baseAuthUrl = "http://10.2.2.96:8081";
       var baseUrl = config.solr.BASE_URL+config.solr.SOLR_PORT;


       var $token = $resource(baseAuthUrl+'/nextprot-auth/oauth/token', {client_id: 'nextprotui', grant_type: 'password', username : '@username', password : '@password'}, {
           get: { method: 'POST' }
       });


       var $userProfile = $resource(baseUrl+'/nextprot-api/user/:user_id.json', {user_id: '@user_id'}, {
           get: { method: 'GET' }
       });

       var UserService = function() {
           this.userProfile={
               username:"Guest",
               role:'ANONYMOUS',
               userLoggedIn:false
           }
       };

       UserService.prototype.isAnonymous=function(){
           return this.role==='ANONYMOUS';
       }

       UserService.prototype.login = function(username, password, cb) {
           $token.get({username:username, password:password}, function(data) {
               //$cookieStore.put('sessionToken', data.access_token);
               $window.sessionStorage.token = data.access_token;
               if(cb)cb(null,data);
           }).error(function(error,status){
               if(cb)cb(error,status);
           });
       }

       UserService.prototype.getUserProfile = function(cb) {
           var me=this;
           $userProfile.get({user_id:1}, function(data) {
               me.userProfile.role='USER';
               me.userProfile.username=data.username;
               me.userProfile.userLoggedIn=true;
               if(cb)cb(data);
           });
       };

       var service =  new UserService();
	   return service;
	   
   }
]);