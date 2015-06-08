/*
 * Copyright 2015 Frank Bille
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/// <reference path="../../../../typings/angularjs/angular.d.ts" />
/// <reference path="../../../../typings/angularjs/angular-cookies.d.ts" />
/// <reference path="../../../../typings/angular-material/angular-material.d.ts" />
/// <reference path="../../../../typings/angular-ui-router/angular-ui-router.d.ts" />
/// <reference path="../../services/game.service.ts" />

interface GameStateParamsService extends angular.ui.IStateParamsService {
  gameId: string;
  managerId: string;
  participantId: string;
}

angular.module('planningpoker').controller('GameCtrl', function ($scope, GameServiceFactory:planningpoker.services.IGameServiceFactory, $cookies:angular.cookies.ICookiesService, firebase, $stateParams:GameStateParamsService, $state:angular.ui.IStateService, $mdDialog:angular.material.MDDialogService, $mdBottomSheet:angular.material.MDBottomSheetService) {
  // Start by checking the rights
  if (angular.isDefined($stateParams.managerId)) {
    var managerRef = firebase.child('managers').child($stateParams.managerId);
    managerRef.ref().once('value', function (manager) {
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
  var gameService = GameServiceFactory.load($stateParams.gameId);
  gameService.bindTo($scope, 'game');

  addGameHandling($scope, gameService);
  addShareLinks($scope, $mdDialog, $stateParams);
  addSettingsLink($scope, $mdDialog);
  addParticipants($scope, $cookies, $stateParams, $mdDialog, gameService, $mdBottomSheet, $state, firebase);
  addStories($scope, $mdDialog, gameService);
});

function addGameHandling($scope, gameService) {
  $scope.cards = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, "unknown"];

  gameService.onCurrentStoryChange(function (story) {
    $scope.currentStory = story;
  });

  $scope.storyTitleChanged = function () {
    $scope.currentStory.$save();
  };

  $scope.startGame = function () {
    gameService.start();
  };

  $scope.forceReveal = function () {
    gameService.forceReveal();
  };

  $scope.tryAgain = function () {
    gameService.tryAgain();
  };

  $scope.nextStory = function () {
    gameService.nextStory();
  };

  $scope.chooseCard = function (card) {
    gameService.getStoryService().setSelectedCard($scope.currentStory, card);
  };

  $scope.getSelectedCard = function (participant) {
    return gameService.getStoryService().getSelectedCard($scope.currentStory, participant);
  };
}

function addShareLinks($scope, $mdDialog, $stateParams) {
  $scope.showShareLinks = function (ev) {
    $mdDialog.show({
      templateUrl: '/views/game/sharelinksdialog.html',
      controller: 'ShareLinksCtrl',
      clickOutsideToClose: true,
      targetEvent: ev,
      resolve: {
        stateParams: function () {
          return $stateParams;
        }
      }
    });
  };
}

function addSettingsLink($scope, $mdDialog) {
  $scope.showGameSettings = function (ev) {
    $mdDialog.show({
      templateUrl: '/views/game/settingsdialog.html',
      controller: 'SettingsDialogCtrl',
      clickOutsideToClose: true,
      focusOnOpen: false,
      targetEvent: ev,
      resolve: {
        game: function () {
          return $scope.game;
        }
      }
    });
  };
}

function addParticipants($scope, $cookies, $stateParams, $mdDialog, gameService, $mdBottomSheet, $state, firebase) {
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
    return participant.key === $cookies[gameService.key()] || $scope.isManager;
  };

  $scope.editParticipant = function (participant, ev) {
    if ($scope.isParticipantEditable(participant)) {
      var dialogScope = $scope.$new(true);
      dialogScope.name = participant.name;
      dialogScope.email = participant.email;

      $mdDialog.show({
        templateUrl: '/views/game/editparticipant.html',
        controller: 'EditParticipantCtrl',
        clickOutsideToClose: true,
        focusOnOpen: false,
        scope: dialogScope,
        targetEvent: ev
      }).then(function (changedParticipant) {
        participant.name = changedParticipant.name;
        participant.email = changedParticipant.email;
      });
    }
  };


  $scope.showParticipantActions = function (participant) {
    $mdBottomSheet.show({
      templateUrl: '/views/game/moreparticipantactions.html',
      controller: 'MoreParticipantActionCtrl',
      resolve: {
        participantService: function () {
          return gameService.getParticipantsService();
        },
        participant: function () {
          return participant;
        }
      }
    });
  };

  // Presence
  gameService.getParticipantsService().registerPresence(function () {
    $state.go('game', {
      gameId: $stateParams.gameId,
      managerId: angular.isDefined($stateParams.managerId) ? $stateParams.managerId : null
    }, {
      reload: true
    });
  }, function (participantCallback) {
    $mdDialog.show({
      templateUrl: '/views/game/editparticipant.html',
      controller: 'EditParticipantCtrl',
      focusOnOpen: false,
      escapeToClose: false
    }).then(function (participant) {
      participantCallback(participant);
    });
  });
}

function addStories($scope, $mdDialog, gameService) {
  $scope.editStory = function (storyKey, story, ev) {
    if ($scope.isManager) {
      $mdDialog.show({
        templateUrl: '/views/game/editstory.html',
        controller: 'EditStoryCtrl',
        focusOnOpen: false,
        targetEvent: ev,
        resolve: {
          story: function () {
            return story;
          },
          storyKey: function () {
            return storyKey;
          },
          storyService: function () {
            return gameService.getStoryService();
          }
        }
      });
    }
  };

  $scope.addStories = function (ev) {
    $mdDialog.show({
      templateUrl: '/views/game/addstories.html',
      controller: 'AddStoriesCtrl',
      focusOnOpen: false,
      targetEvent: ev,
      resolve: {
        gameService: function () {
          return gameService;
        }
      }
    });
  };
}
