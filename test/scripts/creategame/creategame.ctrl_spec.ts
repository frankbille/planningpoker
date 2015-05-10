/// <reference path="../../../app/scripts/creategame/creategame.ctrl.ts" />
/// <reference path="../../../typings/jasmine/jasmine.d.ts" />
/// <reference path="../../../typings/angularjs/angular-mocks.d.ts" />
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

