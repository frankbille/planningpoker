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

/// <reference path="../../../../app/scripts/ui/creategame/creategame.ctrl.ts" />
/// <reference path="../../../../typings/jasmine/jasmine.d.ts" />
/// <reference path="../../../../typings/angularjs/angular-mocks.d.ts" />
module planningpoker.creategame {
  describe('CreateGameCtrl', () => {
    beforeEach(module('planningpoker'));

    var controller;

    beforeEach(() => {
      controller = new CreateGameController(null, null);
    });

    describe('$scope.progressType', () => {
      it('should have default value', () => {
        expect(controller.progressType).toBe('determinate');
      });
    });

    describe('$scope.create', () => {
      it('should be a function', () => {
        expect(typeof(controller.create)).toBe('function');
      });
    });
  });

}

