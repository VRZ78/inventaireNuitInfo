/**
 * Created by Victor on 01/12/2016.
 */

angular.module('inventaire').controller('FichesController', function ($http, $scope, $rootScope, $mdDialog, $mdToast, localStorageService, $location, $mdMedia) {


    $scope.familles = [];

    $scope.autoOrder = "";

    $http.defaults.headers.common["Authorization"] = $rootScope.token;
    $http.get($rootScope.SERVER_ADRESS + 'fiches').then(function (response) {
        $scope.familles = response.data;
    }, function (error) {
        console.log(error);
    });


    $scope.logout = function () {
        $location.path('/')
    }


    $scope.showAlert = function (ev) {
        $mdDialog.show({
                controller: NouvelleFicheController,
                templateUrl: 'app/views/ajouterFicheDialog.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true
            })
            .then(function (answer) {

            }, function () {

            });
    };
    function NouvelleFicheController($scope, $mdDialog) {

        $scope.fiche = {
            nom: "",
            description: ""
        }


        $scope.submitAddFiche = function (ev) {
            $http.defaults.headers.common["Authorization"] = $rootScope.token;
            $http.post($rootScope.SERVER_ADRESS + 'AjoutFiche', $scope.fiche).then(function (response) {
                $mdToast.show($mdToast.simple().content("Fiche ajoutér").position('bottom right'));
                $mdDialog.hide();
            }, function (error) {
                console.log(error);
            });

        };

        $scope.hide = function () {
            $mdDialog.hide();
        };

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.answer = function (answer) {
            $mdDialog.hide(answer);
        };
    }


    $scope.goToListes = function (famille) {
        $rootScope.fiche = famille;
        localStorageService.set('famille',famille)
        $location.path('/listeItem')
    }

    $scope.show = function(article){
        $mdDialog.show({
            templateUrl: 'app/views/newsView.html',
            clickOutsideToClose: true,

            controller: function($scope,$mdDialog){
                $scope.article = article;
                $scope.hide=function(){$mdDialog.hide();};
                $scope.cancel=function(){$mdDialog.cancel();};
            }
        })
    }

    $scope.go = function () {
        $http.defaults.headers.common["Ocp-Apim-Subscription-Key"] = "fc0df77a54494178803a11aa25b36e2f";
        $http.get('https://api.cognitive.microsoft.com/bing/v5.0/search?q='+$scope.recherche, {
            headers: {}
        }).success(function(response){
            $scope.data = response;
            $scope.images = response.images.value;
            $scope.news = response.news.value;
        });

        $scope.recherche = " ";
        $scope.bool = true;
    }


});