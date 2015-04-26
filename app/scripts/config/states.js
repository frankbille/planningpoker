angular.module('planningpoker').config(function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/');

  $stateProvider
    .state('createsession', {
      url: '/',
      templateUrl: 'views/createsession/createsession.html',
      controller: 'CreateSessionCtrl'
    })
    .state('session', {
      url: '/:sessionId?managerId',
      templateUrl: 'views/session/session.html',
      controller: 'SessionCtrl'
    });
});
