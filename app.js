var app = angular.module("myApp", []);

app.controller("MainCtrl", function ($scope) {
    $scope.actualPassword = "";  // stores real password
    $scope.maskedPassword = "";  // stores masked value

    $scope.onInputChange = function () {
        var inputValue = $scope.maskedPassword;

        if (inputValue.length > $scope.actualPassword.length) {
            // user typed a new character
            var newChar = inputValue[inputValue.length - 1];
            $scope.actualPassword += newChar;
        } else {
            // user deleted a character
            $scope.actualPassword = $scope.actualPassword.slice(0, -1);
        }

        // update masked display
        $scope.maskedPassword = "*".repeat($scope.actualPassword.length);
    };

    $scope.showPassword = function () {
        alert("Actual password is: " + $scope.actualPassword);
    };
});
