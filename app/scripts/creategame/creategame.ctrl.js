angular.module('planningpoker').controller('CreateGameCtrl', function ($scope, firebase, $state) {
  $scope.progressType = 'determinate';

  $scope.create = function () {
    $scope.creating = true;
    $scope.progressType = 'indeterminate';

    var gamesRef = firebase.child('games');
    var managersRef = firebase.child('managers');

    var gameRef = gamesRef.ref().push({
      title: angular.isDefined($scope.gameName) ? $scope.gameName : null,
      createdAt: Firebase.ServerValue.TIMESTAMP,
      state: 'pending'
    }, function () {
      var managerRef = managersRef.ref().push({
        gameId: gameRef.key()
      }, function () {
        $state.go('game', {
          gameId: gameRef.key(),
          managerId: managerRef.key()
        })
      });
    });
  };

});
