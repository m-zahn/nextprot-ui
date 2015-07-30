(function (angular, undefined) {
    'use strict';

    angular.module('np.viewer', [])
        .config(viewerConfig)
        .controller('ViewerCtrl', ViewerCtrl)
    ;

    viewerConfig.$inject = ['$routeProvider'];
    function viewerConfig($routeProvider) {

        var ev = {templateUrl: '/partials/viewer/entry-viewer.html'};
        var gv = {templateUrl: '/partials/viewer/global-viewer.html'};

        $routeProvider
            .when('/db/term/:db', {templateUrl: '/partials/viewer/viewer-entry-np1.html'})
            .when('/db/entry/:db', {templateUrl: '/partials/viewer/viewer-entry-np1.html'})
            .when('/db/entry/:element/:db', {templateUrl: '/partials/viewer/viewer-entry-np1.html'})
            .when('/db/publication/:db', {templateUrl: '/partials/viewer/viewer-entry-np1.html'})


            //GLOBAL VIEWS https://github.com/calipho-sib/nextprot-viewers
            .when('/view', gv)
            .when('/view/:gv1', gv)
            .when('/view/:gv1/:gv2', gv)
            .when('/view/:gv1/:gv2/:gv3', gv)

            //ENTRY VIEWS
            .when('/entry/:entry/view/:ev1', ev)
            .when('/entry/:entry/view/:ev1/:ev2', ev)
            .when('/entry/:entry/view/:ev1/:ev2/:ev3', ev)

            .when('/entry/:entry/viewer/:gistusr/:gistid', ev) // related to gists
            .when('/entry/:entry/:repo/:user/:branch/:f1', ev)
            .when('/entry/:entry/:repo/:user/:branch/:f1/:f2', ev)
            .when('/entry/:entry/:repo/:user/:branch/:f1/:f2/:f3', ev)
            .when('/entry/:entry/:repo/:user/:branch/:f1/:f2/:f3/:f4', ev)
            .when('/entry/:entry/:element', {templateUrl: '/partials/viewer/viewer-np1.html'})
            .when('/entry/:entry/', {templateUrl: '/partials/viewer/viewer-entry-np1.html'})
            .when('/term/:termid/', {templateUrl: '/partials/viewer/viewer-term-np1.html'})

    }


    ViewerCtrl.$inject = ['$resource', '$scope', '$sce', '$routeParams', '$location', 'config'];
    function ViewerCtrl($resource, $scope, $sce, $routeParams, $location, config) {
        $scope.widgetEntry = null;
        $scope.githubURL = null;
        $scope.simpleSearchText = "";

        $scope.makeSimpleSearch = function () {
            $location.search("query", $scope.simpleSearchText);
            $location.path("proteins/search");
        }

        $scope.activePage = function (page) {
            if ($routeParams.element) {
                if (page === $routeParams.element) return 'active';
            } else if ($routeParams.gistusr && $routeParams.gistid) {
                if (page === ($routeParams.gistusr + "/" + $routeParams.gistid)) return 'active';
            }
            else return '';
        }

        // update entity documentation on path change
        $scope.$on('$routeChangeSuccess', function (event, next, current) {
            $scope.widgetEntry = $routeParams.entry;

            if ($routeParams.db) {
                $location.path($location.$$path.replace("db/", ""));
            }

            if ($routeParams.ev1) { //Entry view

                var url = "https://rawgit.com/calipho-sib/nextprot-viewers/master/" + $routeParams.ev1;
                if($routeParams.ev2) url += "/" + $routeParams.ev2;
                if($routeParams.ev3) url += "/" + $routeParams.ev3;
                url += "/app/index.html" ;
                $scope.githubURL = url.replace("rawgit.com", "github.com").replace("/master/", "/blob/master/");
                url += "?nxentry=" + $routeParams.entry;

                $scope.widgetURL = $sce.trustAsResourceUrl(url);

            }else if ($routeParams.gv1) { //Global view

                var url = "https://rawgit.com/calipho-sib/nextprot-viewers/master/" + $routeParams.gv1;
                if($routeParams.gv2) url += "/" + $routeParams.gv2;
                if($routeParams.gv3) url += "/" + $routeParams.gv3;
                url += "/app/index.html" ;
                $scope.githubURL = url.replace("rawgit.com", "github.com").replace("/master/", "/blob/master/");
                url += "?nxentry=" + $routeParams.entry;

                $scope.widgetURL = $sce.trustAsResourceUrl(url);

            } else if ($routeParams.repo) { // github repository
                var url = "https://rawgit.com/" + $routeParams.repo + "/" + $routeParams.user + "/" + $routeParams.branch + "/" + $routeParams.f1;
                //append if they exist
                if($routeParams.f2){
                    url += "/" + $routeParams.f2;
                    if($routeParams.f3){
                        url += "/" + $routeParams.f3;
                        if($routeParams.f4){
                            url += "/" + $routeParams.f4;
                        }
                    }
                }
                $scope.githubURL = url.replace("rawgit.com", "github.com").replace("/" + $routeParams.branch + "/", "/blob/" + $routeParams.branch + "/");
                url += "?nxentry=" + $routeParams.entry;
                $scope.widgetURL = $sce.trustAsResourceUrl(url);
            } else if ($routeParams.gistusr && $routeParams.gistid) {
                $scope.widgetURL = $sce.trustAsResourceUrl("http://rawgit.com/" + $routeParams.gistusr + "/" + $routeParams.gistid + "/raw/index.html?nxentry=" + $routeParams.entry);
            } else { //nextprot

                /*
                 np1Base: origin of NP1 http service, read from conf or set to localhost for dev/debug
                 */
                //var np1Base = "http://localhost:8080/db/entry/";
                var np1Base = config.api.NP1_URL + "/db";

                /*
                 * np2css: the css hiding header, footer and navigation items of NP1 page
                 */
                var np2css = "/db/css/np2css.css"; // NP1 integrated css (same as local)
                //var np2css = "http://localhost:3000/partials/viewer/np1np2.css"; // UI local css

                /*
                 * np2ori: the origin of the main frame (UI page) used as a base for relative links in iframe
                 */
                var np2ori = window.location.origin;

                /*
                 * np1Params: params to pass to NP1
                 */
                var np1Params = "?np2css=" + np2css + "&np2ori=" + np2ori;

                $scope.widgetURL = $sce.trustAsResourceUrl(np1Base + $location.$$path + np1Params);
            }
        });


    }


})(angular); //global variable
