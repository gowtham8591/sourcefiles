/* global angular, _ */

'use strict';

angular.module('vkApp')
.controller('repairDetail', function (
		$log,
		$scope,
		$rootScope,
		$routeParams,
		$state,
		$modal,
		$location,
		ValveMetadataByRepair,
		ValveDetail,
		RepairDetail,
		RepairDetailForm,
		RepairDefaultHeaderForm,
		RepairDefaultDetailForm,
		RepairDefaultDetailData,
		RepairDefaultHeaderData,
		ValveTypes,
		ValveSubtypes,
		ServiceTypes,
		PartsByRepairId,
		WeldsByRepairId,
		AddParts,
		AddWelds,
		UpdateWelds,
		UserList,
		WorkPerformed,
		Recommendation,
		WeldCondition,
		WeldProceudre,
		WeldRodHeat,
		Material,
		InternalParts,
		PlantsByOwner,
		RepairMetadata
) {


	$scope.showIcons=function() {
		return $scope.id&&$scope.valid&&$scope.showEditMode();
	}

	$scope.showButtons=function() {
		return $scope.hasEdit===true &&$scope.showEditMode();
	}
	
	$scope.showEditMode =  function() {
		return !$rootScope.customerRole;
	}
	
 	$scope.edit = function(type){
		$scope.hasEdit = true;
		$scope.hasNonFormChanges = true;
		$rootScope.$broadcast('removeAllUserMessages');
		console.log('broadcasted remove all');
	}

 	$scope.editNonForm = function(type){
		$scope.hasNonFormChanges = true;
		$rootScope.$broadcast('removeAllUserMessages');
		console.log('broadcasted remove all');
	}
 	
	$scope.getHeaderSectionTemplateUrl = function(){
		return 'partials/detail/header_section.html';
	};

	$scope.getHeaderLayoutTemplateUrl = function(){
		var layout = $scope.headerLayoutInfo && ($scope.headerLayoutInfo) ? $scope.headerLayoutInfo+"_HEADER" : "ONE_COL_HEADER";
		layout = layout.toUpperCase();
		return 'partials/detail/'+layout+'.html';
	};


	$scope.clearData = function() {
		$scope.data = {} ;
		$scope.forms ={};
		$scope.currentTab={};
		$scope.data.detail= {}; 
		$scope.data.headersections={};
		$scope.data.metadata = {};
		$scope.data.metadata.header = {};
		//$scope.valveSubtypes={};
		$scope.forms.detail ={};
		$scope.currentTab.sections ={}; 
		$scope.data.metadata.header.sections={};

		
	};
	
	$scope.clearDetailData = function() {
		/*$scope.data = {} ;
		$scope.forms ={};
		$scope.currentTab={};
		$scope.data.detail= {}; 
		$scope.data.headersections={};
		$scope.data.metadata = {};
		$scope.data.metadata.header = {};
		//$scope.valveSubtypes={};
		$scope.forms.detail ={};
		$scope.currentTab.sections ={}; 
		$scope.data.metadata.header.sections={}; */
		
		$scope.forms = {
		      detail: ''
		    };
		$scope.currentTab = {
		      sections: ''
		    };

		
	};
	/*$scope.clearData = function() {

		$scope.data = {
		      detail: '',
		      headersections: '',
		      metadata: {
		        header: {
		          sections: ''
		        }
		      }
		    };
		$scope.forms = {
		      detail: ''
		    };
		$scope.currentTab = {
		      sections: ''
		    };
	};*/
	
	
	$scope.getRepairFormDetails = function(type) {
	
		var serviceTypeId = $scope.data.metadata.serviceType; 
		var valveId = $scope.valveId; 
		
		$scope.valid=true;
		$scope.clearDetailData();
		console.log("Service Type Id",serviceTypeId);
		if ( serviceTypeId === undefined || serviceTypeId === null) {
			//$scope.clearDetailData();
			$scope.valid=false;
			console.log("Please select service Type Id");
		} else {
			if ( $routeParams.id) {
				$scope.valveId = $routeParams.id;
			}
			console.log("serviceTypeId:" + serviceTypeId + ",valveId= " + valveId) ;

			$scope.data.viewLoading = true;
			console.log("$scope.data.viewLoading:" , $scope.data.viewLoading );
			$scope.data.metadata= RepairDefaultDetailData.read({
				valveId: $scope.valveId, 
				serviceTypeId:$scope.data.metadata.serviceType
			}, function(data){
				$scope.data.metadata.valveType=data.valveTypeId; 
				$scope.data.metadata.valveSubtype=data.valveSubTypeId; 
				$scope.data.metadata.serviceType=data.serviceTypeId;
				$scope.valveId=data.valveId;
				$scope.data.detail = data.data;
				$scope.data.welds = data.data["WELD"] ;
				$scope.data.parts = data.data["PART"] ;
				$scope.loadInternalParts(data.valveTypeId,data.valveSubTypeId); 
				$scope.loadDefaultForms();
			},function(error) {
				$scope.data.viewLoading = false;
			});	

			
		} 

		console.log("Repair data is:" + $scope.data.detail) ;


	}
	
	$scope.cancel= function() {
		$location.path('/repair');
	}

	$scope.populateTagNumber = function(newVal) {

		$scope.datamodel;
		$scope.tagNumber;

		_.each($scope.data.metadata.header.sections, function (section) {

			_.each(section.sectionFields, function (field) {
				if (field.name === 'TAGNUMBER') {

					$scope.datamodel = field;
					$scope.data.metadata.tagNumber = $scope.data.detail[$scope.datamodel.entityName];
					console.log("Tag Number is :" + $scope.data.metadata.tagNumber);
				}
			});

		});

	};

	$scope.$on('TAGNUMBER', function(event, newVal) {
		if ( newVal !== undefined) {
			$scope.populateTagNumber(newVal);

		}

	});


	// initialize the form validation object
	$scope.form = {
			'metaform': {
				'repairdetails':''
			}
	};

	/**
	 * selectTab
	 * This function sets $scope.currentTab to the tab with the given id.
	 * It's used to set the 'selected' state of the tab, and to determine
	 * which template to use for the detail form.
	 * @param  {string} id The ID of the tab
	 */
	$scope.selectTab = function (name) {
		$scope.currentTab = _.find($scope.forms.detail.formTabs, function (tab) {
			if(tab.name === name){
				$scope.selectedTabId = tab.name;
			}
			return tab.name === name;
		});
		return false;
	};

	$scope.isModified = function(){
		$scope.hasEdit = true;
	};
	$scope.partsformdata = {};
	$scope.weldsformdata = {};

	// Adding IDS to all the elements for AUTOMATION
	var allEles = document.querySelectorAll('*');
	_.each(allEles, function(ele, index){
		ele.setAttribute('id', 'repairDetails'+index);
	});
	/// End of adding IDS for Automation
	/**
	 * getMetadataTemplateUrl
	 * This function returns the url of the metadata template partial.
	 * @return {string} The relative (from index.html) path to the template
	 */
	$scope.getMetadataTemplateUrl = function(){
		return 'partials/metadata/valveNotEditable.html';
	};

	/// End of adding IDS for Automation 
	/* START --- Get Menu data for Add Part and Add Weld - By Viswa Kandi */
	$scope.iParts={},
	$scope.workper={},
	$scope.rec={},
	$scope.weldcondition={},
	$scope.weldproc={},
	$scope.weldrodheat={},
	$scope.userList = {};
	$scope.material = {};
	

	UserList.read({},
			function(json) {
		$scope.userList = json.vkMenuItem;
	}); 
	WorkPerformed.read({},
			function(json) {
		$scope.workper = json.vkMenuItem;
	});      
	Recommendation.read({},
			function(json) {
		$scope.rec = json.vkMenuItem;
	});
	WeldCondition.read({},
			function(json) {
		$scope.weldcondition = json.vkMenuItem;
	}); 
	WeldProceudre.read({},
			function(json) {
		$scope.weldproc = json.vkMenuItem;
	});  
	WeldRodHeat.read({},
			function(json) {
		$scope.weldrodheat = json.vkMenuItem;
	});
	
	Material.read({},
			function(json) {
		$scope.material = json.vkMenuItem;
	});

	/* END  --- Get Menu data for Add Part and Add Weld - By Viswa Kandi */

	$scope.$watch('weldsformdata.pretest', function(newData, oldData){
		if ( newData !== oldData && newData !== undefined) {
			if ( newData ) {
				$scope.disablePreTestPassed = false; 
				$scope.disablePreTestMethod = false; 
			} else {
				$scope.disablePreTestPassed = true; 
				$scope.disablePreTestMethod = true; 
				$scope.weldsformdata.pretestpass = null; 
				$scope.weldsformdata.pretestMethod=null;
			}
		}
	}, true);

	$scope.$watch('weldsformdata.postreptest', function(newData, oldData){
		if ( newData !== oldData && newData !== undefined) {
			if ( newData ) {
				$scope.disablePostTestPassed = false; 
				$scope.disablePostTestMethod = false; 
			} else {
				$scope.disablePostTestPassed = true; 
				$scope.disablePostTestMethod = true;
				$scope.weldsformdata.postreppass = null; 
				$scope.weldsformdata.postrepmethod=null;
				
			}
		}
	}, true);
	
	
	/**
     * Format a date
     * @param  {string} d Any date string Moment.js can understand
     * @return {string}   A human-readable date string.
     */
    $scope.formatDate = function(d){

        var validDate = moment(d).isValid();
        return validDate ? moment(d).format(scope.dateFormat || 'LL') : '';
    };
    
    /**
     * Open the datepicker
     */
    $scope.open = function() {
        $timeout(function() {
            $scope.opened = true;
        });
    };
    
    
	/**
	 * getLayoutTemplateUrl
	 * This function returns the url of the detail template partial
	 * based on the current tab.
	 * @return {string} The relative (from index.html) path to the template
	 */
	$scope.getLayoutTemplateUrl = function(){
		var layout = "ONE_COL";
		if($scope.currentTab){
			switch($scope.currentTab.description){
			case "Welds":
				layout = "WELDS";
				break;
			case "Parts":
				layout = "PARTS";
				break;
			default:
				layout = $scope.currentTab && $scope.currentTab.layoutInfo ? $scope.currentTab.layoutInfo : "ONE_COL";
			break;
			}
			layout = layout.toUpperCase();
			return 'partials/detail/' + layout + '.html';
		} else {
			return 'partials/detail/ONE_COL.html';
		}
	};
	$scope.getSectionTemplateUrl = function(){
		return 'partials/detail/section.html';
	};
	/**
	 *
	 * breakIndex
	 * Note the math here. The idea is to split sections evenly among columns.
	 * ie: If there are an even number of sections, for a two-column layout,
	 * we split halfway through the array. If there are an odd number of sections,
	 * we split at the halfway point plus one (so we have a longer first column).
	 * The math is slightly different for 3-column but the idea is the same.
	 *
	 * @param  {number} numCols The number of columns
	 * @return {number}         The number of sections in the first column.
	 *                          For subsequent columns, break at the column number times the index.
	 */
	$scope.breakIndex = function(numCols){
		var i;
		switch(numCols){
		case 2:
			if($scope.currentTab.sections.length % 2 === 1){
				i = $scope.currentTab.sections.length/2 + 1; // odd number of sections
			} else {
				i = $scope.currentTab.sections.length/2; // even number of sections
			}
			break;
		case 3:
			if($scope.currentTab.sections.length % 3 === 1){
				i = $scope.currentTab.sections.length/3 + 1;
			} else if($scope.currentTab.sections.length % 3 === 2){
				i = $scope.currentTab.sections.length/3 + 0.5;
			} else {
				i = $scope.currentTab.sections.length/3;
			}
			break;
		}
		return i;
	};
	$scope.breakHeaderIndex = function(numCols){
		var i;
		if($scope.data.headersections){
			switch(numCols){
			case 2:
				if($scope.data.headersections.length % 2 === 1){
					i = $scope.data.headersections.length/2 + 1; // odd number of sections
				} else {
					i = $scope.data.headersections.length/2; // even number of sections
				}
				break;
			case 3:
				if($scope.data.headersections.length % 3 === 1){
					i = $scope.data.headersections.length/3 + 1;
				} else if($scope.data.headersections.length % 3 === 2){
					i = $scope.data.headersections.length/3 + 0.5;
				} else {
					i = $scope.data.headersections.length/3;
				}
				break;
			}
			return i;
		}

	};
	
	$scope.loadPlants = function(newVal,valueChanged) {

		$scope.plantmodel;
		$scope.valueChanged = valueChanged ; 

		_.each($scope.data.metadata.header.sections, function (section) {

			// find the node by field name plant id

			_.each(section.sectionFields, function (field) {
				if (field.name === 'PLANT_ID') {

					$scope.plantmodel = field;
					console.log("Before Plant Id,data" , $scope.valueChanged,field.entityName,$scope.data.detail[field.entityName]);
					if ( $scope.valueChanged === true) {
						$scope.data.detail[field.entityName]=null;	
						console.log("Setting null");
					}
					console.log("After Plant Id,data" , $scope.valueChanged, field.entityName,$scope.data.detail[field.entityName]);
				}
			});

		});



		PlantsByOwner.read({
			ownerId: newVal
		}, function (plants) {


			_.each(plants, function(plant, index){
				plant['label'] = plant['location'];
				plant['value'] = plant['id'];

				$scope.plantmodel['fieldOptions'][index] = plant;
			});

		});


	};
	
	$scope.$on('OwnerChanged', function(event, newVal,oldVal) {
		console.log(" New, Old" , newVal, oldVal) ;
		if ( newVal !== undefined) {
			$scope.loadPlants(newVal,newVal!==oldVal);
		}
	});
	/**
	 * Save Changes
	 * If the repair has an ID (ie: it's not new), this service
	 * will call the Repair service's 'update' method. Otherwise
	 * it calls the 'save' method.
	 */
	$scope.save = function(){
		$log.log(' repair detail form ', $scope.form.metaform);

		$scope.valid=true;
		if ( !$scope.data.metadata.serviceType) {
			$scope.valid=false; 
			$rootScope.$broadcast('userMessage', {type: 'alert', text: 'Please select the repair service type to populate the form for creating/updating repair'}) ; 

		} else {


			//FORM MAKE VALID OR DIE
			if ($scope.form.metaform.$valid) {



				// If there's an ID, do a PUT
				if($scope.id){
					var postData = {} ;
					postData.repairId=$scope.id ; 
					postData.valveId=$scope.id ;
					postData.valveTypeId=$scope.data.metadata.valveType;
					postData.valveSubTypeId=$scope.data.metadata.valveSubtype;
					postData.serviceTypeId=$scope.data.metadata.serviceType; 
					postData.data=$scope.data.detail; 
					postData.data["WELD"] = $scope.data.welds ; 
					postData.data["PART"] = $scope.data.parts ; 
					

					$log.log('putting',postData);

					RepairDetail.update( {id:$scope.id}, postData, function(response){
						// Success!
						$log.log('RepairDetail update success', response);
						$scope.hasEdit = false;
						if(response.repairId) {
							//$scope.loadData();
							$scope.data.welds = response.data["WELD"];
							$scope.data.parts = response.data["PART"];
							
							$rootScope.$broadcast('userMessage', {type: 'alert', text: 'Repair update has been successful'});	
						}	
						$scope.form.metaform.$setPristine();
						$scope.hasNonFormChanges = false; 
					}, function(error){
						$log.error('RepairDetail update error',error);
					});
				} else {
					// There's no ID, do a POST
					$log.log('create',$scope.data.detail);
					var postData = {};
					postData.valveId = $scope.valveId;
					postData.valveTypeId = $scope.data.metadata.valveType;
					postData.valveSubTypeId = $scope.data.metadata.valveSubtype;
					postData.serviceTypeId= $scope.data.metadata.serviceType;
					postData.data = $scope.data.detail;
					postData.data["WELD"] = $scope.data.welds ; 
					postData.data["PART"] = $scope.data.parts ; 

					RepairMetadata.create(postData, function(response){

						$log.log('RepairMetadata create success', response);
						$scope.hasEdit = false;
						// If the system gives us back an id, we've successfully created a
						// new repair. Route to the page for that repair.
						//
						// TODO: what do we use in response here?
						//
						if(response.repairId) {
							$rootScope.$broadcast('userMessage', {type: 'alert', text: 'Repair create has been successful'});
							$location.path('/repair/'+response.repairId);
						}


					}, function(error){
						$log.error('RepairMetadata save error',error);
					});
				}



			} else {
				$rootScope.$broadcast('userMessage', {type: 'alert', text: 'Please enter the required fields for the selected tab'}) ; 
				$log.log(' ERROR: repair detail form not valid for submit: ', $scope.form.metaform.$error);
			}
		}
	};

	/**
	 * Load the form data from the server
	 */
	$scope.loadForms = function(){
		$scope.forms = {
				detail: RepairDetailForm.read({
					id: $routeParams.id
				}, function(form){
					for(var i=0; i < $scope.forms.detail.formTabs.length; i++){
						if($scope.forms.detail.formTabs[i].description === "header"){
							$scope.data.metadata.header = $scope.forms.detail.formTabs[i];	  
							$scope.data.headersections = $scope.forms.detail.formTabs[i].sections;
							$scope.headerLayoutInfo = $scope.forms.detail.formTabs[i].layoutInfo;
							$scope.forms.detail.formTabs.splice(i,1);
						}
					}
					// Set the selected tab to the first one
					$scope.selectTab(form.formTabs[0].name);

				})
		};
	};

	/**
	 * Load the form data from the server
	 */
	$scope.loadDefaultForms = function(){


		$scope.forms = {
				detail: RepairDefaultDetailForm.read({
					'valveType':$scope.data.metadata.valveType,
					'valveSubType':$scope.data.metadata.valveSubtype,
					'serviceType':$scope.data.metadata.serviceType,
					'excludeDetachFields':true
				}, function(repairMetadata){
					$scope.data.viewLoading = false; 
					for(var i=0; i < $scope.forms.detail.formTabs.length; i++){
						if($scope.forms.detail.formTabs[i].description === "header"){
							$scope.data.metadata.header = $scope.forms.detail.formTabs[i]
							$scope.data.headersections = $scope.forms.detail.formTabs[i].sections;
							$scope.headerLayoutInfo = $scope.forms.detail.formTabs[i].layoutInfo;
							$scope.forms.detail.formTabs.splice(i,1);
						}
					}

					// Set the selected tab to the first one
					$scope.selectTab(repairMetadata.formTabs[0].name);

				})
		};

		console.log("scope forms:" + $scope.forms);
	};
	
	
	/**
	 * Load the form data from the server
	 */
	$scope.loadDefaultHeaderForms = function(){
		$scope.data.viewLoading = true; 
		$scope.forms = {
				detail: RepairDefaultHeaderForm.read({
					'valveType':$scope.data.metadata.valveType,
					'valveSubType':$scope.data.metadata.valveSubtype,
					'formType':'REPAIR',
					'excludeDetachFields':true
				}, function(repairMetadata){
					$scope.data.viewLoading = false; 
					for(var i=0; i < $scope.forms.detail.formTabs.length; i++){
						if($scope.forms.detail.formTabs[i].description === "header"){
							$scope.data.metadata.header = $scope.forms.detail.formTabs[i]
							$scope.data.headersections = $scope.forms.detail.formTabs[i].sections;
							$scope.headerLayoutInfo = $scope.forms.detail.formTabs[i].layoutInfo;
							$scope.forms.detail.formTabs.splice(i,1);
						}
					}

					$scope.forms.detail.formTabs.splice(0,$scope.forms.detail.formTabs.length);
					// Set the selected tab to the first one
					//$scope.selectTab(repairMetadata.formTabs[0].name);


				})
		};

		console.log("scope forms:" + $scope.forms);
	};

	$scope.loadInternalParts = function(valveTypeId,valveSubTypeId) {
		
		InternalParts.read({
			'valveTypeId':valveTypeId,
			'valveSubTypeId':valveSubTypeId},
			function(json) {
				console.log("iParts is %s", json);
				$scope.iParts = json;
			});  

	}
	
	
	/**
	 * Load the valve data from the server
	 */
	$scope.loadData = function(){
		// Only get the detail data if we have an ID.
		if($scope.id){
			$scope.data.viewLoading = true; 
			$scope.data = {
					detail: RepairDetail.read({
						id: $routeParams.id
					}, function(data){
						$scope.data.viewLoading = false;
						console.log("Before data is %s", data.valveTypeId);
						$scope.data = {
								metadata:{}
						}
						
						
						console.log("After data is %s", data.valveTypeId);
						$scope.data.detail = data.data;

						$scope.valveTypes = ValveTypes.read({}, function(valveTypes){
							var valveType =  _.find(valveTypes, function(type){
								return type.id === data.valveTypeId;
							});
							$scope.data.metadata.valveType=valveType.id; 
						});

						$scope.valveSubtypes = ValveSubtypes.read({
							valveTypeId: data.valveTypeId
						}, function(subtypes){
							var valveSubtype =  _.find(subtypes, function(type){
								return type.id === data.valveSubTypeId;
							});

							$scope.data.metadata.valveSubtype=valveSubtype.id; 
						});


						console.log("Service Type Id is:" , data.serviceTypeId) ;
						$scope.serviceTypes = ServiceTypes.read({}, function(serviceTypes){
							var serviceType =  _.find(serviceTypes, function(servicetype){
								return servicetype.id === data.serviceTypeId;
							});
							$scope.data.metadata.serviceType=serviceType.id;
						});

					
						console.log("Data detail is %s");
						console.log($scope.data.detail);
						console.log("loadData(): valve type Id:%s, Valve Sub Type :%s", $scope.data.metadata.valveType,$scope.data.metadata.valveSubtype);
						$scope.loadInternalParts(data.valveTypeId,data.valveSubTypeId); 
						
						$scope.data.welds = data.data["WELD"] ; 
						$scope.data.parts = data.data["PART"] ;
						console.log("Welds is %s", $scope.data.welds ); 
						console.log("Parts is %s", $scope.data.parts ); 
						
						
						$scope.valveId=$routeParams.valveId; 

						$scope.loadForms();
						$scope.hasEdit = false;
					})
			}


		}
		// If we just got the data, the user hasn't changed anything yet,
		// so we shouldn't be in edit mode.
		$scope.hasEdit = false;
	};

	/**
	 * Load the valve data from the server
	 */

	$scope.loadDefaultData = function() {


		
		// Success!
		// Get the valve types and then pull the type name based on data.valveType.
		$scope.valveTypes = ValveTypes.read({}, function(valveTypes){
			var valveType =  _.find(valveTypes, function(type){
				return type.id === $routeParams.valveTypeId;
			});
			$scope.data.metadata.valveType=valveType.id; 
		});
		// Get the valve subtypes and then pull the subtype name based on data.valveType.
		$scope.valveSubtypes = ValveSubtypes.read({
			valveTypeId: $routeParams.valveTypeId
		}, function(subtypes){
			var valveSubtype =  _.find(subtypes, function(type){
				return type.id === $routeParams.valveSubtypeId;
			});
			$scope.data.metadata.valveSubtype=valveSubtype.id; 
		});

		console.log("Valve Type Id:%s, Valve SubType Id:%s", $routeParams.valveTypeId,$routeParams.valveSubtypeId);
		
		$scope.serviceTypes = ServiceTypes.read({});

		$scope.valveId=$routeParams.valveId; 

		$scope.data.viewLoading = true; 
		RepairDefaultHeaderData.read({
			valveId: $routeParams.valveId
		}, function(data){
			$scope.data.metadata.valveType=data.valveTypeId; 
			$scope.data.metadata.valveSubtype=data.valveSubTypeId; 
			$scope.valveId=data.valveId;
			$scope.data.detail = data.data;
			//$scope.loadDefaultForms();
			$scope.loadDefaultHeaderForms();
		});	
		
		// If we just got the data, the user hasn't changed anything yet,
		// so we shouldn't be in edit mode.
		$scope.hasEdit = false;

	};


	// ================================================
	// INITIALIZATION
	$scope.id = $routeParams.id || false;
	$scope.valid=true;
	$scope.data = {
			metadata: {
			} 
	};
	$scope.data.welds=[{}];
	$scope.weldsformdata ={} ;
	$scope.data.metadata.header={};
	$scope.disableValveSubType=true;
	$scope.disableValveType=true;
	$scope.disableServiceType=false;
	$scope.disablePreTestPassed = true; 
	$scope.disablePreTestMethod = true; 
	$scope.disablePostTestPassed = true; 
	$scope.disablePostTestMethod = true;
	$scope.hasNonFormChanges;
	//$scope.enableServiceTypeWatch=true;
	if($scope.id){
		// For an existing valve, load the data & forms
		$scope.serviceTypes = ServiceTypes.read({});
		$scope.loadData();
		$scope.disableServiceType=true;
		$scope.hasEdit=false;
		$scope.hasNonFormChanges = false;
	} else {
		// For a new valve, empty data, but we'll need to get the valve types & subtypes
		$scope.data = {
				metadata: {
				}
		};	
		$scope.loadDefaultData();
		$scope.hasEdit = true;
	}

	console.log("has Edit:",$scope.hasEdit);
	$scope.$on('hasEdit', function(){
		console.log("Inside on hasEdit");
		 $rootScope.$broadcast('removeAllUserMessages');
		$scope.hasEdit = true;
	});
	$scope.$watch('data', function(newData, oldData){
		// $log.log('data changed',newData);
	}, true);

	$scope.AddParts = function(partsformdata){
		partsformdata.valveId = $routeParams.id;
		AddParts.create(partsformdata, function (json) {
			if(!$scope.isEditPart){
				$scope.data.parts = json.response.result;
			}
		});
	};

	/*$scope.AddWelds = function(weldsformdata){
		AddWelds.create({'id':$routeParams.id },weldsformdata, function (json) {
			$scope.data.welds.push(json.response.result)
		});
	};
	
	$scope.UpdateWelds = function(weldsformdata){
		UpdateWelds.update({'id':$routeParams.id , 'weldId':weldsformdata.id},weldsformdata, function (json) {
			//$scope.data.welds.push(json.response.result)
		});
	}; */
	
	$scope.openEditWeldModel = function(e, row){
		e.preventDefault();
		$scope.editNonForm(); 
		$scope.weldsformdata = row;
		$scope.isEditPart = true;
		$scope.title="Edit Weld";
		$scope.weldsformdata.id = row.id;
		var modalInstance = $modal.open({
			controller: 'addWelds',
			templateUrl: '/VKWebApp/partials/addwelds.html',
			backdrop: 'static',
			scope: $scope,
			resolve: {
				weldsformdata: function () {
					return $scope.weldsformdata
				}
			}   
		}); 
		modalInstance.result.then(function (response) {
			//$scope.UpdateWelds(response);
		}); 
	}
	$scope.openEditPartModel = function(e, row){
		$scope.editNonForm(); 
		e.preventDefault();

		$scope.partsformdata = row;
		$scope.isEditWeld = true;
		$scope.title="Edit Part";
		$scope.partsformdata.id = row.id;
		var modalInstance = $modal.open({
			controller: 'addParts',
			templateUrl: '/VKWebApp/partials/addparts.html',
			backdrop: 'static',
			scope: $scope,
			resolve: {
				partsformdata: function () {
					return $scope.partsformdata
				}
			}   
		}); 
		modalInstance.result.then(function (response) {
			//$scope.AddParts(response);
		}); 
	}
	$scope.showAddParts = function(){
		$scope.editNonForm(); 
		$scope.title="Add Part";
		$scope.isEditPart = false;
		$scope.partsformdata ={};
		var modalInstance = $modal.open({
			controller: 'addParts',
			templateUrl: '/VKWebApp/partials/addparts.html',
			backdrop: 'static',
			scope: $scope,
			resolve: {
				partsformdata: function () {
					return $scope.partsformdata
				}
			}   
		}); 
		modalInstance.result.then(function (response) {
			//$scope.AddParts(response);
			$scope.data.parts.push(response);
		}); 
	}
	$scope.showAddWelds = function(){
		$scope.editNonForm(); 
		$scope.title="Add Welds";
		$scope.isEditPart = false;
		//$scope.partsformdata.ID = "";
		$scope.weldsformdata ={};
		var modalInstance = $modal.open({
			controller: 'addWelds',
			templateUrl: '/VKWebApp/partials/addwelds.html',
			backdrop: 'static',
			scope: $scope,
			resolve: {
				weldsformdata: function () {
					return $scope.weldsformdata
				}
			}   
		}); 
		modalInstance.result.then(function (response) {
			//scope.AddWelds(response);
			$scope.data.welds.push(response);
		}); 
	}
	
	/*$scope.$watch('weldsformdata.welded', function(newValue,oldValue) {
		var arr = String(newValue).split("");
        if (arr.length === 0) return ;
        if (arr.length === 1 && (arr[0] == '-' || arr[0] === '.' )) return ;
        if (arr.length === 2 && newValue === '-.') return ;
        if (isNaN(newValue)) {
        	if (isNaN(oldValue)) {
        		 $scope.weldsformdata.welded =  '';
        	} else {
        		 $scope.weldsformdata.welded = oldValue;
        	}
            
        }
     },true);
	$scope.$watch('weldsformdata.ground', function(newValue,oldValue) {
		var arr = String(newValue).split("");
        if (arr.length === 0) return ;
        if (arr.length === 1 && (arr[0] == '-' || arr[0] === '.' )) return ;
        if (arr.length === 2 && newValue === '-.') return ;
        if (isNaN(newValue)) {
        	if (isNaN(oldValue)) {
        		$scope.weldsformdata.ground =  '';
        	} else {
        		$scope.weldsformdata.ground = oldValue;
        	}
            
        }
		//$scope.weldsformdata.ground = $scope.validateNumber(newValue,oldValue); 
    },true);
	$scope.$watch('weldsformdata.depth', function(newValue,oldValue) {
		var arr = String(newValue).split("");
        if (arr.length === 0) return ;
        if (arr.length === 1 && (arr[0] == '-' || arr[0] === '.' )) return ;
        if (arr.length === 2 && newValue === '-.') return ;
        if (isNaN(newValue)) {
        	if (isNaN(oldValue)) {
        		$scope.weldsformdata.depth =  '';
        	} else {
        		$scope.weldsformdata.depth = oldValue;
        	}
            
        }
		//$scope.weldsformdata.depth = $scope.validateNumber(newValue,oldValue); 
    });
	$scope.$watch('weldsformdata.length', function(newValue,oldValue) {
		var arr = String(newValue).split("");
        if (arr.length === 0) return ;
        if (arr.length === 1 && (arr[0] == '-' || arr[0] === '.' )) return ;
        if (arr.length === 2 && newValue === '-.') return ;
        if (isNaN(newValue)) {
        	if (isNaN(oldValue)) {
        		$scope.weldsformdata.length =  '';
        	} else {
        		$scope.weldsformdata.length = oldValue;
        	}
            
        }
        //$scope.weldsformdata.length = $scope.validateNumber(newValue,oldValue); 
    });
	$scope.$watch('partsformdata.quantity', function(newValue,oldValue) {
		var arr = String(newValue).split("");
        if (arr.length === 0) return ;
        if (arr.length === 1 && (arr[0] == '-' || arr[0] === '.' )) return ;
        if (arr.length === 2 && newValue === '-.') return ;
        if (isNaN(newValue)) {
        	if (isNaN(oldValue)) {
        		$scope.partsformdata.quantity =  '';
        	} else {
        		$scope.partsformdata.quantity = oldValue;
        	}
            
        }
    });
	$scope.$watch('partsformdata.cost', function(newValue,oldValue) {
		var arr = String(newValue).split("");
        if (arr.length === 0) return ;
        if (arr.length === 1 && (arr[0] == '-' || arr[0] === '.' )) return ;
        if (arr.length === 2 && newValue === '-.') return ;
        if (isNaN(newValue)) {
        	if (isNaN(oldValue)) {
        		 $scope.partsformdata.cost =  '';
        	} else {
        		 $scope.partsformdata.cost = oldValue;
        	}
            
        }
        //$scope.partsformdata.cost= $scope.validateNumber(newValue,oldValue); 
    });
	$scope.$watch('partsformdata.extendedCost', function(newValue,oldValue) {
		var arr = String(newValue).split("");
        if (arr.length === 0) return ;
        if (arr.length === 1 && (arr[0] == '-' || arr[0] === '.' )) return ;
        if (arr.length === 2 && newValue === '-.') return ;
        if (isNaN(newValue)) {
        	if (isNaN(oldValue)) {
        		$scope.partsformdata.extendedCost =  '';
        	} else {
        		$scope.partsformdata.extendedCost = oldValue;
        	}
            
        }
        //$scope.partsformdata.extendedCost= $scope.validateNumber(newValue,oldValue); 
    });
	$scope.$watch('partsformdata.price', function(newValue,oldValue) {
		var arr = String(newValue).split("");
        if (arr.length === 0) return ;
        if (arr.length === 1 && (arr[0] == '-' || arr[0] === '.' )) return ;
        if (arr.length === 2 && newValue === '-.') return ;
        if (isNaN(newValue)) {
        	if (isNaN(oldValue)) {
        		 $scope.partsformdata.price =  '';
        	} else {
        		 $scope.partsformdata.price = oldValue;
        	}
            
        }
        //$scope.partsformdata.price= $scope.validateNumber(newValue,oldValue); 
    });
	$scope.$watch('partsformdata.extendedPrice', function(newValue,oldValue) {
		var arr = String(newValue).split("");
        if (arr.length === 0) return ;
        if (arr.length === 1 && (arr[0] == '-' || arr[0] === '.' )) return ;
        if (arr.length === 2 && newValue === '-.') return ;
        if (isNaN(newValue)) {
        	if (isNaN(oldValue)) {
        		$scope.partsformdata.extendedPrice =  '';
        	} else {
        		$scope.partsformdata.extendedPrice = oldValue;
        	}
            
        }
        //$scope.partsformdata.extendedPrice= $scope.validateNumber(newValue,oldValue); 
    });

	
	$scope.validateNumber = function(newValue, oldValue) {
		console.log('newVale is:' , newValue) ;
		console.log('oldVale:' , oldValue);
		
		var arr = String(newValue).split("");
        if (arr.length === 0) return '';
        if (arr.length === 1 && (arr[0] == '-' || arr[0] === '.' )) return '';
        if (arr.length === 2 && newValue === '-.') return '';
        if (isNaN(newValue)) {
        	if (isNaN(oldValue)) {
        		return '';
        	} else {
        		return oldValue;
        	}
            
        }
	} ; */
}).controller('addParts', function ($scope, $modalInstance) {
	// Get the InternalParts for a valve type and valve sub type

	$scope.savePart = function (partsformdata) {
		$modalInstance.close(partsformdata);
	};
	/*$scope.ok = function() {
		$modalInstance.dismiss();
	};*/
	
	$scope.ok = function(partsformdata) {
		console.log("Inside add parts:" , partsformdata) ;
		$modalInstance.close(partsformdata);
	};
	$scope.close = function() {
		$modalInstance.dismiss();
	};
}).controller('addWelds', function ($scope, $modalInstance) {
	// Get the InternalParts for a valve type and valve sub type

	$scope.saveWelds = function (weldsformdata) {
		$modalInstance.close(weldsformdata);
	};
	$scope.ok = function(weldsformdata) {
		console.log("Inside add welds:" , weldsformdata) ;
		$modalInstance.close(weldsformdata);
	};
	$scope.close = function() {
		$modalInstance.dismiss();
	};
});

