angular.module('planningpoker').controller('GameCtrl', function ($scope, $cookies, firebase, $stateParams, $state, $mdDialog, $mdBottomSheet) {
  // Start by checking the rights
  if (angular.isDefined($stateParams.managerId)) {
    var managerRef = firebase.child('managers').child($stateParams.managerId);
    managerRef.ref().once('value', function(manager) {
      if (manager.val() == null || manager.val().gameId !== $stateParams.gameId) {
        $state.go('game', {
          gameId: $stateParams.gameId,
          participantId: angular.isDefined($stateParams.participantId) ? $stateParams.participantId : null,
          managerId: null
        });
      } else {
        $scope.isManager = true;
      }
    });
  }

  // Load up the game itself
  var gameRef = firebase.child('games').child($stateParams.gameId);
  var gameObj = gameRef.toFirebaseObject();
  gameObj.$bindTo($scope, 'game');

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
  addParticipants($scope, $cookies, $stateParams, $mdDialog, gameRef, $mdBottomSheet, $state, firebase);
  addStories($scope, $mdDialog, gameRef);
});

function addShareLinks($scope, $mdDialog, $stateParams) {
  $scope.showShareLinks = function () {
    $mdDialog.show({
      templateUrl: '/views/game/sharelinksdialog.html',
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
  $scope.showGameSettings = function () {
    $mdDialog.show({
      templateUrl: '/views/game/settingsdialog.html',
      controller: 'SettingsDialogCtrl',
      clickOutsideToClose: true,
      focusOnOpen: false,
      resolve: {
        game: function () {
          return $scope.game;
        }
      }
    });
  };
}

function addParticipants($scope, $cookies, $stateParams, $mdDialog, gameRef, $mdBottomSheet, $state, firebase) {
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
    return participant.key === $cookies[gameRef.key()] || $scope.isManager;
  };

  $scope.editParticipant = function (participant) {
    if ($scope.isParticipantEditable(participant)) {
      var dialogScope = $scope.$new(true);
      dialogScope.name = participant.name;
      dialogScope.email = participant.email;

      $mdDialog.show({
        templateUrl: '/views/game/editparticipant.html',
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

  var participantsRef = gameRef.child('participants');
  $scope.showParticipantActions = function (participant) {
    $mdBottomSheet.show({
      templateUrl: '/views/game/moreparticipantactions.html',
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
    participantRef.ref().on('value', function (snap) {
      if (snap.exists() === false) {
        delete $cookies[gameRef.key()];
        $state.go('game', {
          gameId: $stateParams.gameId,
          managerId: angular.isDefined($stateParams.managerId) ? $stateParams.managerId : null
        }, {
          reload: true
        });
      }
    });

    var myConnectionsRef = participantRef.child('connections');
    var connectedRef = firebase.getInfoConnectedRef();
    connectedRef.ref().on('value', function (snap) {
      if (snap.val() === true) {
        var con = myConnectionsRef.ref().push(true);
        con.onDisconnect().remove();
      }
    });
  };

  if (angular.isDefined($cookies[gameRef.key()])) {
    var participantRef = participantsRef.child($cookies[gameRef.key()]);
    handlePresence(participantRef);
    participantRef.ref().once('value', function (snap) {
      if (snap.exists()) {
        handlePresence(participantRef);
      } else {
        $state.go('game', {
          gameId: $stateParams.gameId,
          managerId: angular.isDefined($stateParams.managerId) ? $stateParams.managerId : null
        }, {
          reload: true
        });
      }
    });
  } else {
    $mdDialog.show({
      templateUrl: '/views/game/editparticipant.html',
      controller: 'EditParticipantCtrl',
      focusOnOpen: false,
      escapeToClose: false
    }).then(function (participant) {
      var participantsDb = participantsRef.toFirebaseArray();
      participantsDb.$add(participant).then(function (participantRef) {
        var participantKey = participantRef.key();
        participantRef.update({
          key: participantKey
        });
        $cookies[gameRef.key()] = participantKey;
        handlePresence(participantRef);
      });
    });
  }
}

function addStories($scope, $mdDialog, gameRef) {
  $scope.addStories = function() {
    $mdDialog.show({
      templateUrl: '/views/game/addstories.html',
      controller: 'AddStoriesCtrl',
      focusOnOpen: false,
      resolve: {
        gameRef: function() {
          return gameRef;
        }
      }
    });
  };
}