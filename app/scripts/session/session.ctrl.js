angular.module('planningpoker').controller('SessionCtrl', function ($scope, $cookies, $firebaseObject, $firebaseArray, $stateParams, $state, $mdDialog, $mdBottomSheet) {
  var appRef = new Firebase('https://planningpokerapp.firebaseio.com');

  // Start by checking the rights
  if (angular.isDefined($stateParams.managerId)) {
    var managerRef = appRef.child('managers').child($stateParams.managerId);
    managerRef.once('value', function(manager) {
      console.log('check manager');
      if (manager.val() == null || manager.val().sessionId !== $stateParams.sessionId) {
        console.log('not manager');
        $state.go('session', {
          sessionId: $stateParams.sessionId,
          participantId: angular.isDefined($stateParams.participantId) ? $stateParams.participantId : null,
          managerId: null
        });
      } else {
        console.log('manager');
        $scope.isManager = true;
      }
    });
  }

  // Load up the session itself
  var sessionRef = appRef.child('sessions').child($stateParams.sessionId);
  var sessionObj = $firebaseObject(sessionRef);
  sessionObj.$bindTo($scope, 'session');

  $scope.cards = [
    0,
    1,
    2,
    3,
    5,
    8,
    13,
    21,
    34,
    55,
    89,
    "unknown"
  ];

  addShareLinks($scope, $mdDialog, $stateParams);
  addSettingsLink($scope, $mdDialog);
  addParticipants($scope, $cookies, $stateParams, $mdDialog, sessionRef, $mdBottomSheet, $state, $firebaseArray);
  addStories($scope, $mdDialog, sessionRef);
});

function addShareLinks($scope, $mdDialog, $stateParams) {
  $scope.showShareLinks = function () {
    $mdDialog.show({
      templateUrl: 'views/session/sharelinksdialog.html',
      controller: 'ShareLinksCtrl',
      clickOutsideToClose: true,
      resolve: {
        stateParams: function () {
          return $stateParams;
        }
      }
    });
  };
}

function addSettingsLink($scope, $mdDialog) {
  $scope.showSessionSettings = function () {
    $mdDialog.show({
      templateUrl: 'views/session/settingsdialog.html',
      controller: 'SettingsDialogCtrl',
      clickOutsideToClose: true,
      focusOnOpen: false,
      resolve: {
        session: function () {
          return $scope.session;
        }
      }
    });
  };
}

function addParticipants($scope, $cookies, $stateParams, $mdDialog, sessionRef, $mdBottomSheet, $state, $firebaseArray) {
  $scope.connectionText = function (participant) {
    if (angular.isDefined(participant.connections)) {
      return 'Connected';
    } else {
      return 'Disconnected';
    }
  };

  $scope.connectionStyle = function (participant) {
    if (angular.isDefined(participant.connections)) {
      return {color: '#090'};
    } else {
      return {color: '#900'};
    }
  };

  $scope.isParticipantEditable = function (participant) {
    return participant.key === $cookies[sessionRef.key()] || $scope.isManager;
  };

  $scope.editParticipant = function (participant) {
    if ($scope.isParticipantEditable(participant)) {
      var dialogScope = $scope.$new(true);
      dialogScope.name = participant.name;
      dialogScope.email = participant.email;

      $mdDialog.show({
        templateUrl: 'views/session/editparticipant.html',
        controller: 'EditParticipantCtrl',
        clickOutsideToClose: true,
        focusOnOpen: false,
        scope: dialogScope
      }).then(function (changedParticipant) {
        participant.name = changedParticipant.name;
        participant.email = changedParticipant.email;
      });
    }
  };

  var participantsRef = sessionRef.child('participants');
  $scope.showParticipantActions = function (participant) {
    $mdBottomSheet.show({
      templateUrl: 'views/session/moreparticipantactions.html',
      controller: 'MoreParticipantActionCtrl',
      resolve: {
        participant: function () {
          return participant;
        },
        participantRef: function () {
          return participantsRef.child(participant.key);
        }
      }
    });
  };

  // Presence
  var handlePresence = function (participantRef) {
    participantRef.on('value', function (snap) {
      if (snap.exists() === false) {
        delete $cookies[sessionRef.key()];
        $state.go('session', {
          sessionId: $stateParams.sessionId,
          managerId: angular.isDefined($stateParams.managerId) ? $stateParams.managerId : null
        }, {
          reload: true
        });
      }
    });

    var myConnectionsRef = participantRef.child('connections');
    var connectedRef = new Firebase('https://planningpokerapp.firebaseio.com/.info/connected');
    connectedRef.on('value', function (snap) {
      if (snap.val() === true) {
        var con = myConnectionsRef.push(true);
        con.onDisconnect().remove();
      }
    });
  };

  if (angular.isDefined($cookies[sessionRef.key()])) {
    var participantRef = participantsRef.child($cookies[sessionRef.key()]);
    handlePresence(participantRef);
    participantRef.once('value', function (snap) {
      if (snap.exists()) {
        handlePresence(participantRef);
      } else {
        $state.go('session', {
          sessionId: $stateParams.sessionId,
          managerId: angular.isDefined($stateParams.managerId) ? $stateParams.managerId : null
        }, {
          reload: true
        });
      }
    });
  } else {
    $mdDialog.show({
      templateUrl: 'views/session/editparticipant.html',
      controller: 'EditParticipantCtrl',
      focusOnOpen: false,
      escapeToClose: false
    }).then(function (participant) {
      var participantsDb = $firebaseArray(participantsRef);
      participantsDb.$add(participant).then(function (participantRef) {
        var participantKey = participantRef.key();
        participantRef.update({
          key: participantKey
        });
        $cookies[sessionRef.key()] = participantKey;
        handlePresence(participantRef);
      });
    });
  }
}

function addStories($scope, $mdDialog, sessionRef) {
  $scope.addStories = function() {
    $mdDialog.show({
      templateUrl: 'views/session/addstories.html',
      controller: 'AddStoriesCtrl',
      focusOnOpen: false,
      resolve: {
        sessionRef: function() {
          return sessionRef;
        }
      }
    });
  };
}