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
/// <reference path="../../../../typings/angularjs/angular.d.ts" />
/// <reference path="../../../../typings/angular-material/angular-material.d.ts" />
/// <reference path="../../services/participants.service.ts" />

angular.module('planningpoker').controller('MoreParticipantActionCtrl', function ($scope, $mdBottomSheet:angular.material.MDBottomSheetService, $mdDialog:angular.material.MDDialogService, participant, participantService:planningpoker.services.IParticipantsService) {
  $scope.remove = function () {
    var confirm = $mdDialog.confirm()
      .title('Remove ' + participant.name + '?')
      .content('Would you like to remove ' + participant.name + ' from this planning poker game? ' +
      'This is not a block of that person because they can join again should they wish to do so.')
      .ok('Remove')
      .cancel('Cancel');

    $mdDialog.show(confirm).then(function () {
      participantService.remove(participant).then(function () {
        $mdBottomSheet.hide();
      });
    }, function () {
      $mdBottomSheet.hide();
    });
  };
});
