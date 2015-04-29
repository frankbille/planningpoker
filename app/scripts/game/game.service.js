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

      onCurrentStoryChange: function(callback) {
        storyService.onCurrentStoryChange(callback);
      },

      start: function () {
        var deferred = $q.defer();

        if (this.canBeStarted()) {
          var gameService = this;
          gameRef.ref().update({
            state: 'started'
          }, function() {
            gameService.getStoryService().nextStory().then(function (story) {
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