(function(){
'use strict';
angular.module('sreizaoApp').controller('AuctionListingCtrl',AuctionListingCtrl);

function AuctionListingCtrl($scope,Modal,Auth,AuctionSvc,UtilSvc) {
 var vm = this;
 vm.auctions = [];
 vm.master = false;

 //pagination variables
  var prevPage = 0;
  vm.itemsPerPage = 50;
  vm.currentPage = 1;
  vm.totalItems = 0;
  vm.maxSize = 6;
  var first_id = null;
  var last_id = null;
   vm.searchStr = "";

  vm.fireCommand = fireCommand;

 $scope.auctionStatuses = auctionStatuses;
 $scope.valuationStatuses = valuationStatuses;
 vm.updateSelection = updateSelection;
 vm.exportExcel = exportExcel;
 vm.updateStatus = updateStatus;
 var selectedIds = [];

 var initFilter = {};

 function init(){
 	Auth.isLoggedInAsync(function(loggedIn){
 		if(loggedIn){
 			var filter = {};
 			if(!Auth.isAdmin())
 				initFilter['userId'] = Auth.getCurrentUser()._id;
        angular.copy(initFilter,filter);
 				getAuctions(filter);
 		}
 	})
 }
 
 init();
 function getAuctions(filter){

  filter.pagination = true;
  filter.prevPage = prevPage;
  filter.currentPage = vm.currentPage;
  filter.first_id = first_id;
  filter.last_id = last_id;
  filter.itemsPerPage = vm.itemsPerPage;

  AuctionSvc.getOnFilter(filter)
 	.then(function(result){
 		vm.auctions = result.items;
    vm.totalItems = result.totalItems;
    prevPage = vm.currentPage;
    if(result.items.length > 0){
       first_id = result.items[0]._id;
        last_id = result.items[result.items.length - 1]._id;
    }
 	})

 }

 function fireCommand(reset){
    if(reset)
      resetPagination();
    var filter = {};
    angular.copy(initFilter,filter);
    if(vm.searchStr)
      filter['searchStr'] = vm.searchStr; 
    getAuctions(filter);
 }

 function resetPagination(){
     prevPage = 0;
     vm.currentPage = 1;
     vm.totalItems = 0;
     first_id = null;
     last_id = null;
  }

  function exportExcel(){
        var dataToSend ={};
        if(Auth.getCurrentUser()._id && Auth.getCurrentUser().role != 'admin') 
        dataToSend["userid"] = Auth.getCurrentUser()._id;
    	if(!vm.master && selectedIds.length == 0){
    		Modal.alert("Please select auction to export.");
    		return;
    	}
    	if(!vm.master)
    		dataToSend['ids'] = selectedIds;
        AuctionSvc.export(dataToSend)
        .then(function(buffData){
          saveAs(new Blob([s2ab(buffData)],{type:"application/octet-stream"}), "auctions_"+ new Date().getTime() +".xlsx")
        });
    }

  function updateSelection(event,id){
  		if(vm.master)
  			vm.master = false;
        var checkbox = event.target;
        var action = checkbox.checked?'add':'remove';
        if(action == 'add' && selectedIds.indexOf(id) == -1)
          selectedIds.push(id)
        if(action == 'remove' && selectedIds.indexOf(id) != -1)
          selectedIds.splice(selectedIds.indexOf(id),1);
    }

    function updateStatus(auctionReq,status){
      if(!status)
        return;
      AuctionSvc.updateStatus(auctionReq,status)
      .then(function(result){
        AuctionSvc.sendNotification(auctionReq,UtilSvc.getStatusOnCode(auctionStatuses,status).notificationText,2);
      });
    }
}

})();
