var weatherApp = angular.module('weatherApp', []);
var globalSetting = [];
weatherApp.config(['$routeProvider',function($routeProvider) {
	$routeProvider.
    when('/', {
        templateUrl: 'static/lib/templates/index.html',
        controller: 'weatherCtrl'
    }).
    otherwise({
        redirectTo: '/'
    });
}]);
var weatherCtrll = weatherApp.controller('weatherCtrl',function($scope, $location, $rootScope,$http){
	$scope.futureCity = "";
	$scope.showToday = true;
		 
	//savesetting function is called on click of save button in the pop up window(Modal) 
	$scope.updatesettings = function(setting){	       
		var settings = localStorage.settings;
		settings = settings ? JSON.parse(settings) : [];
		var nextID = settings.length;
		setting.id = nextID;
		settings.push(setting);
		globalSetting = settings;
		localStorage.settings = JSON.stringify(settings);
		$('#myModal').modal('hide');
		$('#settings-form').get(0).reset();
		$scope.changeLocationDropDowns();			        
	};
			 
	//close function is called on cllick of close butoon in the pop up window(Modal)		 
	$scope.closeSettingsModal = function(){
		$('#settings-form').get(0).reset();
	};
	
	//this function is called on change of option of select box
	$scope.changeLocationDropDowns = function(){
		var todayOptions="<option value='current'>current</option>", futureOptions="<option value='current'>current</option>";

		for(i=0;i<globalSetting.length;i++){
			var units = (globalSetting[i].unit === "metric") ? "Degree" : "Faren"
			todayOptions+="<option value='"+globalSetting[i].id+"'>"+globalSetting[i].location+"</option>"
			futureOptions+="<option value='"+globalSetting[i].id+"'>"+globalSetting[i].location+", "+globalSetting[i].range+" days in "+units+" "+"</option>"
		}
		$('#todayLocation').empty();
		$('#todayLocation').html(todayOptions);
		
		$('#futureLocation').empty();
		$('#futureLocation').html(futureOptions);
	};
	
	//this function is called when an option for today select box has been changed
	$scope.getTodayLocation=function(data){
		//alert("todayLocation");
		var city="";
		var metric="";
		if(data==="---" ||data=="current")
			city = data;
		else{
			var selectedVal = parseInt(data);
			city = globalSetting[selectedVal].location;
			metric = globalSetting[selectedVal].unit
		}
		
		if(city === "---"){}
		
		else if(city === "current"){
			$scope.WeatherApp.CallAPIForCurrentLocation($scope.WeatherApp.Location.latitude,$scope.WeatherApp.Location.longitude,function(data){
				$('#currentIcon').html('<img src="http://openweathermap.org/img/w/'+data.weather[0].icon+'.png" />');
				$('#currentCity').html(data.name);
				$('#currentWeather').html(data.weather[0].description);
				$('#currentTemp').html(data.main.temp);
				$('#currentTempMax').html(data.main.temp_max);
				$('#currentTempMin').html(data.main.temp_min);
			});
		}
		else{
			$scope.WeatherApp.CallAPIForCurrentCity(city,metric,function(data){
				$('#currentIcon').html('<img src="http://openweathermap.org/img/w/'+data.weather[0].icon+'.png" />');
				$('#currentCity').html(data.name);
				$('#currentWeather').html(data.weather[0].description);
				$('#currentTemp').html(data.main.temp);
				$('#currentTempMax').html(data.main.temp_max);
				$('#currentTempMin').html(data.main.temp_min);
			});
		}
	};
	
	//this function is called when an option for futureforecast  select box has been changed
	$scope.getFutureLocation=function(GetForeCast){
		var city="";
		var metric="";
		var day="";
		if(GetForeCast==="---" || GetForeCast=="current")
			city = GetForeCast;
		else{
			var selectedVal = parseInt(GetForeCast);
			city = globalSetting[selectedVal].location;
			metric = globalSetting[selectedVal].unit;
			day = globalSetting[selectedVal].range;
		}
		
		if(city === "---"){}
		
		
		if(city === "---") { /* Do nothing */ }
		else if(city == "current"){			
			$scope.WeatherApp.CallAPIForFutureLocation($scope.WeatherApp.Location.latitude,$scope.WeatherApp.Location.longitude,15,function(data){				
				fillForcastTable(data);			
			});
			$scope.futureCity = "("+city+")";
		}
		else{
			$scope.WeatherApp.CallAPIForFutureCity(city,metric,day,function(data){
				fillForcastTable(data);
				
			});
			$scope.futureCity = "("+city+")";
		}
		var settings = localStorage.settings;
		settings = settings ? JSON.parse(settings) : [];
		globalSetting = settings;

		$scope.changeLocationDropDowns();
	};

	var fillForcastTable = function(data){
		$("#ForecastTable tbody").empty();
		
		$("#TemperatureUnit").val() == "C" ? ConvertNecessary = true   : ConvertNecessary = false;
			 
				
		$( data.list ).each(function( index ) {
			var daydata = this;			
			var DateObj = new Date(daydata.dt*1000)
			var row = "<tr>";
			row +="<td><img src='http://openweathermap.org/img/w/"+daydata.weather[0].icon+".png' /></td>"
			row +="<td>"+DateObj.toDateString()+"</td>";
			row +="<td>"+daydata.weather[0].description+"</td>";
			row +="<td>"+daydata.temp.day+"</td>";
			row +="<td>"+daydata.temp.max+"</td>";
			row +="<td>"+daydata.temp.min+"</td>";
			row += "</tr>";
			$("#ForecastTable tbody").append(row)
	    });
	};
		
	//weatherapi definition starts from here
	$scope.WeatherApp = (function (w, Ext) {

	    var $ = w.jQuery
	    var Core ={ }  
	    

	    
	    Ext.Location = {};

	    
	    Core.GetCurrentLocation = function() {
	    	
	    	
	    	var options = {
	    	  enableHighAccuracy: true,
			  timeout: 5000,
			  maximumAge: 0
			};

			function success(pos) {
			  var crd = pos.coords;
			  Ext.Location.latitude = crd.latitude;
			  Ext.Location.longitude = crd.longitude;
			  console.log('Your current position is:');
			  console.log('Latitude : ' + Ext.Location.latitude);
			  console.log('Longitude: ' + Ext.Location.longitude);
			  console.log('More or less ' + crd.accuracy + ' meters.');
			  $scope.getTodayLocation("current");
			  
			};

			function error(err) {
			  console.warn('ERROR(' + err.code + '): ' + err.message);
			};
			if (navigator.geolocation) {
	              navigator.geolocation.getCurrentPosition(success, error, options);
	         } else {
	           return false;
	         }
			navigator.geolocation.getCurrentPosition(success, error, options);
	    	

	    }

	    Ext.CallAPIForCurrentCity = function(city,metric,callback){
	    	 $.getJSON('http://api.openweathermap.org/data/2.5/weather?units='+metric+'&q='+(encodeURIComponent(city)), function(data) {
	        	 callback(data);
	        });
	    }
	   
	    Ext.CallAPIForCurrentLocation = function(lat,long,callback){
	       
	    	 $.getJSON('http://api.openweathermap.org/data/2.5/weather?lat='+(encodeURIComponent(lat))+'&lon=' +(encodeURIComponent(long)), function(data) {
	        	 callback(data);
	        });

	    }
	    
	    Ext.CallAPIForFutureCity = function(city,metric,day,callback){
	        $.getJSON('http://api.openweathermap.org/data/2.5/forecast/daily?units='+metric+'&cnt='+day+'&mode=json&q='+(encodeURIComponent(city)), function(data) {
	        	 callback(data);
	        });

	    }
	   
	    Ext.CallAPIForFutureLocation = function(lat,long,Days,callback){
	    	 $.getJSON('http://api.openweathermap.org/data/2.5/forecast/daily?units=metric&cnt='+Days+'&mode=json&lat='+(encodeURIComponent(lat))+'&lon=' +(encodeURIComponent(long)), function(data) {
	        	 callback(data);
	        });
	    }    
	    

	    

	    Ext.GetLocation = function() {
	    	Core.GetCurrentLocation();
	    }

	    
	    return Ext;  
	}(window,$scope.WeatherApp || {}));
	//end of weatherapi
	
	$scope.WeatherApp.GetLocation();
	

	
	
	var settings = localStorage.settings;
	settings = settings ? JSON.parse(settings) : [];
	globalSetting = settings;
	$scope.changeLocationDropDowns();

});
