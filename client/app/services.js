'use strict';
//  'ngFileUpload'

angular.module('sreizaoApp')
  .factory('authInterceptor', function ($rootScope, $q, $cookieStore, $location) {
    return {
      // Add authorization token to headers
      request: function (config) {
        config.headers = config.headers || {};
        if ($cookieStore.get('token')) {
          config.headers.Authorization = 'Bearer ' + $cookieStore.get('token');
        }
        return config;
      },

      // Intercept 401s and redirect you to login
      responseError: function(response) {
        if(response.status === 401) {
          //$location.path('/login');
          // remove any stale tokens
          $cookieStore.remove('token');
          return $q.reject(response);
        }
        else {
          return $q.reject(response);
        }
      }
    };
  })
  .factory("groupSvc",['$http','$rootScope','$q',function($http,$rootScope,$q){
    var gpService = {};
    var path = '/api/group';
    var groupCache = [];
    gpService.getAllGroup =  getAllGroup;
    gpService.getGroupOnId = getGroupOnId;
    gpService.getGroupOnName = getGroupOnName;
    gpService.clearCache = clearCache;

    function getAllGroup(){

       var deferred = $q.defer();
       if(groupCache && groupCache.length > 0){
        deferred.resolve(groupCache);
       }else{

          $http.get(path).then(function(res){
          var groups = _.sortBy(res.data, function(n) {
              return n.name == 'Other';
          });
          groupCache = groups;
          deferred.resolve(groups);

        },function(errors){
          console.log("Errors in Groups fetch list :"+ JSON.stringify(errors));
          deferred.reject(errors);
        });
       }
      
        return deferred.promise; 
    };
    function getGroupOnId(id){
      var gp;
      for(var i = 0; i < groupCache.length ; i++){
        if(groupCache[i]._id == id){
          gp = groupCache[i];
          break;
        }
      }
      return gp;
    };
    function getGroupOnName(name){
      var gp;
      for(var i = 0; i < groupCache.length ; i++){
        if(groupCache[i].name == name){
          gp = groupCache[i];
          break;
        }
      }
      return gp;
    };
    function clearCache(){
      groupCache = [];
    }
    return gpService;
  }])
  .factory("categorySvc",['$http', '$rootScope','$q','productSvc',function($http, $rootScope,$q,productSvc){
      var catService = {};
      var categoryCache = [];
      var homeCategoryCache = [];
      var path = '/api/category/category';
      catService.getAllCategory = getAllCategory;
      catService.getCategoryForMain = getCategoryForMain;
      catService.getCategoryOnId = getCategoryOnId;
      catService.getCategoryOnFilter = getCategoryOnFilter;
      catService.getCategoryByName = getCategoryByName;
      catService.clearCache = clearCache;
      catService.updateCategory = updateCategory;
      
      function getAllCategory(){

        var deferred = $q.defer();
        if(categoryCache && categoryCache.length > 0){
          deferred.resolve(categoryCache);
        }else{
          $http.get(path).then(function(res){
          var allCategory = _.sortBy(res.data, function(n) {
              return n.name == 'Other';
          });
          categoryCache = allCategory;
          deferred.resolve(allCategory);

          },function(errors){
            console.log("Errors in Category fetch list :"+ JSON.stringify(errors));
          });
          
        }
        return deferred.promise; 
      };

      function getCategoryForMain(){
        var filter = {};
        filter['status'] = true;
        var deferred = $q.defer();
        if(homeCategoryCache && homeCategoryCache.length > 0){
          deferred.resolve(homeCategoryCache);
        }else{
            $http.post(path + "/search",filter).
            then(function(res){
             /* var allCats = _.sortBy(res.data, function(n) {
              return n.name == 'Other';
              });*/
              var catIds = [];
              var allCats = res.data;
              allCats.forEach(function(item){
                  catIds[catIds.length] = item._id;
              });
              productSvc.categoryWiseCount({categoryIds:catIds})
              .then(function(sortedRes){
                for(var i=0;i < allCats.length;i++){
                  for(var j=0;j < sortedRes.length;j++){
                    if(allCats[i]._id == sortedRes[j]._id){
                      if(sortedRes[j].count){
                        allCats[i].count = sortedRes[j].count;
                        break;
                      }
                    }
                  }
                  if(!allCats[i].count)
                    allCats[i].count = 0;
                }
                allCats.sort(function(a,b){
                  return b.count - a.count;
                });
                homeCategoryCache = allCats;
                deferred.resolve(homeCategoryCache);
              })
              .catch(function(errRes){
                 deferred.resolve(res.data);
              })
              //homeCategoryCache = allCats;
             
            })
            .catch(function(res){
               console.log("Errors in Category fetch list :"+ JSON.stringify(res));
               deferred.reject(res);
            });
          }
          return deferred.promise;
        }

        function getCategoryOnFilter(filter){
          return $http.post(path + "/search",filter).
                  then(function(res){
                    return res.data;
                  })
                  .catch(function(res){
                     
                     throw res;
                  });
          }

      function getCategoryOnId(id){
        var cat;
        for(var i = 0; i < categoryCache.length ; i++){
          if(categoryCache[i]._id == id){
            cat = categoryCache[i];
            break;
          }
        }
        return cat;
      };

      function getCategoryByName(name){
        var cat;
        for(var i = 0; i < categoryCache.length ; i++){
          if(categoryCache[i].name == name){
            cat = categoryCache[i];
            break;
          }
        }
        return cat;
      };
      function updateCategory(category){
        return $http.put( path + "/" + category._id,category)
        .then(function(res){
          clearCache();
          return res.data;
        })
        .catch(function(res){
          throw res;
        })
      }

      function clearCache(){
        categoryCache = [];
        homeCategoryCache = [];
      }
      return catService;
  }])
  .factory("brandSvc",['$http', '$rootScope','$q',function($http, $rootScope,$q){
      var brandService = {};
      var path = '/api/brand';
      brandService.getAllBrand = getAllBrand;
      brandService.getBrandOnFilter = getBrandOnFilter;
      
      function getAllBrand(){

          var deferred = $q.defer();
         $http.get(path).then(function(res){
            deferred.resolve(res.data);

          },function(errors){
            console.log("Errors in brand fetch list :"+ JSON.stringify(errors));
            deferred.reject(errors);
          });
          return deferred.promise;
      };

      function getBrandOnFilter(filter){
          return $http.post(path + "/search",filter)
                .then(function(res){
                   var brands = _.sortBy(res.data, function(n) {
                        return n.name == 'Other';
                    });
                  return brands;
                })
                .catch(function(ex){
                  throw ex;
                })
      };
      return brandService;
  }])
.factory("modelSvc",['$http', '$rootScope','$q',function($http, $rootScope,$q){
      var modelService = {};
      var path = '/api/model';
      modelService.getAllModel = getAllModel;
      modelService.getModelOnFilter = getModelOnFilter;
      function getAllModel(){
        var deferred = $q.defer();
         $http.get(path).then(function(res){
            deferred.resolve(res.data);

          },function(errors){
            console.log("Errors in brand fetch list :"+ JSON.stringify(errors));
            deferred.reject(errors);
          });
          return deferred.promise;
      };
     function getModelOnFilter(filter){
         return $http.post(path + "/search",filter)
                .then(function(res){
                  var models = _.sortBy(res.data, function(n) {
                        return n.name == 'Other';
                    });
                  return models;
                })
                .catch(function(ex){
                  throw ex;
                })
      };
      return modelService;
  }])
  .factory("userSvc",['$http',function($http){
      var userService = {};
      var path = '/api/users';
      userService.getUsers = function(data){
        return $http.post(path + "/getuser", data)
              .then(function(res){
                return res.data;
              })
              .catch(function(err){
                throw err;
              });
      };

      userService.deleteUser = function(userid){
        return $http.delete(path + "/" + userid)
                .then(function(res){
                    return res.data;
                })
                .catch(function(err){
                  throw err
                });

      };

      userService.updateUser = function(user){
        return $http.put(path + "/update/" + user._id, user)
        .then(function(res){
          return res.data;
        })
        .catch(function(err){
          throw err;
        });
      };

      return userService;
  }])
  .factory("subscribeSvc",['$http',function($http){
    var subscribeService = {};
    var path = '/api/common';
    subscribeService.getAllSubscribeUsers = function(data){
      return $http.get(path + "/subscribe")
            .then(function(res){
              return res.data;
            })
            .catch(function(err){
              throw err;
            });
    };

    subscribeService.createSubscribeUsers = function(subscribe){
    return $http.post(path + "/subscribe",subscribe)
    .then(function(res){
      return res.data;
    })
    .catch(function(ex){
      throw ex;
    })
  };

      return subscribeService;
  }])
  .factory("countrySvc",['$http',function($http){
      var countryService = {};
      var path = '/api/common/countries';
      countryService.getAllCountries = function(){
        return $http.get(path)
      };
      return countryService;
  }])
  .factory("notificationSvc",['$http',function($http){
      var notificationSvc = {};
      var path = '/api/notification';
      notificationSvc.sendNotification = function(templateName,data,dynamicData,notificationType){
        var dataTosend = {};
        dataTosend['notificationType'] = notificationType;
        if(!data.to)
          return;
        dataTosend['to'] = data.to;
        if(data.subject)
          dataTosend['subject'] = data.subject;
        var tempData = {};
        tempData['templateName'] = templateName;
        tempData['data'] = dynamicData;
        $http.post('/api/common/notificationTemplate',tempData)
        .success(function(res){
            dataTosend['content'] = res;
            $http.post(path,dataTosend).then(function(res){
              console.log('email has been posted');
            });
        })
        .error(function(res){
            console.log('unable to send notification type',res)
        });
      };
      return notificationSvc;
  }])
  .factory("commonSvc",['$http',function($http){
    var commonSvc = {};
    var path = '/api/common';
    commonSvc.sendOtp = function(data){
      return $http.post(path + "/sendOtp",data)
        .then(function(res){
            return res.data;
        })
        .catch(function(err){
            throw err;
        });
    }
    return commonSvc;
}])
 .factory("suggestionSvc",['$http',function($http){
    var suggestionService = {};
    var path = '/api/common/buildsuggestion';
    suggestionService.buildSuggestion = function(suggestions){
      return $http.post(path,suggestions)
      .then(function(res){
        return res.data;
      })
      .catch(function(ex){
        throw ex;
      })
    };
    return suggestionService;
}])
.factory("settingSvc",['$http',function($http){
    var settingSvc = {};
    var path = '/api/common';
     settingSvc.upsert = function(data){
      return $http.post(path + "/upsertsetting",data)
      .then(function(res){
        return res.data;
      })
      .catch(function(ex){
        throw ex;
      })
    };
    settingSvc.get = function(key){
       return $http.post(path + "/getsettingonkey",{key:key})
      .then(function(res){
        return res.data;
      })
      .catch(function(ex){
        throw ex;
      })
    }
    return settingSvc;
}]);