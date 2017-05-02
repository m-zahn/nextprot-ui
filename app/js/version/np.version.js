'use strict';

angular.module('np.version', [])

.constant('RELEASE_INFOS', {
    'version': '2.6.0',
    "isProduction": 'IS_PRODUCTION', // i.e 'true'
    'build': 'BUILD_NUMBER', // '926'
    'githash': 'GIT_HASH' // 'e3a1a30'
});
