angular.module('planningpoker').controller('SettingsDialogCtrl', function ($scope, $mdDialog, game) {
  $scope.game = game;

  $scope.close = function () {
    $mdDialog.cancel();
  };
});
