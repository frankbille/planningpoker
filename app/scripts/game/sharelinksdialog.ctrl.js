angular.module('planningpoker').controller('ShareLinksCtrl', function($scope, $state, $mdDialog, stateParams) {
  $scope.gameLink = $state.href('game', {
    gameId: stateParams.gameId
  }, {
    absolute: true,
    inherit: false
  });

  if (angular.isDefined(stateParams.managerId)) {
    $scope.managerLink = $state.href('game', {
      gameId: stateParams.gameId,
      managerId: stateParams.managerId
    }, {
      absolute: true,
      inherit: false
    });
  }

  $scope.close = function() {
    $mdDialog.cancel();
  };
});