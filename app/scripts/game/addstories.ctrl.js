angular.module('planningpoker').controller('AddStoriesCtrl', function ($scope, $mdDialog, $firebaseArray, gameRef) {
  $scope.saveStories = function () {
    var storiesDb = gameRef.child('stories').toFirebaseArray();

    var stories = $scope.stories.split('\n');
    angular.forEach(stories, function (story) {
      story = story.trim();
      if (story.length > 0) {
        storiesDb.$add({
          title: story,
          score: '-',
          state: 'Pending'
        })
      }
    });
    $mdDialog.hide();
  };

  $scope.cancel = function () {
    $mdDialog.cancel();
  };
});
