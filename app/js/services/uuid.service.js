'use strict';

angular.module('planningPokerApp').factory('uuid', function () {
  return function () {
    return UUIDjs.create().toString();
  };
});
