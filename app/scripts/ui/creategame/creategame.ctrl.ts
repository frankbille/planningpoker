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
/// <reference path="../../services/game.service.ts" />

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
    private GameServiceFactory:planningpoker.services.IGameServiceFactory;

    constructor(firebase, $state:angular.ui.IStateService, GameServiceFactory:planningpoker.services.IGameServiceFactory) {
      var vm = this;

      this.firebase = firebase;
      this.$state = $state;
      this.GameServiceFactory = GameServiceFactory;

      vm.progressType = 'determinate';
      vm.creating = false;
    }

    create():void {
      var vm = this;
      vm.creating = true;
      vm.progressType = 'indeterminate';

      this.GameServiceFactory.createNew(vm.gameName).then(function (createdGame) {
        vm.$state.go('game', {
          gameId: createdGame.gameKey,
          managerId: createdGame.managerKey
        })
      });
    }
  }

  angular.module('planningpoker').controller('CreateGameCtrl', CreateGameController);
}

