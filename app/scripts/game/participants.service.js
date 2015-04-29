angular.module('planningpoker').factory('ParticipantsService', function ($cookies, firebase, $q) {
  return function (participantsRef, gameKey) {
    var participantsArray = participantsRef.toFirebaseArray();
    return {
      remove: function (participant) {
        var deferred = $q.defer();

        var participantRef = participantsRef.child(participant.key);
        participantRef.ref().remove(function () {
          deferred.resolve();
        });

        return deferred.promise;
      },

      registerPresence: function (participantRemovedCallback, noParticipantCallback) {
        var participantKey = $cookies[gameKey];
        if (angular.isDefined(participantKey)) {
          var participantRef = participantsRef.child(participantKey);
          this._handlePresence(participantRef, participantRemovedCallback);
        } else {
          var participantsService = this;
          noParticipantCallback(function (participant) {
            participantsArray.$add(participant).then(function (participantRef) {
              var participantKey = participantRef.key();
              participantRef.update({
                key: participantKey
              });
              $cookies[gameKey] = participantKey;
              participantsService._handlePresence(participantRef, participantRemovedCallback);
            });
          });
        }
      },

      loadNumberOfParticipants: function () {
        var deferred = $q.defer();

        participantsArray.$loaded().then(function () {
          deferred.resolve(participantsArray.length);
        });

        return deferred.promise;
      },

      getCurrentParticipantKey: function () {
        var participantKey = $cookies[gameKey];
        if (angular.isDefined(participantKey)) {
          return participantKey;
        }

        return null;
      },

      _handlePresence: function (participantRef, participantRemovedCallback) {
        participantRef.ref().on('value', function (snap) {
          if (snap.exists() === false) {
            delete $cookies[gameKey];
            participantRemovedCallback();
          }
        });

        var myConnectionsRef = participantRef.child('connections');
        var connectedRef = firebase.getInfoConnectedRef();
        connectedRef.ref().on('value', function (snap) {
          if (snap.val() === true) {
            var con = myConnectionsRef.ref().push(true);
            con.onDisconnect().remove();
          }
        });
      }
    };
  };
});
