/*
 * Copyright 2015 Frank Bille
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

angular.module('planningpoker').config(function ($mdIconProvider) {
  $mdIconProvider
    .iconSet('action', '/images/action-icons.svg', 24)
    .iconSet('content', '/images/content-icons.svg', 24)
    .iconSet('navigation', '/images/navigation-icons.svg', 24)
    .iconSet('social', '/images/social-icons.svg', 24)
    .icon('card:card0', '/images/card-0.svg')
    .icon('card:card1', '/images/card-1.svg')
    .icon('card:card2', '/images/card-2.svg')
    .icon('card:card3', '/images/card-3.svg')
    .icon('card:card5', '/images/card-5.svg')
    .icon('card:card8', '/images/card-8.svg')
    .icon('card:card13', '/images/card-13.svg')
    .icon('card:card21', '/images/card-21.svg')
    .icon('card:card34', '/images/card-34.svg')
    .icon('card:card55', '/images/card-55.svg')
    .icon('card:card89', '/images/card-89.svg')
    .icon('card:cardunknown', '/images/card-unknown.svg')
    .icon('card:cardselected', '/images/card-selected.svg')
    .icon('card:card-', '/images/card-pending.svg');
});
