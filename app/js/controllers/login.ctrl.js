'use strict';

angular.module('planningPokerApp').controller('LoginCtrl', function ($scope, $modalInstance) {

  $scope.login = function () {
    $scope.fireAuth.$login('google').then(function (user) {
      $modalInstance.close(user);
    });
  };

});
