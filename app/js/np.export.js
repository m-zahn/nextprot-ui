(function (angular, undefined) {
    'use strict';

    angular.module('np.export', [])
        .factory('exportService', exportService)
        .controller('ExportCtrl', ExportCtrl);


    ExportCtrl.$inject = ['$resource', '$scope', 'config', 'exportService'];
    function ExportCtrl($resource, $scope, config, exportService) {

        var allEntryTemplateValue = null;
        $scope.selectedFormat;
        $scope.views;
        $scope.selectedView;
        $scope.limitNumberEntries = 2;

        $scope.export = exportService;


        $scope.setSelectedFormat = function (format) {
            $scope.selectedFormat = format;
            $scope.views = exportService.templates[format];
            $scope.selectedView = $scope.views[0];
            allEntryTemplateValue = $scope.views[0];
        }

        $scope.getFormats = function () {
            return Object.keys(exportService.templates);
        }

        $scope.setSelectedView = function (view) {
            $scope.selectedView = view.replace(new RegExp('^-+', ''), '');
        }

        $scope.getFileExportURL = function () {

            //multiple entries
            if ($scope.export.exportObjectType) {

                var exportURL = config.api.API_URL + "/entries"
                if ($scope.selectedView !== allEntryTemplateValue) {
                    exportURL += "/" + $scope.selectedView;
                }
                exportURL += "." + $scope.selectedFormat;
                exportURL += "?" + $scope.export.exportObjectType + "=" + $scope.export.exportObjectIdentifier;


                if ($scope.limitNumberEntries)
                    exportURL += "&limit=" + $scope.limitNumberEntries;

                return exportURL;

            } else { // export an entry

                var exportURL = config.api.API_URL + "/entry" //TODO should we keep it singular or maintain it plural as for lists????
                exportURL += "/" + $scope.export.exportObjectIdentifier;
                if ($scope.selectedView !== allEntryTemplateValue) {
                    exportURL += "/" + $scope.selectedView;
                }
                exportURL += "." + $scope.selectedFormat;
                return exportURL;
            }
            ;
        }


        //initialize with xml
        $scope.setSelectedFormat("xml");


    }


    exportService.$inject = ['$resource', 'config'];
    function exportService($resource, config) {

        /*
         var exportTemplatesUrl = config.api.API_URL + '/export/templates.json';

         var $export_templates_resource = $resource(exportTemplatesUrl, {
         get: {method: 'GET', isArray: false}}, { cache : true}
         );
         ExportService.prototype.getTemplates = function (cb) {
         console.log("cache this");
         return $export_templates_resource.get(function (data) {
         if (cb)cb(data)
         });
         };*/


        var ExportService = function () {
            this.exportObjectType;
            this.exportTitle;
            this.exportObjectIdentifier;

            //ok this is ugly, it should request the api
            this.templates = {"txt":["full-entry","accession"],"turtle":[],"xml":["full-entry","accession","overview","annotation","-positional-annotation","--region","---compositionally-biased-region","---repeat","---short-sequence-motif","---miscellaneous-region","---domain","---zinc-finger-region","---nucleotide-phosphate-binding-region","---dna-binding-region","---interacting-region","---calcium-binding-region","---coiled-coil-region","--non-consecutive-residue","--variant","--mutagenesis","--sequence-conflict","--ptm","---ptm-info","---lipidation-site","---glycosylation-site","---disulfide-bond","---modified-residue","---selenocysteine","---cross-link","--non-terminal-residue","--variant-info","--secondary-structure","---beta-strand","---helix","---turn","--domain-info","--processing-product","---peroxisome-transit-peptide","---mature-protein","---cleavage-site","---signal-peptide","---maturation-peptide","---initiator-methionine","---mitochondrial-transit-peptide","--site","---miscellaneous-site","---binding-site","---metal-binding-site","---active-site","--topology","---topological-domain","---intramembrane-region","---transmembrane-region","--mapping","---pdb-mapping","-general-annotation","--enzyme-classification","--miscellaneous","--caution","--sequence-caution","--interaction","---binary-interaction","---small-molecule-interaction","---cofactor","---enzyme-regulation","---interaction-info","--keyword","---uniprot-keyword","--medical","---disease","---allergen","---pharmaceutical","--induction","--function","---catalytic-activity","---function-info","---go-molecular-function","---pathway","---go-biological-process","--cellular-component","---go-cellular-component","---subcellular-location","---subcellular-location-note","--expression","---expression-info","---developmental-stage-info","---expression-profile","-name","--family-name","publication","xref","keyword","identifier","chromosomal-location","genomic-mapping","interaction","protein-sequence","antibody","peptide","srm-peptide-mapping"],"tsv":[],"json":[]};
        };

        ExportService.prototype.setExportEntry = function (entry) {
            this.exportObjectType = null;
            this.exportObjectIdentifier = entry;
            this.exportTitle = "Export entry '" + entry + "'";
        }


        ExportService.prototype.setExportParameters = function (params) {

            if (params.queryId) { // neXtProt Query example NXQ_000001
                var queryNxId = $filter('getUserQueryId')(params.queryId);
                this.exportObjectType = "queryId";
                this.exportObjectIdentifier = queryNxId;
                this.exportTitle = "Export entries for query '" + queryNxId + "'";
            } else if (params.listId) { //a simple list
                this.exportObjectType = "listId";
                this.exportObjectIdentifier = params.listId;
                this.exportTitle = "Export entries for list '" + params.listId + "'";
            } else if (params.query) {  //result from a query
                this.exportObjectType = "query";
                this.exportObjectIdentifier = params.query;
                this.exportTitle = "Export search results for '" + params.query + "'";
            }

        }


        var service = new ExportService();
        return service;

    }


})(angular); //global variable
