'use strict'

var ProteinListModule = angular.module('np.proteinlists', [
	'np.proteinlist.service',
    'np.proteinlist.ui',
    'np.proteinlist.upload',
    'np.proteinlist.upload.ui',
    'np.proteinlist.service',
    'np.flash'
]);


ProteinListModule.config([
	'$routeProvider',
    '$locationProvider',
    '$httpProvider',
    function($routeProvider, $locationProvider, $httpProvider) {
    	$routeProvider
        	.when('/proteinlists', { templateUrl: 'partials/proteinlists/list.html'})
            // .when('/proteinlists/view/:name', { templateUrl: 'partials/proteinlists/view.html'})
            .when('/proteinlists/view/:list', { templateUrl: 'partials/search/result.html'})
            .when('/proteinlists/create', { templateUrl: 'partials/proteinlists/create.html'})
    }
]);


ProteinListModule.controller('ListCtrl', [
	'$resource',
	'$scope',
	'$rootScope',
	'$location',
	'$routeParams',
	'$route',
	'Search',
	'ProteinListService',
    'UserService',
	'Tools',
	function($resource, $scope, $rootScope, $location, $routeParams, $route, Search, ProteinListService, UserService, Tools) {
		$scope.Tools = Tools;
		$scope.ProteinListService = ProteinListService;
		$scope.showCombine = false;
		$scope.combineDisabled = true;
		$scope.selected = {};
		$scope.modal = { options: { edit: { title: 'Edit' }, create: { title: 'Create'} } };
		$scope.operators = ["AND", "OR", "NOT_IN"];
		$scope.combination = { first: null, op: $scope.operators[0], second: null};
		$scope.options = { first: $scope.lists, second: $scope.lists }


		init();

		function init() {
			ProteinListService.getByUsername(UserService.userProfile.username, function(data) {
				$scope.lists = data.lists;
				$scope.initCombination();
			});
		}




		$scope.initCombination = function() {
			$scope.$watch('combination.first', function(newVal, oldVal) {
				$scope.options.second = $scope.lists.slice(0);

				var index = $scope.options.second.indexOf(newVal);
				if(index > -1)
					$scope.options.second.splice(index, 1);
			});


			$scope.$watch('combination.second', function(newVal, oldVal) {
				$scope.options.first = $scope.lists.slice(0);

				var index = $scope.options.first.indexOf(newVal);

				if(index > -1)
					$scope.options.first.splice(index, 1);
			});
		};

		$scope.switchCombine = function() {
			var temp = $scope.combination.first;
			$scope.combination.first = $scope.combination.second;
			$scope.combination.second = temp;
		};

		$scope.launchModal = function(elem, action) {
			$scope.selected = {};
			if(action == 'edit') {
				$scope.selected = $scope.lists[elem];
				angular.extend($scope.selected, {index:elem});
			}
			angular.extend($scope.modal, { type: action});
		};

		$scope.saveModal = function(dismiss) {

			if($scope.modal.type == 'edit') {
				angular.extend($scope.lists[$scope.selected.index], $scope.selected);

				var list = {
					id: $scope.selected.id,
					name: $scope.selected.name,
					description: $scope.selected.description
				};

				ProteinListService.updateList(UserService.userProfile.username, list);
			} else if($scope.modal.type == 'create') {
				var newList = { name: $scope.selected.name, description: $scope.selected.description };

				ProteinListService.combine(
                    UserService.userProfile.username,
					newList,
					$scope.combination.first.name,
					$scope.combination.second.name,
					$scope.combination.op,
					function(data) {
						init();
					});

			}
		};

		$scope.delete = function(index) {
			ProteinListService.deleteList(UserService.userProfile.username, $scope.lists[index].id);
			$scope.lists.splice(index, 1);

			$scope.options = $scope.lists;
			$scope.options = $scope.lists;
			$scope.initCombination();
		}

		$scope.buildQuery = buildQuery;
	}
]);

ProteinListModule.controller('ListViewCtrl', [
	'$resource',
	'$scope',
	'$rootScope',
	'$location',
	'$routeParams',
	'$route',
	'ProteinListService',
	'Search',
	'Tools',
	function($resource, $scope, $rootScope, $location, $routeParams, $route, ProteinListService, Search, Tools) {
		var listName = $routeParams.name;


		var list = ProteinListService.getSelectedList();


		// // coming directly through the URL
		// if(!list) {
		// 	// no lists in the Service
		// 	if(!ProteinListService.lists) {
		// 		ProteinListService.getByUsername('mario', function(data) {
		// 			list = _.find(data.proteinLists, function(l) { return listName == Tools.convertToSlug(l.name) });


		// 			Search.docs({ entity: 'proteins', configuration: 'id', query: buildQuery(list.accessions)}, function(docs) {
		// 				console.log('found: ', docs)
		// 			});
		// 		});
		// 	}
		// } else Search.docs({ entity: 'proteins', configuration: 'id', query: buildQuery(list.accessions)}, function(data) {
		// 	console.log('search: ', data);
		// });

	}
]);

function buildQuery(accessions) {
	return "id:" + (accessions.length > 1 ? "(" + accessions.join(" ") + ")" : accessions[0]);
}

ProteinListModule.controller('ListCreateCtrl', [
	'$resource',
	'$scope',
	'$rootScope',
	'$routeParams',
	'$location',
	'ProteinListService',
    'UserService',
	'UploadListService',
	'flash',
	function($resource, $scope, $rootScope, $routeParams, $location, ProteinListService, UserService, UploadListService, flash) {

		$scope.inputAccessions = "";
		$scope.listName = "";
		$scope.files = [];
		var selectedFiles = [];

		$scope.$watch('files', function (newValue, oldValue) {
	        // Only act when our property has changed.
	        if (newValue != oldValue) {
	        	selectedFiles = $scope.files;


	            //console.log('Controller: $scope.files changed. Start upload.');
	            //for (var i = 0, length = $scope.files.length; i < length; i++) {
	                // Hand file off to uploadService.
	              //  UploadListService.send($scope.files[i]);
	            //}
	        }
	    }, true);

		$rootScope.$on('upload:loadstart', function () {
	        console.log('Controller: on `loadstart`');
	    });

	    $rootScope.$on('upload:error', function () {
	        console.log('Controller: on `error`');
	    });

	    $scope.createList = function(listName) {

	    	if($scope.inputAccessions.length > 0) {
	    		var accessions = $scope.inputAccessions.split("\n");
	    		var list = { name: $scope.listName, accessions: accessions};

	    		ProteinListService.createList(UserService.userProfile.username, list, function(data) {
					if(data.error) flash('alert-warning', data.error);
					else {
						flash('alert-info', "List "+list.name+" created.");
						$location.path('/proteinlists');
					}
	    		});
	    	} else {
	    		ProteinListService.createList(UserService.userProfile.username, {
                    name: $scope.listName, description: $scope.listDescription, accessions: []
                }, function(newList) {

	    			for(var i=0; i<selectedFiles.length; i++)
	    			UploadListService.send(newList.id, selectedFiles[i], function(data) {
						if(data.error) flash('alert-warning', data.error);
						else {
							flash('alert-info', "List "+$scope.listName+" created.");
							$location.path('/proteinlists');
						}
	    			});
	    		});

	    	}
	    }

	}


]);


ProteinListModule.controller('ExportCtrl', [
    '$resource',
    '$scope',
    '$rootScope',
    '$location',
    '$routeParams',
    '$route',
    'Search',
    'config',
    'ExportTemplateService',
    function($resource, $scope, $rootScope, $location, $routeParams, $route, Search, config, ExportTemplateService) {

        var baseUrl = config.api.BASE_URL + config.api.API_PORT;

        $scope.listToExport = {};
        $scope.exportFormats = Search.config.widgets.exportFormats;
        $scope.selectedFormat = {"name" : "Select your format", "extension" : null};
        $scope.selectedTemplate = {"name" : "Select your template", "extension" : null};

        $scope.setListToExport = function (list){
            angular.extend($scope.listToExport, list);
            console.log($scope.listToExport);
        }

        $scope.setSelectedFormat = function (format){
            $scope.selectedFormat = {}
            angular.extend($scope.selectedFormat, format);
        }

        $scope.setSelectedTemplate = function (template){
            $scope.selectedTemplate = {}
            angular.extend($scope.selectedTemplate, template);
        }

        $scope.getFileExportURL = function () {
            var exportListURL = baseUrl + "/nextprot-api/export";
            exportListURL += "/template/" + $scope.selectedTemplate.name;
            exportListURL += "/list/" + $scope.listToExport.id + "." + $scope.selectedFormat.extension;
            return exportListURL;
        }
    }
]);

