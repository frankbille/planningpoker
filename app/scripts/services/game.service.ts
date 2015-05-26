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
/// <reference path="../../../typings/firebase/firebase.d.ts" />
/// <reference path="../../../typings/angularfire/angularfire.d.ts" />
/// <reference path="../domains/game.ts" />
/// <reference path="participants.service.ts" />
/// <reference path="story.service.ts" />

module planningpoker.services {

  export class CreatedGame {
    gameKey:string;
    managerKey:string;

    constructor(gameKey:string, managerKey:string) {
      this.gameKey = gameKey;
      this.managerKey = managerKey;
    }
  }

  interface GameAngularFireObjectService extends AngularFireObjectService {
    (firebase:Firebase): planningpoker.domains.Game;
  }

  export interface IGameService {
    key():string;
    getState():string;
    canBeStarted():boolean;
    getStoryService():any;
    getParticipantsService():any;
    getCurrentStoryKey():angular.IPromise<string>;
    tryAgain():void;
    forceReveal():void;
    nextStory():angular.IPromise<any>;
    onCurrentStoryChange(callback):void;
    start():angular.IPromise<any>;
    bindTo(scope, property):void;
  }

  class GameService implements IGameService {
    private gameRef:Firebase;
    private gameObj:planningpoker.domains.Game;
    private $q:angular.IQService;
    private participantsService:planningpoker.services.IParticipantsService;
    private storyService:planningpoker.services.IStoryService;

    constructor(gameKey:string, firebase, $q:angular.IQService, $firebaseObject:GameAngularFireObjectService, participantsServiceFactory:planningpoker.services.IParticipantsServiceFactory, StoryServiceFactory:planningpoker.services.IStoryServiceFactory) {
      this.$q = $q;
      this.gameRef = firebase.child('games').child(gameKey);
      this.gameObj = $firebaseObject(this.gameRef.ref());
      this.participantsService = participantsServiceFactory.load(this.gameRef.child('participants').ref(), gameKey);
      this.storyService = StoryServiceFactory.load(this.gameRef.child('stories'), this.participantsService);
    }

    key():string {
      return this.gameRef.key();
    }

    getState():string {
      return this.gameObj.state;
    }

    canBeStarted():boolean {
      return this.getState() === 'pending';
    }

    getStoryService():any {
      return this.storyService;
    }

    getParticipantsService():planningpoker.services.IParticipantsService {
      return this.participantsService;
    }

    getCurrentStoryKey():angular.IPromise<string> {
      var deferred = this.$q.defer();

      this.gameRef.child('currentStory').ref().once('value', function (snap) {
        if (angular.isString(snap.val())) {
          deferred.resolve(snap.val());
        } else {
          deferred.reject('No current session');
        }
      });

      return deferred.promise;
    }

    tryAgain():void {
      var gs = this;
      this.getCurrentStoryKey().then(function (storyKey) {
        var storyRef = gs.storyService.getStoryRef(storyKey);
        storyRef.ref().update({
          participants: null,
          revealed: false
        });
      });
    }

    forceReveal():void {
      var gs = this;
      this.getCurrentStoryKey().then(function (storyKey) {
        var storyRef = gs.storyService.getStoryRef(storyKey);
        storyRef.ref().child('revealed').set(true);
      });
    }

    nextStory():angular.IPromise<any> {
      var deferred = this.$q.defer<any>();

      var gs = this;
      this.storyService.nextStory().then(function (story) {
        gs.gameRef.child('currentStory').ref().set(story.$id, function () {
          deferred.resolve(story);
        });
      });

      return deferred.promise;
    }

    onCurrentStoryChange(callback):void {
      var gs = this;
      this.gameRef.child('currentStory').ref().on('value', function (snap) {
        if (angular.isString(snap.val())) {
          callback(gs.storyService.getStoryObject(snap.val()));
        }
      });
    }

    start():angular.IPromise<any> {
      var deferred = this.$q.defer();

      if (this.canBeStarted()) {
        var gameService = this;
        this.gameRef.ref().update({
          state: 'started'
        }, function () {
          gameService.nextStory().then(function (story) {
            deferred.resolve(story);
          });
        });
      } else {
        deferred.reject('Game can not be started because it is in state: ' + this.getState());
      }

      return deferred.promise;
    }

    bindTo(scope, property):void {
      this.gameObj.$bindTo(scope, property);
    }
  }

  export interface IGameServiceFactory {
    createNew(gameTitle:string):angular.IPromise<CreatedGame>;
    load(gameKey:string):GameService;
  }

  class GameServiceFactory implements IGameServiceFactory {
    private firebase;
    private $q:angular.IQService;
    private $firebaseObject:GameAngularFireObjectService;
    private participantsServiceFactory:planningpoker.services.IParticipantsServiceFactory;
    private StoryServiceFactory:planningpoker.services.IStoryServiceFactory;

    constructor(firebase, $q:angular.IQService, $firebaseObject:GameAngularFireObjectService, ParticipantsServiceFactory:planningpoker.services.IParticipantsServiceFactory, StoryServiceFactory:planningpoker.services.IStoryServiceFactory) {
      this.firebase = firebase;
      this.$q = $q;
      this.$firebaseObject = $firebaseObject;
      this.participantsServiceFactory = ParticipantsServiceFactory;
      this.StoryServiceFactory = StoryServiceFactory;
    }

    createNew(gameTitle:string):angular.IPromise<CreatedGame> {
      var deferred = this.$q.defer();

      var gamesRef = this.firebase.child('games');
      var managersRef = this.firebase.child('managers');

      var gameRef = gamesRef.ref().push({
        title: angular.isDefined(gameTitle) ? gameTitle : null,
        createdAt: Firebase.ServerValue.TIMESTAMP,
        state: 'pending'
      }, function () {
        var managerRef = managersRef.ref().push({
          gameId: gameRef.key()
        }, function () {
          deferred.resolve(new CreatedGame(gameRef.key(), managerRef.key()));
        });
      });
      return deferred.promise;
    }

    load(gameKey:string):GameService {
      return new GameService(gameKey, this.firebase, this.$q, this.$firebaseObject, this.participantsServiceFactory, this.StoryServiceFactory);
    }
  }

  angular.module('planningpoker').service('GameServiceFactory', GameServiceFactory);
}

