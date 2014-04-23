'use strict';

angular.module('planningPokerApp').controller('SessionCtrl', function ($scope, fireRef, fireDb, user, sessionRef, $stateParams) {
  $scope.cards = [];
  $scope.cards.push({id: 'half', cssClass: 'card-half'});
  $scope.cards.push({id: '1', cssClass: 'card-1'});
  $scope.cards.push({id: '2', cssClass: 'card-2'});
  $scope.cards.push({id: '3', cssClass: 'card-3'});
  $scope.cards.push({id: '5', cssClass: 'card-5'});
  $scope.cards.push({id: '8', cssClass: 'card-8'});
  $scope.cards.push({id: '13', cssClass: 'card-13'});
  $scope.cards.push({id: '20', cssClass: 'card-20'});
  $scope.cards.push({id: '40', cssClass: 'card-40'});
  $scope.cards.push({id: '100', cssClass: 'card-100'});
  $scope.cards.push({id: 'question', cssClass: 'card-question'});

  sessionRef.$bind($scope, 'session').then(function () {
    if (user !== null) {
      if (angular.isUndefined($scope.session.participants[user.id]) || angular.isUndefined($scope.session.participants[user.id].name)) {
        $scope.session.participants[user.id].name = user.displayName;
        $scope.session.participants[user.id].email = user.email;
        $scope.session.participants[user.id].pictureUrl = user.thirdPartyUserData.picture;
      }
    }

    if (angular.isUndefined($scope.session.round)) {
      $scope.session.round = {
        state: 'not-started'
      };
    }
  });

  $scope.startRound = function () {
    $scope.selectedCards = [];
    $scope.session.round.state = 'started';
    $scope.session.round.cardSelections = {};
    angular.forEach($scope.session.participants, function (value, key) {
      $scope.session.round.cardSelections[key] = false;
    });
    $scope.session.round.selectedCards = [];
  };

  $scope.endRound = function () {
    $scope.session.round.state = 'ended';
  };

  $scope.removeEmptyCards = function (card) {
    return angular.isObject(card.selectors);
  };

  $scope.selectCard = function (card) {
    var previousSelectedCard = $scope.session.round.cardSelections[user.id];

    $scope.session.round.cardSelections[user.id] = card.id;

    if (angular.isUndefined($scope.session.round.selectedCards)) {
      $scope.session.round.selectedCards = [];
    }

    var userCard = null;

    angular.forEach($scope.session.round.selectedCards, function (value) {
      if (value.id === previousSelectedCard) {
        userCard = value;
      }
    });

    if (userCard !== null) {
      delete userCard.selectors[user.id];
    }

    userCard = null;

    angular.forEach($scope.session.round.selectedCards, function (value) {
      if (value.id === card.id) {
        userCard = value;
      }
    });

    if (userCard === null) {
      userCard = card;
      $scope.session.round.selectedCards.push(userCard);
    }

    if (angular.isUndefined(userCard.selectors)) {
      userCard.selectors = {};
    }

    userCard.selectors[user.id] = $scope.session.participants[user.id];
  };

  // Presence
  if (user !== null) {
    var userRef = fireRef.child($stateParams.sessionId + '/participants/' + user.id);
    var userConnectionsRef = userRef.child('connections');
    var lastOnlineRef = userRef.child('lastOnline');
    var connectedRef = fireRef.child('.info/connected');
    connectedRef.on('value', function (snap) {
      if (snap.val() === true) {
        var connection = userConnectionsRef.push(true);

        connection.onDisconnect().remove();

        lastOnlineRef.onDisconnect().set(Firebase.ServerValue.TIMESTAMP);
      }
    });
  }
});
