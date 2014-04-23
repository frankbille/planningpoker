'use strict';

angular.module('planningPokerApp').controller('MainCtrl', function ($scope, fireRef, fireDb, fireAuth, user, $modal, $state, $stateParams) {
  $scope.loaded = true;

  if (user === null) {
    var modalInstance = $modal.open({
      controller: 'LoginCtrl',
      templateUrl: 'views/login.html',
      scope: $scope,
      resolve: {
        fireAuth: function () {
          return fireAuth;
        }
      },
      keyboard: false,
      backdrop: 'static'
    });

    modalInstance.result.then(function () {
      // Reload doesn't reload controller right now, so using temp solution
      // https://github.com/angular-ui/ui-router/issues/582
      // $state.reload();;
      $state.transitionTo($state.current, $stateParams, { reload: true, inherit: true, notify: true });
    });
  } else {
    $scope.user = user;
  }

  $scope.logout = function () {
    fireAuth.$logout();
    // Reload doesn't reload controller right now, so using temp solution
    // https://github.com/angular-ui/ui-router/issues/582
    // $state.reload();
    $state.transitionTo($state.current, $stateParams, { reload: true, inherit: true, notify: true });
  };

});
