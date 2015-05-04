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

angular.module('planningpoker').controller('EditStoryCtrl', function ($scope, $mdDialog, story, storyKey, storyService) {
  $scope.title = story.title;

  $scope.cancel = function () {
    $mdDialog.cancel();
  };

  $scope.saveStory = function () {
    if ($scope.storyForm.$valid) {
      storyService.updateStoryTitle(storyKey, $scope.title);
      $mdDialog.hide();
    }
  };
});
