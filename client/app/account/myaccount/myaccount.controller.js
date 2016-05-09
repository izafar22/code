(function(){

'use strict';
angular.module('account').controller('MyAccountCtrl',MyAccountCtrl);

//controller function
function MyAccountCtrl($scope,$http,Auth,$state,Modal,LocationSvc,userSvc) {
    var vm = this;
    vm.currentTab = "basic";
    vm.userInfo = {};
    vm.editUser = editUser;
    $scope.isCollapsed = true;
    var path = '/api/products';
    function inti(){
        LocationSvc.getAllLocation()
            .then(function(result){
            $scope.locationList = result;
        })
        var dataToSend = {};
        console.log(Auth.getCurrentUser()._id);
        dataToSend["userId"] = Auth.getCurrentUser()._id;
        $http.post(path + "/userwiseproductcount", dataToSend).then(function(res){
          vm.rentedCounts = 0;
          vm.soldCounts = 0;
          vm.listedCounts = 0;
          vm.totalProducts = 0;
          if(res && res.data && res.data.length > 0){
            for(var i = 0; i < res.data.length; i++){
              if(res.data[i]['_id'] == 'listed')
                vm.listedCounts = res.data[i]['total_assetStatus'];
              else if(res.data[i]['_id'] == 'sold')
                vm.soldCounts = res.data[i]['total_assetStatus'];
              else if(res.data[i]['_id'] == 'rented')
                vm.rentedCounts = res.data[i]['total_assetStatus'];
            }
            vm.totalProducts = Number(vm.listedCounts) + Number(vm.soldCounts) + Number(vm.rentedCounts);
          }
        });

        if(Auth.getCurrentUser()._id){
    		vm.userInfo = Auth.getCurrentUser();
    	}else{
    		$state.go("main");
    	}
    }

    inti();

    function editUser() {
      
      if($scope.form.$invalid){
        $scope.submitted = true;
        return;
      }

      Auth.validateSignup({email:vm.userInfo.email,mobile:vm.userInfo.mobile,userUpdate:true}).then(function(data){
         /*if(data.errorCode == 2){
            Modal.alert("Mobile number already in use. Please use another mobile number",true);
             return;
          }else{*/
               updateUser(vm.userInfo);
          //}
        });

      if(vm.userInfo.country == 'Other')
          vm.userInfo.country = vm.userInfo.otherCountry;
    }

    function updateUser(user) {
        userSvc.updateUser(user).then(function(result){
        $scope.successMessage = "Product updated successfully";
        Modal.alert("User Updated.",true);
        $scope.isCollapsed = true;
      });
    }

  }

})()
