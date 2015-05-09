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

angular.module('planningpoker').factory('StoryService', function ($q:angular.IQService) {
  return function (storiesRef, participantsService) {
    var storiesArray = storiesRef.toFirebaseArray();
    return {

      addStory: function (title) {
        var deferred = $q.defer();

        var story = {
          title: title,
          score: '-',
          state: 'pending',
          revealed: false
        };
        storiesArray.$add(story).then(function (storyRef) {
          deferred.resolve(storiesArray.$getRecord(storyRef.key()));
        });

        return deferred.promise;
      },

      addStories: function (titles) {
        var storyService = this;
        var titlesArray = titles.split('\n');
        angular.forEach(titlesArray, function (title) {
          title = title.trim();
          if (title.length > 0) {
            storyService.addStory(title);
          }
        });
      },

      updateStoryTitle: function (storyKey, title) {
        storiesRef.child(storyKey).child('title').ref().set(title);
      },

      getStoryRef: function (storyKey) {
        return storiesRef.child(storyKey);
      },

      nextStory: function () {
        var deferred = $q.defer();

        var nextStory = null;
        var storyService = this;
        storiesArray.$loaded().then(function () {
          angular.forEach(storiesArray, function (story) {
            if (nextStory === null && story.state === 'pending') {
              nextStory = story;
            }
          });
          if (nextStory === null) {
            storyService.addStory('').then(function (story) {
              storyService._startStory(deferred, story);
            });
          } else {
            storyService._startStory(deferred, nextStory);
          }
        });

        return deferred.promise;
      },

      getSelectedCard: function (currentStory, participant) {
        if (angular.isDefined(currentStory) && angular.isObject(currentStory.participants)) {
          var participantCard = currentStory.participants[participant.key];
          if (angular.isDefined(participantCard)) {
            if (currentStory.revealed) {
              return 'card:card' + participantCard;
            } else {
              return 'card:cardselected';
            }
          }
        }

        return 'card:card-';
      },

      setSelectedCard: function (currentStory, card) {
        var currentParticipantKey = participantsService.getCurrentParticipantKey();
        currentStory.$ref().child('participants').child(currentParticipantKey).set(card, function () {
          participantsService.loadNumberOfParticipants().then(function (numberOfParticipants) {
            if (numberOfParticipants === Object.keys(currentStory.participants).length) {
              currentStory.revealed = true;

              var total = 0;
              var participantsWithNumberValue = 0;
              angular.forEach(currentStory.participants, function (value) {
                if (angular.isNumber(value)) {
                  total += value;
                  participantsWithNumberValue++;
                }
              });

              var possibleCards = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89];
              if (participantsWithNumberValue === 0) {
                participantsWithNumberValue = 1;
              }
              var average = total / participantsWithNumberValue;
              var storyScore = 0;
              for (var i = 0; i < possibleCards.length; i++) {
                var possibleCard = possibleCards[i];
                if (possibleCard >= average) {
                  storyScore = possibleCard;
                  break;
                }
              }
              currentStory.score = storyScore;

              currentStory.$save();
            }
          });
        });
      },

      _startStory: function (deferred, story) {
        story.state = 'started';
        storiesArray.$save(story).then(function () {
          deferred.resolve(story);
        });
      }

    };
  }
});
