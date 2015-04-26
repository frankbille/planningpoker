angular.module('planningpoker').controller('ShareLinksCtrl', function($scope, $state, $mdDialog, stateParams) {
  $scope.sessionLink = $state.href('session', {
    sessionId: stateParams.sessionId
  }, {
    absolute: true,
    inherit: false
  });

  if (angular.isDefined(stateParams.managerId)) {
    $scope.managerLink = $state.href('session', {
      sessionId: stateParams.sessionId,
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