angular.module('planningpoker').factory('GameService', function ($q, ParticipantsService, StoryService) {
  return function (gameRef) {
    var gameObj = gameRef.toFirebaseObject();
    var participantsService = ParticipantsService(gameRef.child('participants'), gameRef.key());
    var storyService = StoryService(gameRef.child('stories'), participantsService);
    return {
      key: function() {
        return gameRef.key();
      },

      getState: function () {
        return gameObj.state;
      },

      canBeStarted: function () {
        return this.getState() === 'pending';
      },

      getStoryService: function() {
        return storyService;
      },

      getParticipantsService: function() {
        return participantsService;
      },

      getCurrentStoryKey: function() {
        var deferred = $q.defer();

        gameRef.child('currentStory').ref().once('value', function(snap) {
          if (angular.isString(snap.val())) {
            deferred.resolve(snap.val());
          } else {
            deferred.reject('No current session');
          }
        });

        return deferred.promise;
      },

      tryAgain: function() {
        this.getCurrentStoryKey().then(function(storyKey) {
          var storyRef = storyService.getStoryRef(storyKey);
          storyRef.ref().update({
            participants: null,
            revealed: false
          });
        });
      },

      forceReveal: function() {
        this.getCurrentStoryKey().then(function(storyKey) {
          var storyRef = storyService.getStoryRef(storyKey);
          storyRef.ref().child('revealed').set(true);
        });
      },

      nextStory: function() {
        var deferred = $q.defer();

        storyService.nextStory().then(function(story) {
          gameRef.child('currentStory').ref().set(story.$id, function(error) {
            deferred.resolve(story);
          });
        });

        return deferred.promise;
      },

      onCurrentStoryChange: function(callback) {
        gameRef.child('currentStory').ref().on('value', function(snap) {
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
          }, function() {
            gameService.nextStory().then(function (story) {
              deferred.resolve(story);
            });
          });
        } else {
          deferred.reject('Game can not be started because it is in state: ' + this.getState());
        }

        return deferred.promise;
      },

      bindTo: function(scope, property) {
        gameObj.$bindTo(scope, property);
      }
    };
  };
});