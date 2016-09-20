(function() {
  'use strict';

  angular
    .module('app.profile')
    .controller('ProfileController', ProfileController);

  ProfileController.$inject = [
    'profileService'
  ];

  /* @ngInject */
  function ProfileController(
    profileService
  ) {
    var vm = this;
    vm.user = {};
    vm.images = [];
    vm.imagesRefreshed = false;

    vm.getImages = getImages;
    vm.updateImages = updateImages;

    activate();

    function activate() {
      profileService.getProfile()
        .then(function(res) {
          vm.user = res.data;
          vm.images = _.cloneDeep(vm.user.images);
        });
    }

    function getImages() {
      profileService.getImages()
        .then(function(response) {
          vm.imagesRefreshed = true;
          vm.images = response.data;
        });
    }

    function updateImages() {
      profileService.updateProfile(vm.user);
    }
  }
})();
