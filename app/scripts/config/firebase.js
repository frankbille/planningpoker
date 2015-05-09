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
/// <reference path="../../../typings/angularjs/angular.d.ts" />
/// <reference path="../../../typings/firebase/firebase.d.ts" />
/// <reference path="../../../typings/angularfire/angularfire.d.ts" />
angular.module('planningpoker').factory('firebase', function ($firebaseObject, $firebaseArray) {
    var appRef = new Firebase('https://planningpokerappdev.firebaseio.com');
    var firebaseRef = function (ref) {
        return {
            ref: function () {
                return ref;
            },
            key: function () {
                return ref.key();
            },
            child: function (childPath) {
                return firebaseRef(ref.child(childPath));
            },
            toFirebaseObject: function () {
                return $firebaseObject(ref);
            },
            toFirebaseArray: function () {
                return $firebaseArray(ref);
            },
            getInfoConnectedRef: function () {
                return firebaseRef(firebaseRef(appRef).child('.info').child('connected').ref());
            }
        };
    };
    return firebaseRef(appRef);
});
//# sourceMappingURL=firebase.js.map