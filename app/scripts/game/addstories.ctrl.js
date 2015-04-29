angular.module('planningpoker').controller('AddStoriesCtrl', function ($scope, $mdDialog, gameService) {
  $scope.saveStories = function () {
    gameService.getStoryService().addStories($scope.stories);
    $mdDialog.hide();
  };

  $scope.cancel = function () {
    $mdDialog.cancel();
  };
});
