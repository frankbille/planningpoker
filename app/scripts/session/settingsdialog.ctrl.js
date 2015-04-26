angular.module('planningpoker').controller('SettingsDialogCtrl', function($scope, $mdDialog, session) {
  $scope.session = session;

  $scope.close = function() {
    $mdDialog.cancel();
  };
});