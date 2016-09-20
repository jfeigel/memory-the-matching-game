(function() {
  'use strict';

  angular
    .module('app.game')
    .controller('GameController', GameController);

  GameController.$inject = [
    '$rootScope',
    '$scope',
    '$state',
    '$timeout',
    '$mdDialog',
    'profileService'
  ];

  /* @ngInject */
  function GameController(
    $rootScope,
    $scope,
    $state,
    $timeout,
    $mdDialog,
    profileService
  ) {
    var vm = this;

    var user = {};
    var tempImages = [];
    var flippedImage = null;
    var numOfCards = 0;

    vm.images = null;
    vm.numOfRows = 0;
    vm.numOfCols = 0;
    vm.isCheckingMatch = false;

    vm.imageFlipped = imageFlipped;

    var stateChangeStartListener = $rootScope.$on('$stateChangeStart', stateChangeStart);

    activate();

    function activate() {
      profileService.getProfile()
        .then(function(res) {
          user = res.data;
          showDialog();
        });
    }

    function showDialog() {
      var confirm = $mdDialog.prompt()
        .title('How many pairs of cards do you want?')
        .placeholder('Number of pairs')
        .ariaLabel('Number of pairs')
        .initialValue(user.images.length)
        .ok('Play!');

      $mdDialog.show(confirm).then(function(result) {
        numOfCards = result * 2;
        vm.numOfRows = Math.floor(Math.sqrt(numOfCards));
        vm.numOfCols = Math.sqrt(numOfCards) % 1 === 0 ? vm.numOfRows : vm.numOfRows + 1;

        for (var i = 0; i < result; i++) {
          var rand_index = Math.floor(Math.random() * user.images.length);
          var temp_image = user.images.splice(rand_index, 1)[0];
          tempImages.push({ url: temp_image, flipped: false, matched: false });
          tempImages.push({ url: temp_image, flipped: false, matched: false });
        }

        vm.images = _.shuffle(tempImages);

        $timeout(function() {
          _.forEach(document.querySelectorAll('[unselectable]'), function(elem) {
            makeUnselectable(elem);
          });
        });
      });
    }

    function imageFlipped(image, index) {
      if (image.flipped || vm.isCheckingMatch) {
        return;
      }

      vm.isCheckingMatch = true;
      image.flipped = true;

      if (!flippedImage) {
        flippedImage = { url: image.url, index: index };
        vm.isCheckingMatch = false;
      } else if (flippedImage.url === image.url) {
        numOfCards -= 2;
        vm.images[index].matched = true;
        vm.images[flippedImage.index].matched = true;
        flippedImage = null;
        vm.isCheckingMatch = false;

        if (numOfCards === 0) {
          var alert = $mdDialog.alert({
            title: 'You Win!',
            textContent: 'Congratulations! You found all of the matches!',
            ok: 'Play Again'
          });

          $mdDialog
            .show(alert)
            .finally(function() {
              alert = undefined;
              stateChangeStartListener();
              $state.reload();
            });
        }
      } else {
        $timeout(function() {
          _.forEach(vm.images, function(image) {
            if (!image.matched) {
              image.flipped = false;
            }
          });

          flippedImage = null;
          vm.isCheckingMatch = false;
        }, 1500);
      }
    }

    function makeUnselectable(node) {
      if (node.nodeType === 1) {
        node.setAttribute('unselectable', 'on');
      }
      var child = node.firstChild;
      while (child) {
        makeUnselectable(child);
        child = child.nextSibling;
      }
    }

    function stateChangeStart(event, toState, toParams, fromState, fromParams) {
      event.preventDefault();
      var confirm = $mdDialog.confirm()
        .title('Are you sure you want leave your game?')
        .ariaLabel('Leave game')
        .ok('Yes, leave')
        .cancel('No, stay');

      $mdDialog.show(confirm).then(function() {
        stateChangeStartListener();
        $state.go(toState, toParams);
      }, function() {
        $scope.$emit('routeUpdate', 'game');
      });
    }
  }
})();
