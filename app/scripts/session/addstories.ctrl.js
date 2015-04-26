angular.module('planningpoker').controller('AddStoriesCtrl', function ($scope, $mdDialog, $firebaseArray, sessionRef) {
  $scope.saveStories = function () {
    var storiesDb = $firebaseArray(sessionRef.child('stories'));

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
