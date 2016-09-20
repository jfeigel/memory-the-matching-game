/**
 * @ngdoc controller
 * @name app.root.controller:RootController
 * @description
 * Root controller for the whole application
 */
(function() {
  'use strict';

  angular
    .module('app.root')
    .controller('RootController', RootController);

  RootController.$inject = [
    '$rootScope',
    '$scope',
    '$location',
    '$timeout',
    '$state',
    '$auth',
    '$mdToast'
  ];
  /* @ngInject */
  function RootController(
    $rootScope,
    $scope,
    $location,
    $timeout,
    $state,
    $auth,
    $mdToast
  ) {
    var vm = this;

    vm.currentNavItem = 'home';

    vm.authenticate = authenticate;
    vm.isAuthenticated = isAuthenticated;
    vm.logout = logout;

    $rootScope.$on('$stateChangeSuccess', stateChangeSuccess);
    $scope.$on('routeUpdate', routeUpdate);

    activate();

    ////////////

    function activate() {
      vm.currentNavItem = $state.current.name;
    }

    function stateChangeSuccess(event, toState, toParams, fromState, fromParams) {
      vm.currentNavItem = toState.name;
    }

    function routeUpdate(event, route) {
      vm.currentNavItem = route;
    }

    function authenticate(provider) {
      $auth.authenticate(provider)
        .then(function() {
          $mdToast.showSimple('You have successfully signed in with ' + provider + '!');
          $state.go('profile');
        })
        .catch(function(error) {
          if (error.message) {
            // Satellizer promise reject error.
            $mdToast.showSimple(error.message);
          } else if (error.data) {
            // HTTP response error from server
            $mdToast.showSimple('ERROR ' + error.status + ': ' + error.data.message);
          } else {
            $mdToast.showSimple(error);
          }
        });
    }

    function isAuthenticated() {
      return $auth.isAuthenticated();
    }

    function logout() {
      $auth.logout()
        .then(function() {
          $mdToast.showSimple('You have been logged out');
          $state.go('home');
        });
    }
  }
})();
