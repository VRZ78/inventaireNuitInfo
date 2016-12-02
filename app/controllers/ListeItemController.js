/**
 * Created by Victor on 01/12/2016.
 */

angular.module('inventaire').controller('ListeItemController', function ($scope, $rootScope, $mdDialog, $mdToast,$http, localStorageService, $location) {



    $scope.getBack = function() {
        $location.path('/fiches')
    }

    $scope.fiche = $rootScope.fiche

    $http.defaults.headers.common["Authorization"] = $rootScope.token;
    $http.get($rootScope.SERVER_ADRESS + 'objet/'+$scope.fiche.id).then(function(response){
        $scope.items = response.data
    },function(error){
        console.log(error);
    });



    $scope.results = [];

  /*  $scope.items = [{
        name: "Doliprane",
        description: "A prendre quand Quentin chante",
        image: "https://www.pharma-medicaments.com/media/3624698__018306400_1440_22042013.jpg",
        categorie: "Médicament"
    },{
        name: "Asprine",
        description: "A prendre quand Quentin chante",
        image: "https://www.pharma-medicaments.com/media/3353153__065138800_1440_22042013.jpg",
        categorie: "Médicament"
    },{
        name: "Passport",
        description: "Passport biométrique",
        image: "https://travelersunited.org/wp-content/uploads/xus-passport-CT-1K.jpg.pagespeed.ic.fHoiPsKuqG.jpg",
        categorie: "Papiers d'identités"
    },{
        name: "Permis B",
        description: "",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/PC-Europ01-275x379.jpg/220px-PC-Europ01-275x379.jpg",
        categorie: "Papiers d'identités"
    }]*/

    $scope.selectedTrie = "name";

    $scope.search = "";

    $scope.famille = localStorageService.get("famille");

    $scope.tries = [
        {
            name: "Name",
            value: "name"
        },
        {
            name: "Category",
            value: 'categories'
        }
    ]


    $scope.logout = function() {
        $location.path("/fiches")
    }
    $scope.addItem = function (ev) {
        $mdDialog.show({
                controller: NouvelleItemController,
                templateUrl: 'app/views/ajouterItemDialog.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true
            })
            .then(function (answer) {
                $http.defaults.headers.common["Authorization"] = $rootScope.token;
                $http.get($rootScope.SERVER_ADRESS + 'objet/'+$scope.fiche.id).then(function(response){
                    $scope.items = response.data
                },function(error){
                    console.log(error);
                });            }, function () {
                $http.defaults.headers.common["Authorization"] = $rootScope.token;
                $http.get($rootScope.SERVER_ADRESS + 'objet/'+$scope.fiche.id).then(function(response){
                    $scope.items = response.data
                },function(error){
                    console.log(error);
                });            });
    };

    function NouvelleItemController($scope, $mdDialog) {

        $scope.states = ('Medicament Boisson Passeport Other').split(' ').map(function(state) {
            return {abbrev: state};
        });

        $scope.item = {
            nom: "",
            description: "",
            image: "",
            lien_image: "",
            categorie: "",
            fiche: $rootScope.fiche.id
        }

        $scope.findPic = function(){

            var search = $scope.item.imageSearch;
            $http.defaults.headers.common["Ocp-Apim-Subscription-Key"] = "fc0df77a54494178803a11aa25b36e2f";
            $http.get('https://api.cognitive.microsoft.com/bing/v5.0/search?q='+$scope.item.lien_image, {
                headers: {
                }
            }).success(function(response){
                $scope.results = response.images.value;
                console.log($scope.results);
                $scope.recherche = "";
            });



        }

        $scope.fillForm = function(index){
            $http.defaults.headers.common["Ocp-Apim-Subscription-Key"] = "bbefffb6f98447608702b24c33794135";
            $http.post('https://api.projectoxford.ai/vision/v1.0/analyze?visualFeatures=Categories,Description', {"url": $scope.results[index].contentUrl}).then(function (response) {
                $scope.item.categorie = response.data.categories[0].name;
                $scope.item.description = response.data.description.captions[0].text;
                $scope.item.nom = $scope.item.lien_image;
                $scope.item.lien_image = $scope.results[index].contentUrl;
                $scope.results = {};
            }, function (error) {
                console.log(error);
            });

  /*          $http({
             url: ' ',
             method: "POST",
             data: {"url": $scope.results[index].contentUrl},
             headers: {
             'Ocp-Apim-Subscription-Key': 'bbefffb6f98447608702b24c33794135'
             },
             responseType: 'arraybuffer'
             }).success(function (data, status, headers, config) {

             }).error(function (data, status, headers, config) {

             });*/
        }

        $scope.submitAddFiche = function (ev) {

            $http.defaults.headers.common["Authorization"] = $rootScope.token;
            $http.post($rootScope.SERVER_ADRESS + 'AjoutObjet', $scope.item).then(function(response){
                $mdToast.show($mdToast.simple().content("Objet ajouté").position('bottom right'));
                $mdDialog.hide()
            },function(error){
                console.log(error);
            });

          ;
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

});
