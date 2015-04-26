angular.module('planningpoker').controller('EditParticipantCtrl', function($scope, $mdDialog) {
  $scope.saveParticipant = function() {
    $mdDialog.hide({
      name: $scope.name,
      email: angular.isDefined($scope.email) ? $scope.email : null
    });
  };
});