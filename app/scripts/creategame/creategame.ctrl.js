angular.module('planningpoker').controller('CreateGameCtrl', function($scope, $firebaseObject, $firebaseArray, $state) {
  $scope.progressType = 'determinate';

  $scope.create = function() {
    $scope.creating = true;
    $scope.progressType = 'indeterminate';

    var dbRef = new Firebase('https://planningpokerapp.firebaseio.com');
    var gamesRef = dbRef.child('games');
    var managersRef = dbRef.child('managers');

    var gameRef = gamesRef.push({
      title: angular.isDefined($scope.gameName) ? $scope.gameName : null,
      createdAt: Firebase.ServerValue.TIMESTAMP
    }, function() {
      var managerRef = managersRef.push({
        gameId: gameRef.key()
      }, function() {
        $state.go('game', {
          gameId: gameRef.key(),
          managerId: managerRef.key()
        })
      });
    });
  };

});
