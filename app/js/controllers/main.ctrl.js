'use strict';

angular.module('planningPokerApp').controller('MainCtrl', function ($scope, $firebase, $firebaseSimpleLogin, $modal) {

  $scope.fireRef = new Firebase('https://planningpokerapp.firebaseio.com/');
  $scope.fireDb = $firebase($scope.fireRef);
  $scope.fireAuth = $firebaseSimpleLogin($scope.fireRef);

  var userLoaded = function (user) {
    $scope.user = user;

    if (user === null) {
      var modalInstance = $modal.open({
        controller: 'LoginCtrl',
        templateUrl: 'views/login.html',
        scope: $scope,
        keyboard: false,
        backdrop: 'static'
      });

      modalInstance.result.then(function (user) {
        userLoaded(user);
      });
    }
  };

  $scope.fireAuth.$getCurrentUser().then(function (user) {
    $scope.loaded = true;

    userLoaded(user);
  });

  $scope.logout = function () {
    $scope.fireAuth.$logout();
    userLoaded(null);
  };

});
