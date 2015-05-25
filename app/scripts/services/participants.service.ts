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
/// <reference path="../../../typings/angularjs/angular-cookies.d.ts" />
/// <reference path="../../../typings/firebase/firebase.d.ts" />
/// <reference path="../../../typings/angularfire/angularfire.d.ts" />
/// <reference path="../domains/participant.ts" />

module planningpoker.services {

  export interface IParticipantsService {
    remove(participant:planningpoker.domains.Participant):angular.IPromise<any>;
    registerPresence(participantRemovedCallback, noParticipantCallback):void;
  }

  class ParticipantsService implements IParticipantsService {
    private participantsRef:Firebase;
    private participantsArray:AngularFireArray;
    private $q:angular.IQService;
    private $cookies:angular.cookies.ICookiesService;
    private gameKey:string;
    private firebase;

    constructor(gameKey:string, participantsRef:Firebase, participantsArray:AngularFireArray, $q:angular.IQService, $cookies:angular.cookies.ICookiesService, firebase) {
      this.gameKey = gameKey;
      this.participantsRef = participantsRef;
      this.participantsArray = participantsArray;
      this.$q = $q;
      this.$cookies = $cookies;
      this.firebase = firebase;
    }

    remove(participant:planningpoker.domains.Participant):angular.IPromise<any> {
      var deferred = this.$q.defer();

      var participantRef = this.participantsRef.child(participant.key);
      participantRef.ref().remove(function () {
        deferred.resolve();
      });

      return deferred.promise;
    }

    registerPresence(participantRemovedCallback, noParticipantCallback):void {
      var participantKey = this.$cookies[this.gameKey];
      if (angular.isDefined(participantKey)) {
        var participantRef = this.participantsRef.child(participantKey);
        this.handlePresence(participantRef, participantRemovedCallback);
      } else {
        var participantsService = this;
        noParticipantCallback(function (participant) {
          participantsService.participantsArray.$add(participant).then(function (participantRef) {
            var participantKey = participantRef.key();
            participantRef.update({
              key: participantKey
            });
            participantsService.$cookies[participantsService.gameKey] = participantKey;
            participantsService.handlePresence(participantRef, participantRemovedCallback);
          });
        });
      }
    }

    loadNumberOfParticipants():angular.IPromise<number> {
      var deferred = this.$q.defer();

      var ps = this;
      this.participantsArray.$loaded().then(function () {
        deferred.resolve(ps.participantsArray.length);
      });

      return deferred.promise;
    }

    getCurrentParticipantKey():string {
      var participantKey = this.$cookies[this.gameKey];
      if (angular.isDefined(participantKey)) {
        return participantKey;
      }

      return null;
    }

    handlePresence(participantRef, participantRemovedCallback):void {
      var ps = this;
      participantRef.ref().on('value', function (snap) {
        if (snap.exists() === false) {
          delete ps.$cookies[ps.gameKey];
          participantRemovedCallback();
        }
      });

      var myConnectionsRef = participantRef.child('connections');
      var connectedRef = this.firebase.getInfoConnectedRef();
      connectedRef.ref().on('value', function (snap) {
        if (snap.val() === true) {
          var con = myConnectionsRef.ref().push(true);
          con.onDisconnect().remove();
        }
      });
    }
  }

  export interface IParticipantsServiceFactory {
    load(participantsRef:Firebase, gameKey:string):IParticipantsService;
  }

  class ParticipantsServiceFactory implements IParticipantsServiceFactory {
    private $q:angular.IQService;
    private $firebaseArray:AngularFireArrayService;
    private $cookies:angular.cookies.ICookiesService;
    private firebase;

    constructor($q:angular.IQService, $firebaseArray:AngularFireArrayService, $cookies:angular.cookies.ICookiesService, firebase) {
      this.$q = $q;
      this.$firebaseArray = $firebaseArray;
      this.$cookies = $cookies;
      this.firebase = firebase;
    }

    load(participantsRef:Firebase, gameKey:string):IParticipantsService {
      var participantsArray = this.$firebaseArray(participantsRef);
      return new ParticipantsService(gameKey, participantsRef, participantsArray, this.$q, this.$cookies, this.firebase);
    }
  }

  angular.module('planningpoker').service('ParticipantsServiceFactory', ParticipantsServiceFactory);
}

