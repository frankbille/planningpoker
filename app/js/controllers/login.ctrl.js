'use strict';

angular.module('planningPokerApp').controller('LoginCtrl', function ($scope, fireAuth, $modalInstance) {

  $scope.login = function () {
    fireAuth.$login('google').then(function () {
      $modalInstance.close();
    });
  };

});
