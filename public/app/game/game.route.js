(function() {
  'use strict';

  angular
    .module('app.game')
    .run(appRun);

  appRun.$inject = ['routerHelper'];
  /* @ngInject */
  function appRun(routerHelper) {
    routerHelper.configureStates(getStates());
  }

  function getStates() {
    return [
      {
        state: 'game',
        config: {
          parent: 'root',
          url: '/game',
          templateUrl: 'app/game/game.html',
          controller: 'GameController',
          controllerAs: 'vm',
          title: 'Game'
        }
      }
    ];
  }
})();
