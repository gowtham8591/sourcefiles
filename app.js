'use strict';


  var app = angular.module('vkApp', [
      'ngResource',
      'ngGrid',
      'ngRoute',
      'ui.bootstrap',
      'fundoo.services',
      'metaForm',
      'metaHeaderForm',
      'momentfilters',
      'translate'
      ]);


  app.config(['$routeProvider','$locationProvider',
    function ($routeProvider) {
      $routeProvider
        .when('/task', {
          activeTabName: 'task',
          templateUrl: 'views/task.html',
          controller: 'task'
        })
        .when('/repair', {
          activeTabName: 'repair',
          templateUrl: 'views/gridBody.html',
          controller: 'repair'
        })
        .when('/repair/:valveId/:valveTypeId/:valveSubtypeId', {
          activeTabName: 'repair',
          templateUrl: 'views/repairDetail.html',
          controller: 'repairDetail'
        })
        .when('/repair/:id', {
          activeTabName: 'repair',
          templateUrl: 'views/repairDetail.html',
          controller: 'repairDetail'
        })
        .when('/valve', {
          activeTabName: 'valve',
          templateUrl: 'views/gridBody.html',
          controller: 'valve'
        })
        .when('/valve/new', {
          activeTabName: 'valve',
          templateUrl: 'views/valveDetail.html',
          controller: 'valveDetail'
        })
        .when('/valve/:id', {
          activeTabName: 'valve',
          templateUrl: 'views/valveDetail.html',
          controller: 'valveDetail'
        })
        .when('/settings', {
          activeTabName: '',
          templateUrl: 'views/settings.html',
          controller: 'settings'
        })
        .when('/plant', {
          activeTabName: 'plant',
          templateUrl: 'views/owner.html',
          controller: 'customer'
        })
        .when('/plant/:id', {
          activeTabName: 'plant',
          templateUrl: 'views/customerDetail.html',
          controller: 'customerDetail'
        })
        .when('/users', {
          activeTabName: '',
          templateUrl: 'views/users.html',
          controller: 'user'
        })
        .when('/valspeq', {
            activeTabName: '',
            templateUrl: 'views/valspeq.html',
            controller: 'valspeq'
        })
        .when('/importdata', {
          activeTabName: '',
          templateUrl: 'views/importdata.html',
          controller: 'importdata'
        })
        .when('/signup', {
          activeTabName: '',
          templateUrl: 'views/signup.html',
          controller: 'report'
        })
        .when('/report', {
          activeTabName: '',
          templateUrl: 'views/reports.html',
          controller: 'report'
        })
        .when('/gedash', {
          activeTabName: 'gedash',
          templateUrl: 'views/gedash.html',
          controller: 'gedash'
        })
        .when('/tenants', {
          activeTabName: 'tenants',
          templateUrl: 'views/tenants.html',
          controller: 'tenants'
        })
        .when('/packages', {
          activeTabName: 'packages',
          templateUrl: 'views/packages.html',
          controller: 'packages'
        })
        .otherwise({
          redirectTo: '/task'
        });
    }]);

  app.config( function($httpProvider) {
    $httpProvider.interceptors.push('SecurityInterceptor');
  });

  app.constant('onecloud', {
    serviceUrl: "/VKWebApp/vk/",
    owner: "OWNER"
  });

  // Initialization
  app.run(function(
      $location,
      $rootScope,
      $resource,
      $log,
      UserProperties,
      VKAppDefault
      ) {

    //get the users credentials and store it the root scope
    UserProperties.read({},
      function(response){
        $rootScope.user = response;

        $rootScope.customerRole = $rootScope.user.role.customer;
    });

    VKAppDefault.read({},
      function(response){
        $rootScope.appDefault = response;
    });

        // Get year for footer

    $rootScope.year = moment().format('YYYY');

      // Keep an 'activeRoute' property updated on $rootScope.
      // Masthead uses this to highlight the proper tab.
    var path = function() {
      return $location.path();
    };

    $rootScope.$watch(path, function(newVal){
      $rootScope.activeRoute = newVal;
    });

    $rootScope.$watch('appDefault', function(newVal, oldVal) {});


  });
