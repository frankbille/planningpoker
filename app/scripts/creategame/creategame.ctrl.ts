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
/// <reference path="../../../typings/angularjs/angular.d.ts" />
/// <reference path="../../../typings/angular-ui-router/angular-ui-router.d.ts" />

angular.module('planningpoker').controller('CreateGameCtrl', function ($scope, firebase, $state:angular.ui.IStateService) {
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
