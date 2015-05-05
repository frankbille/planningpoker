describe('CreateGameCtrl', function () {
  beforeEach(module('planningpoker'));

  var $scope, controller;

  beforeEach(inject(function (_$controller_) {
    $scope = {};
    controller = _$controller_('CreateGameCtrl', {$scope: $scope});
  }));

  describe('$scope.progressType', function () {
    it('should have default value', function () {
      expect($scope.progressType).toBe('determinate');
    });
  });

  describe('$scope.create', function () {
    it('should be a function', function () {
      expect(typeof($scope.create)).toBe('function');
    });
  });
});
