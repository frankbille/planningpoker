'use strict';

angular.module('planningPokerApp').config(function ($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.otherwise('/');

  $stateProvider
    .state('main', {
      controller: 'MainCtrl',
      templateUrl: 'views/main.html'
    })
    .state('main.create', {
      url: '/',
      controller: 'CreateSessionCtrl',
      templateUrl: 'views/createsession.html'
    })
    .state('main.session', {
      url: '/{sessionId:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}}',
      controller: 'SessionCtrl',
      templateUrl: 'views/session.html'
    });

});
