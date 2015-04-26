angular.module('planningpoker').controller('CreateSessionCtrl', function($scope, $firebaseObject, $firebaseArray, $state) {
  $scope.progressType = 'determinate';

  $scope.create = function() {
    $scope.creating = true;
    $scope.progressType = 'indeterminate';

    var dbRef = new Firebase('https://planningpokerapp.firebaseio.com');
    var sessionsRef = dbRef.child('sessions');
    var managersRef = dbRef.child('managers');

    var sessionRef = sessionsRef.push({
      title: angular.isDefined($scope.sessionName) ? $scope.sessionName : null,
      createdAt: Firebase.ServerValue.TIMESTAMP
    }, function() {
      var managerRef = managersRef.push({
        sessionId: sessionRef.key()
      }, function() {
        $state.go('session', {
          sessionId: sessionRef.key(),
          managerId: managerRef.key()
        })
      });
    });
  };

});
