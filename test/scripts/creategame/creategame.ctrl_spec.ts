/// <reference path="../../../app/scripts/creategame/creategame.ctrl.ts" />
/// <reference path="../../../typings/jasmine/jasmine.d.ts" />
/// <reference path="../../../typings/angularjs/angular-mocks.d.ts" />

describe('CreateGameCtrl', () => {
  beforeEach(module('planningpoker'));

  var $scope, controller;

  beforeEach(inject((_$controller_) => {
    $scope = {};
    controller = _$controller_('CreateGameCtrl', {$scope: $scope});
  }));

  describe('$scope.progressType', () => {
    it('should have default value', () => {
      expect($scope.progressType).toBe('determinate');
    });
  });

  describe('$scope.create', () => {
    it('should be a function', () => {
      expect(typeof($scope.create)).toBe('function');
    });
  });
});
