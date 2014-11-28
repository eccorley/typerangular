'use strict';

angular.module('myApp.view1', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1', {
    templateUrl: 'view1/view1.html',
    controller: 'View1Ctrl'
  });
}])

.controller('View1Ctrl', ['$scope', function($scope){

  /* TODO: Typeracer Websocket implementation

      Open - Create player object (username, progress)
             and store in players Array

      Message - Receive player object (username, progress)
                from server and update progress bar

      Send - On completion of word, send player object
             to server for broadcasting

  */

  // WebSocket implementation
  $scope.status = 'Disconnected';
  $scope.username = '';
  $scope.players = [];
  $scope.socket = '';
  $scope.checked = 1;
  $scope.history = [];

  $scope.join = function () {
    var socket = new WebSocket('ws://localhost:8080/', 'chat-protocol');

    socket.addEventListener('open', function (event) {
      $scope.$apply(function () {
        $scope.status = 'Connected';
        $scope.checked = 0;
        $scope.username = $scope.new_username;
        socket.send(
            angular.toJson({new: $scope.new_username})
        );
      });
    });

    socket.addEventListener('close', function (event) {
      $scope.$apply(function () {
        $scope.status = 'Disconnected';
      });
    });

    socket.addEventListener('message', function (event) {
      $scope.$apply(function () {
        var message = JSON.parse(event.data)
        console.log(message.new);
        message.new ? $scope.players.push(message) : $scope.history.push(message);
        console.log($scope.history);
      });
    });

    $scope.socket = socket;
  };

  $scope.send = function () {
    $scope.socket.send(
        angular.toJson({
          username: $scope.username,
          message: $scope.message
        }));
    $scope.message = '';
  };



  // Text input/output module
  var current_span, total, start;
  $scope.raw = '';
  $scope.sanitized = [];
  $scope.arr_wpm = [];
  $scope.wpm = 0;

  $scope.$watch("raw", function(newValue) {
    $scope.sanitized = newValue.split(' ').filter(function (elem) {
      return elem.replace(/\s/gmi, '');
    }).map(function (elem) {
      return elem.trim();
    });
  });

  total = start = new Date();

  angular.element(document.querySelector('#input')).on('keydown', function (event) {
    if (typeof current_span == "null") {
      // todo: handle no raw text scenario
      console.log("Please Enter Text");
    }
    if (typeof current_span == "undefined") {
      current_span = document.getElementById('sanitized').firstElementChild;
    }
    current_span.className = current_span.className + ' active';

    if (event.keyCode === 32) {
      var current = this.value.trim();

      if (current === current_span.innerHTML) {

        var end = new Date();
        $scope.arr_wpm.push(end - start);

        total += $scope.arr_wpm[$scope.arr_wpm.length - 1];
        start = end;

        current_span.className = 'word';

        current_span = current_span.nextElementSibling;

        if (current_span) {
          current_span.className = current_span.className + ' active';
        } else {
          for (var i = 0; i < $scope.arr_wpm.length - 1; i++) {
            $scope.arr_wpm = $scope.arr_wpm.slice(1);
            if ($scope.arr_wpm[i+1]) {
              var sum = $scope.arr_wpm[i] + $scope.arr_wpm[i + 1];
            }
            $scope.$apply(function () {
              $scope.wpm = sum / $scope.arr_wpm.length;
            })
          }
        }
      } else {
        current_span.className = current_span.className + ' word-error';
      }
      this.value = '';
    }
  });
}]);