(function() {
  'use strict';

  angular
    .module('app.root')
    .run(appRun);

  appRun.$inject = ['routerHelper'];
  /* @ngInject */
  function appRun(routerHelper) {
    routerHelper.configureStates(getStates());
  }

  function getStates() {
    return [
      {
        state: 'root',
        config: {
          url: '',
          abstract: true,
          templateUrl: 'app/root/root.html',
          controller: 'RootController',
          controllerAs: 'rootVm'
        }
      },
      {
        state: 'home',
        config: {
          parent: 'root',
          url: '/',
          templateUrl: 'app/root/home.html'
        }
      }
    ];
  }
})();
