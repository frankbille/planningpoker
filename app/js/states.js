'use strict';

angular.module('planningPokerApp').config(function ($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.otherwise('/');

  $stateProvider
    .state('main', {
      abstract: true,
      controller: 'MainCtrl',
      templateUrl: 'views/main.html',
      resolve: {
        fireRef: function () {
          return new Firebase('https://planningpokerapp.firebaseio.com/');
        },
        fireDb: function (fireRef, $firebase) {
          return $firebase(fireRef);
        },
        fireAuth: function (fireRef, $firebaseSimpleLogin) {
          return $firebaseSimpleLogin(fireRef);
        },
        user: function (fireAuth) {
          return fireAuth.$getCurrentUser();
        }
      }
    })
    .state('main.create', {
      url: '/',
      controller: 'CreateSessionCtrl',
      templateUrl: 'views/createsession.html'
    })
    .state('main.session', {
      url: '/{sessionId:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}}',
      controller: 'SessionCtrl',
      templateUrl: 'views/session.html',
      resolve: {
        sessionRef: function (fireDb, $stateParams) {
          return fireDb.$child($stateParams.sessionId);
        }
      }
    });

});
