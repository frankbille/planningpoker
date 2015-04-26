angular.module('planningpoker').config(function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/');

  $stateProvider
    .state('creategame', {
      url: '/',
      templateUrl: 'views/creategame/creategame.html',
      controller: 'CreateGameCtrl'
    })
    .state('game', {
      url: '/:gameId?managerId',
      templateUrl: 'views/game/game.html',
      controller: 'GameCtrl'
    });
});
