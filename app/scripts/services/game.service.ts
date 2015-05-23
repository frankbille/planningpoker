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

angular.module('planningpoker').factory('GameService', function ($q:ng.IQService, ParticipantsService, StoryService) {
  return function (gameRef) {
    var gameObj = gameRef.toFirebaseObject();
    var participantsService = ParticipantsService(gameRef.child('participants'), gameRef.key());
    var storyService = StoryService(gameRef.child('stories'), participantsService);
    return {
      key: function () {
        return gameRef.key();
      },

      getState: function () {
        return gameObj.state;
      },

      canBeStarted: function () {
        return this.getState() === 'pending';
      },

      getStoryService: function () {
        return storyService;
      },

      getParticipantsService: function () {
        return participantsService;
      },

      getCurrentStoryKey: function () {
        var deferred = $q.defer();

        gameRef.child('currentStory').ref().once('value', function (snap) {
          if (angular.isString(snap.val())) {
            deferred.resolve(snap.val());
          } else {
            deferred.reject('No current session');
          }
        });

        return deferred.promise;
      },

      tryAgain: function () {
        this.getCurrentStoryKey().then(function (storyKey) {
          var storyRef = storyService.getStoryRef(storyKey);
          storyRef.ref().update({
            participants: null,
            revealed: false
          });
        });
      },

      forceReveal: function () {
        this.getCurrentStoryKey().then(function (storyKey) {
          var storyRef = storyService.getStoryRef(storyKey);
          storyRef.ref().child('revealed').set(true);
        });
      },

      nextStory: function () {
        var deferred = $q.defer();

        storyService.nextStory().then(function (story) {
          gameRef.child('currentStory').ref().set(story.$id, function (error) {
            deferred.resolve(story);
          });
        });

        return deferred.promise;
      },

      onCurrentStoryChange: function (callback) {
        gameRef.child('currentStory').ref().on('value', function (snap) {
          if (angular.isString(snap.val())) {
            callback(storyService.getStoryRef(snap.val()).toFirebaseObject());
          }
        });
      },

      start: function () {
        var deferred = $q.defer();

        if (this.canBeStarted()) {
          var gameService = this;
          gameRef.ref().update({
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
      },

      bindTo: function (scope, property) {
        gameObj.$bindTo(scope, property);
      }
    };
  };
});
