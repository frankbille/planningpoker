angular.module('planningpoker').controller('MoreParticipantActionCtrl', function($scope, $mdBottomSheet, $mdDialog, participant, participantRef) {
  $scope.remove = function() {
    var confirm = $mdDialog.confirm()
      .title('Remove '+participant.name+'?')
      .content('Would you like to remove '+participant.name+' from this planning poker game? ' +
      'This is not a blocking of that person because they can join again should they wish to do so.')
      .ok('Remove')
      .cancel('Cancel');

    $mdDialog.show(confirm).then(function() {
      participantRef.remove(function() {
        $mdBottomSheet.hide();
      });
    }, function() {
      $mdBottomSheet.hide();
    });
  };
});