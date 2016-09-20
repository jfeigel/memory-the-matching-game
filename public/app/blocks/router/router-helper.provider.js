/* Help configure the state-base ui.router */
(function() {
  'use strict';

  angular
    .module('blocks.router')
    .provider('routerHelper', routerHelperProvider);

  routerHelperProvider.$inject = ['$stateProvider', '$urlRouterProvider'];
  /* @ngInject */
  function routerHelperProvider($stateProvider, $urlRouterProvider) {
    /* jshint validthis:true */
    var config = {
      defaultRoute: undefined,
      defaultRouteUrl: undefined,
      docTitle: undefined,
      resolveAlways: {}
    };

    this.configure = function(cfg) {
      angular.extend(config, cfg);
    };

    this.$get = RouterHelper;
    RouterHelper.$inject = ['$location', '$rootScope', '$state', '$auth', 'logger'];
    /* @ngInject */
    function RouterHelper($location, $rootScope, $state, $auth, logger) {
      var handlingStateChangeError = false;
      var hasOtherwise = false;
      var stateCounts = {
        errors: 0,
        changes: 0
      };

      var service = {
        configureStates: configureStates,
        getStates: getStates,
        stateCounts: stateCounts
      };

      init();

      return service;

      ///////////////

      function configureStates(states, otherwisePath) {
        states.forEach(function(state) {
          state.config.resolve =
            angular.extend(state.config.resolve || {}, config.resolveAlways);
          $stateProvider.state(state.state, state.config);
        });
        if (otherwisePath && !hasOtherwise) {
          hasOtherwise = true;
          $urlRouterProvider.otherwise(otherwisePath);
        }
      }

      function handleRoutingErrors() {
        // Route cancellation:
        // On routing error, go to the dashboard.
        // Provide an exit clause if it tries to do it twice.
        $rootScope.$on('$stateChangeError',
          function(event, toState, toParams, fromState, fromParams, error) {
            if (handlingStateChangeError) {
              return;
            }
            stateCounts.errors++;
            handlingStateChangeError = true;
            var destination = (toState &&
              (toState.title || toState.name || toState.loadedTemplateUrl)) ||
              'unknown target';
            var msg = 'Error routing to ' + destination + '. ' +
              (error.data || '') + '. <br/>' + (error.statusText || '') +
              ': ' + (error.status || '');
            logger.warning(msg, [toState]);
            $state.go(config.defaultRoute);
          }
        );
      }

      function handleRoutingAuth() {
        $rootScope.$on('$stateChangeStart',
          function(event, toState, toParams, fromState, fromParams, error) {
            // If the user is not authorized cancel the route and redirect to login
            if (toState.requires && toState.requires.login && !$auth.isAuthenticated()) {
              event.preventDefault();
              $auth.logout()
                .then(function() {
                  $location.path('/');
                });
            }
          }
        );
      }

      function init() {
        $urlRouterProvider
            .when('', config.defaultRouteUrl);

        handleRoutingErrors();
        handleRoutingAuth();
        updateDocTitle();
      }

      function getStates() { return $state.get(); }

      function updateDocTitle() {
        $rootScope.$on('$stateChangeSuccess',
          function(event, toState, toParams, fromState, fromParams) {
            stateCounts.changes++;
            handlingStateChangeError = false;
            var title = config.docTitle + ' ' + (toState.title || '');
            $rootScope.title = title; // data bind to <title>
          }
        );
      }
    }
  }
})();