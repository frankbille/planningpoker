'use strict';

angular.module('planningPokerApp').controller('CreateSessionCtrl', function ($scope, uuid, $firebase, $state) {
  $scope.createSession = function () {
    var guid = uuid();

    var sessionRef = $scope.fireDb.$child(guid);

    var session = {
      title: $scope.name,
      participants: {}
    };
    session.participants[$scope.user.id] = {
      name: $scope.user.displayName,
      email: $scope.user.email,
      pictureUrl: $scope.user.thirdPartyUserData.picture
    };

    sessionRef.$set(session);

    $state.go('main.session', {
      sessionId: guid
    });
  };
});
