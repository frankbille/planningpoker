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
/// <reference path="../../../../typings/angular-ui-router/angular-ui-router.d.ts" />
/// <reference path="../../../../typings/firebase/firebase.d.ts" />

module planningpoker.creategame {
  'use strict';

  export interface CreateGameScope {
    creating: boolean;
    progressType: string;
    gameName: string;
    create(): void;
  }

  export class CreateGameController implements CreateGameScope {
    creating:boolean;
    progressType:string;
    gameName:string;

    private $state:angular.ui.IStateService;
    private firebase;

    constructor(firebase, $state:angular.ui.IStateService) {
      var vm = this;

      this.firebase = firebase;
      this.$state = $state;

      vm.progressType = 'determinate';
      vm.creating = false;
    }

    create():void {
      var vm = this;
      vm.creating = true;
      vm.progressType = 'indeterminate';

      var gamesRef = this.firebase.child('games');
      var managersRef = this.firebase.child('managers');

      var gameRef = gamesRef.ref().push({
        title: angular.isDefined(vm.gameName) ? vm.gameName : null,
        createdAt: Firebase.ServerValue.TIMESTAMP,
        state: 'pending'
      }, function () {
        var managerRef = managersRef.ref().push({
          gameId: gameRef.key()
        }, function () {
          vm.$state.go('game', {
            gameId: gameRef.key(),
            managerId: managerRef.key()
          })
        });
      });
    }
  }

  angular.module('planningpoker').controller('CreateGameCtrl', CreateGameController);
}

