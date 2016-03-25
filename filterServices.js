'use strict';

angular.module('vkApp')
  .factory('SavedFilters', function($resource, onecloud, Validate) {
    var serviceUrl = onecloud.serviceUrl + 'filters/getFilters';
    //var serviceUrl = 'stub/filters.json';
    return $resource(serviceUrl, {}, {
        query: {
          method:'GET',
          isArray:false
      }
    });
  })
  .factory('DeleteFilter', function($resource, onecloud) {
    var serviceUrl = onecloud.serviceUrl + 'filters/deleteSearch';
    return $resource(serviceUrl, {}, {
      'deleteById': {
        method: 'POST'
      }
    });
  })
  .factory('SaveFilter', function($resource, onecloud) {
    var serviceUrl = onecloud.serviceUrl + 'filters/saveSearch';
    //var serviceUrl = 'stub/operators.json';
    return $resource(serviceUrl, {}, {});
  })
  .factory('FilterOperators', function($resource, onecloud) {
    var serviceUrl = onecloud.serviceUrl + 'filters/getOperators';
    //var serviceUrl = 'stub/operators.json';
    return $resource(serviceUrl, {}, {
        'read': {
          method:'GET'
      }
    });
  });