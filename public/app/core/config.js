(function() {
  'use strict';

  var core = angular.module('app.core');

  /* @ngInject */

  var config = {
    appErrorPrefix: '[Memory Error] ',
    appTitle: 'Memory'
  };

  core.value('config', config);

  core.config(configure);

  configure.$inject = [
    '$authProvider',
    '$logProvider',
    'routerHelperProvider',
    'exceptionHandlerProvider'
  ];
  /* @ngInject */
  function configure(
    $authProvider,
    $logProvider,
    routerHelperProvider,
    exceptionHandlerProvider
  ) {
    $authProvider.instagram({
      clientId: '56251bdfceb44f0cb1b1aaa6e091f75f'
    });

    if ($logProvider.debugEnabled) {
      $logProvider.debugEnabled(true);
    }

    exceptionHandlerProvider.configure(config.appErrorPrefix);

    routerHelperProvider.configure({
      defaultRoute: 'root',
      defaultRouteUrl: '/',
      docTitle: config.appTitle + ' | '
    });
  }

})();
