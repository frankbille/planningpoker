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
