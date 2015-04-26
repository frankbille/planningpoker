angular.module('planningpoker').config(function($mdIconProvider) {
  $mdIconProvider
    .iconSet('action', '/images/action-icons.svg', 24)
    .iconSet('content', '/images/content-icons.svg', 24)
    .iconSet('navigation', '/images/navigation-icons.svg', 24)
    .iconSet('social', '/images/social-icons.svg', 24)
    .iconSet('card', '/images/card-icons.svg', 24);
});
