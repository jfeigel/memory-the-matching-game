(function() {
  'use strict';

  angular
    .module('app.profile')
    .factory('profileService', profileService);

  profileService.$inject = ['$http', '$auth'];

  /* @ngInject */
  function profileService($http, $auth) {
    var service = {
      updateProfile: updateProfile,
      getProfile: getProfile,
      getImages: getImages
    };

    return service;

    function updateProfile(profile) {
      return $http.put('/api/me', profile);
    }

    function getProfile() {
      return $http.get('/api/me');
    }

    function getImages() {
      return $http.get('/api/images');
    }
  }
})();
