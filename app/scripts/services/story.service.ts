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
/// <reference path="participants.service.ts" />
/// <reference path="../domains/story.ts" />
/// <reference path="../domains/participant.ts" />

module planningpoker.services {

  interface StoryAngularFireObjectService extends AngularFireObjectService {
    (firebase:Firebase): planningpoker.domains.Story;
  }

  export interface IStoryService {
    addStory(title:string):angular.IPromise<planningpoker.domains.Story>;
    addStories(titles:string):void;
    updateStoryTitle(storyKey:string, title:string):void;
    getStoryRef(storyKey:string):Firebase;
    getStoryObject(storyKey:string):planningpoker.domains.Story;
    nextStory():angular.IPromise<planningpoker.domains.Story>;
    getSelectedCard(currentStory:planningpoker.domains.Story, participant:planningpoker.domains.Participant);
  }

  class StoryService implements IStoryService {
    private $q:angular.IQService;
    private storiesRef:Firebase;
    private $firebaseObject:StoryAngularFireObjectService;
    private participantsService:planningpoker.services.IParticipantsService;
    private storiesArray:AngularFireArray;

    constructor(storiesRef:Firebase, $q:angular.IQService, $firebaseObject:StoryAngularFireObjectService, $firebaseArray:AngularFireArrayService, participantsService:planningpoker.services.IParticipantsService) {
      this.storiesRef = storiesRef;
      this.$q = $q;
      this.$firebaseObject = $firebaseObject;
      this.participantsService = participantsService;
      this.storiesArray = $firebaseArray(storiesRef.ref());
    }

    addStory(title:string):angular.IPromise<planningpoker.domains.Story> {
      var deferred = this.$q.defer();

      var story = {
        title: title,
        score: '-',
        state: 'pending',
        revealed: false
      };
      var storyService = this;
      this.storiesArray.$add(story).then(function (storyRef) {
        deferred.resolve(storyService.storiesArray.$getRecord(storyRef.key()));
      });

      return deferred.promise;
    }

    addStories(titles:string):void {
      var storyService = this;
      var titlesArray = titles.split('\n');
      angular.forEach(titlesArray, function (title) {
        title = title.trim();
        if (title.length > 0) {
          storyService.addStory(title);
        }
      });
    }

    updateStoryTitle(storyKey:string, title:string):void {
      this.storiesRef.child(storyKey).child('title').ref().set(title);
    }

    getStoryRef(storyKey:string):Firebase {
      return this.storiesRef.child(storyKey);
    }

    getStoryObject(storyKey:string):planningpoker.domains.Story {
      return this.$firebaseObject(this.getStoryRef(storyKey).ref());
    }

    nextStory():angular.IPromise<planningpoker.domains.Story> {
      var deferred = this.$q.defer<planningpoker.domains.Story>();

      var nextStory = null;
      var storyService = this;
      this.storiesArray.$loaded().then(function () {
        angular.forEach(storyService.storiesArray, function (story:planningpoker.domains.Story) {
          if (nextStory === null && story.state === 'pending') {
            nextStory = story;
          }
        });
        if (nextStory === null) {
          storyService.addStory('').then(function (story) {
            storyService.startStory(deferred, story);
          });
        } else {
          storyService.startStory(deferred, nextStory);
        }
      });

      return deferred.promise;
    }

    private startStory(deferred:angular.IDeferred<planningpoker.domains.Story>, story:planningpoker.domains.Story) {
      story.state = 'started';
      this.storiesArray.$save(story).then(function () {
        deferred.resolve(story);
      });
    }

    getSelectedCard(currentStory:planningpoker.domains.Story, participant:planningpoker.domains.Participant) {
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
    }

    setSelectedCard(currentStory:planningpoker.domains.Story, card) {
      var storyService = this;
      var currentParticipantKey = this.participantsService.getCurrentParticipantKey();
      currentStory.$ref().child('participants').child(currentParticipantKey).set(card, function () {
        storyService.participantsService.loadNumberOfParticipants().then(function (numberOfParticipants) {
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
            var average:number = total / participantsWithNumberValue;
            var storyScore:number = 0;
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
    }

  }

  export interface IStoryServiceFactory {
    load(storiesRef:Firebase, participantsService:planningpoker.services.IParticipantsService):IStoryService;
  }

  class StoryServiceFactory implements IStoryServiceFactory {
    private $q:angular.IQService;
    private $firebaseArray:AngularFireArrayService;
    private $firebaseObject:StoryAngularFireObjectService;

    constructor($q:angular.IQService, $firebaseArray:AngularFireArrayService, $firebaseObject:StoryAngularFireObjectService) {
      this.$q = $q;
      this.$firebaseArray = $firebaseArray;
      this.$firebaseObject = $firebaseObject;
    }

    load(storiesRef:Firebase, participantsService:planningpoker.services.IParticipantsService):IStoryService {
      return new StoryService(storiesRef, this.$q, this.$firebaseObject, this.$firebaseArray, participantsService);
    }
  }

  angular.module('planningpoker').service('StoryServiceFactory', StoryServiceFactory);
}

