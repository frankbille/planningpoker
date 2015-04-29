angular.module('planningpoker', [
  'ngCookies',
  'ngMaterial',
  'ngMessages',
  'firebase',
  'ui.router',
  'ui.gravatar'
]).config(function ($locationProvider) {
  $locationProvider.html5Mode(true);
});
