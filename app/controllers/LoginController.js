/**
 * Created by Victor on 01/12/2016.
 */

angular.module('inventaire').controller('LoginController', function ($scope, $http,     $rootScope, $mdDialog, $mdToast, $location) {

    $scope.login = {
        mail: '',
        password: ''
    };

    $scope.reg = {
        prenom: '',
        nom: '',
        mail: '',
        password: ''
    }

    $scope.loginSend = function(){
        if($scope.login.mail != '' && $scope.login.psw != ''){
            $http.post($rootScope.SERVER_ADRESS + 'login', $scope.login).then(function(response){
                $rootScope.token = response.data.token;
                $location.path("/fiches")
            },function(error){
                console.log(error);
            });
        } else {
            $mdToast.show($mdToast.simple().content("Some fields are empties").position('bottom right'));
        }
    }

    $scope.signUp = function(){
        if($scope.reg.fname != '' && $scope.reg.lname != '' && $scope.reg.mail != '' && $scope.reg.psw != ''){
            $http.post($rootScope.SERVER_ADRESS + 'inscription', $scope.reg).then(function(response){
                $mdToast.show($mdToast.simple().content("Inscription réussie").position('bottom right'));
            },function(error){
                console.log(error);
            });
        } else {
            $mdToast.show($mdToast.simple().content("Some fields are empties").position('bottom right'));
        }
    }


});