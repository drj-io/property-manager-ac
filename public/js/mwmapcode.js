var oldValue = "";
var map;
 var geocoder;
var mymarkers = new Array();
var mycircle;				

function codeAddress() {
    var address = document.getElementById("goto").value;
    geocoder.geocode( { 'address': address}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
   	getMarkersLatLng(results[0].geometry.location.lat(),results[0].geometry.location.lng());
   	/*
        map.setCenter(results[0].geometry.location);
        var marker = new google.maps.Marker({
            map: map,
            position: results[0].geometry.location
        });
	*/
      } else {
        alert("Geocode was not successful for the following reason: " + status);
      }
    });
  }


var formatNumber = function(num) {
    var array = num.toString().split('');
    var index = -3;
    while (array.length + index > 0) {
        array.splice(index, 0, ',');
        // Decrement by 4 since we just added another unit to the array.
        index -= 4;
    }
    return array.join('');
};

function precise_round(value, decPlaces){
    var val = value * Math.pow(10, decPlaces);
    var fraction = (Math.round((val-parseInt(val))*10)/10);

    //this line is for consistency with .NET Decimal.Round behavior
    // -342.055 => -342.06
    if(fraction == -0.5) fraction = -0.6;
    val = Math.round(parseInt(val) + fraction) / Math.pow(10, decPlaces);
    return val;
}


function CreateTable(dataa)
{
    var tablecontents = "";
    tablecontents = '<table id="pattern-style-a"><tr><td nowrap="nowrap">Distance (miles)</td><td>Location</td><td>Population</td></tr>';
  //tablecontents = '<table id="pattern-style-a"><tr><td>Location</td><td>Population</td></tr>';
   var totdata = dataa.split(',');
     var sum = 0;
    for (var key in totdata)
   {
 	var fielddata = totdata[key].split('-');
	var s = fielddata[1]+', '+fielddata[2]+'  '+fielddata[3]+'  '+fielddata[0];
	tablecontents += '<tr>';
	//tablecontents += '<td nowrap="nowrap"><center>' +precise_round(fielddata[5]*1.6093440006,2) + '</center></td>';
	tablecontents += '<td nowrap="nowrap"><center>' +precise_round(fielddata[5],2) + '</center></td>';	
	tablecontents += '<td style="padding-left: 30px" nowrap="nowrap">' + s + '</td>';
	tablecontents += '<td style="padding-left: 30px" nowrap="nowrap">' + formatNumber(fielddata[4]) + '</td>';
	tablecontents += '</tr>';
	if (!isNaN(fielddata[4]))
	{
		sum = sum + parseInt(fielddata[4],10);
	}
   }
   tablecontents += '</table>';
   document.getElementById("output").innerHTML = document.getElementById("output").innerHTML+'</br></br><h3> Total Population Within Radius: '+formatNumber(sum)+'</h3>';
   document.getElementById("tablespace").innerHTML = tablecontents;
}

				
function getLatLng()
{
	if (mymarkers != null)
	{
		for (var cc=0;cc < mymarkers.length;cc++) {
			mymarkers[cc].setMap(null);
		}			
	}
	if (mycircle != null)
		mycircle.setMap(null);
	// mile conversion  * 1.609344	
			
	if (isNaN(document.getElementById("goto").value) && document.getElementById("goto").value.length != 5)
	{
		codeAddress();
		return;
	}
	$.ajax({
		type: "GET",
		url: "/population-map/ajax/getlatlng.php",
		data: { zip: document.getElementById("goto").value }
	})
	.done(function( msg ) {
		if (msg =="") {
			alert("The zip code "+document.getElementById("goto").value+" isn't in our database. Contact Doug Lewis.")	;
		}
		else {
				var fielddata = msg.split('|');
				var markers;
				var cnt = 0;
				$.ajax({
					type: "GET",
					dataType: 'xml',					
					url: "/population-map/ajax/get-all-zip-codes-inside.php",
					data: { radius: document.getElementById("tb_radius_miles").value, lat: fielddata[0], lng: fielddata[1] }
				})
				.done(function( msg ) {	
				        var sq = "";
					markers = msg.getElementsByTagName("marker");
 				       var latlngbounds = new google.maps.LatLngBounds();
				       for (var i = 0; i < markers.length; i++) {
				          var name = markers[i].getAttribute("zipcode");
					 if (sq == "")
						sq = name;
					else
						 sq = sq +","+name;
 					var fielddatagg = name.split('-');
					var sgg = fielddatagg[1]+', '+fielddatagg[2]+'  '+fielddatagg[3]+'  '+fielddatagg[0]+'  {Population '+fielddatagg[4]+'}';						
				          var xpoint = new google.maps.LatLng(
				              parseFloat(markers[i].getAttribute("lat")),
				              parseFloat(markers[i].getAttribute("lng")));
					  latlngbounds.extend(xpoint);
				   	   if (parseFloat(fielddata[0]) != parseFloat(markers[i].getAttribute("lat")) &&  
					       parseFloat(fielddata[1]) != parseFloat(markers[i].getAttribute("lng")))
					 	{
						          var xmarker = new google.maps.Marker({
						            map: map,
						            position: xpoint,
		  					    title: sgg,
						            icon: "/population-map/images/markers/freemaptools.png"
						          });							
						}
						else
						{
						          var xmarker = new google.maps.Marker({
						            map: map,
						            position: xpoint,
					    		    title: name,
						            icon: "/population-map/images/markers/red.png"
						          });														
						}
						mymarkers[cnt] = xmarker;					
						cnt++;
					}
					var viewpoint = new google.maps.LatLng(parseFloat(fielddata[0]),parseFloat(fielddata[1]));							
					mycircle = new google.maps.Circle({
					center: viewpoint,
					radius: parseFloat(document.getElementById("tb_radius_miles").value) * 1609.3, //convert miles to meters
					strokeColor: "#fc2803",
					strokeOpacity: 0.6,
					strokeWeight: 2,
					fillColor: "#778888",
					fillOpacity: 0.3
					});          
   				mycircle.setMap(map);  			
				map.fitBounds(mycircle.getBounds());
				document.getElementById("output").innerHTML = "Done ("+markers.length+" found)";
				CreateTable(sq);
			});	
		}
	});	
}

function getMarkersLatLng(latitude,longitude)
{
	if (mymarkers != null)
	{
		for (var cc=0;cc < mymarkers.length;cc++) {
			mymarkers[cc].setMap(null);
		}			
	}
	if (mycircle != null)
		mycircle.setMap(null);
		// mile conversion * 1.609344
		var markers;
		var cnt = 0;
		$.ajax({
			type: "GET",
			dataType: 'xml',					
			url: "/population-map/ajax/get-all-zip-codes-inside.php",
			data: { radius: document.getElementById("tb_radius_miles").value , lat: latitude, lng: longitude }
		})
		.done(function( msg ) {	
		        var sq = "";
			markers = msg.getElementsByTagName("marker");
	      		 var latlngbounds = new google.maps.LatLngBounds();
		       for (var i = 0; i < markers.length; i++) {
		          var name = markers[i].getAttribute("zipcode");
			 if (sq == "")
				sq = name;
			else
				 sq = sq +","+name;
			var fielddatagg = name.split('-');
			var sgg = fielddatagg[1]+', '+fielddatagg[2]+'  '+fielddatagg[3]+'  '+fielddatagg[0]+'  {Population '+fielddatagg[4]+'}';	
			var xpoint = new google.maps.LatLng(
		              parseFloat(markers[i].getAttribute("lat")),
		              parseFloat(markers[i].getAttribute("lng")));
			  latlngbounds.extend(xpoint);
		   	   if (parseFloat(latitude) != parseFloat(markers[i].getAttribute("lat")) &&  
			       parseFloat(longitude) != parseFloat(markers[i].getAttribute("lng")))
			 	{
				          var xmarker = new google.maps.Marker({
				            map: map,
				            position: xpoint,
					    title: sgg,
				            icon: "/population-map/images/markers/freemaptools.png"
				          });							
				}
				else
				{
				          var xmarker = new google.maps.Marker({
				            map: map,
				            position: xpoint,
					    title: name,					  
				            icon: "/population-map/images/markers/red.png"
				          });														
				}
				mymarkers[cnt] = xmarker;					
				cnt++;
			}
			var viewpoint = new google.maps.LatLng(parseFloat(latitude),parseFloat(longitude));							
			mycircle = new google.maps.Circle({
			center: viewpoint,
			radius: parseFloat(document.getElementById("tb_radius_miles").value) * 1609.3, //convert miles to meters
			strokeColor: "#fc2803",
			strokeOpacity: 0.6,
			strokeWeight: 2,
			fillColor: "#778888",
			fillOpacity: 0.3
			});          
		mycircle.setMap(map);  			
		map.fitBounds(mycircle.getBounds());
		document.getElementById("output").innerHTML = "Done ("+markers.length+" found)";
		CreateTable(sq);
	});	
}


function getXmlString(xml) {
  if (window.ActiveXObject) { return xml.xml; }
  return new XMLSerializer().serializeToString(xml);
}


 function resetpage() 
{
	document.getElementById("tb_radius_miles").value = "100";
	document.getElementById("tablespace").innerHTML = "";
	document.getElementById("output").innerHTML = "";
	document.getElementById("goto").value = "";
	if (mymarkers != null)
	{
		for (var cc=0;cc < mymarkers.length;cc++) {
			mymarkers[cc].setMap(null);
	}			
	}
	if (mycircle != null)
		mycircle.setMap(null);	
      var mapOptions = {
          center: new google.maps.LatLng(40.372134, -105.1960795),
          zoom: 4,
	 mapTypeId:google.maps.MapTypeId.ROADMAP
        };
	map.setOptions(mapOptions);
}

function mouseDown(event)
{
      getMarkersLatLng(event.latLng.lat(),event.latLng.lng());
}

function activate(e, message)
{   
    if (isNotEnter(e))
    {   
        return true;
    }   
    else // ie. enter was pressed
    {   
        // only proceed to search() if message is not empty
        if (message.length >= 5)
        {   
            getLatLng();
        }   
        return false;
    }   
}



function isNotEnter(e)
{   
    if (e.keyCode == 13) 
    {   
        return false;
    }   
    else
    {   
        return true;
    }   
}


 function initialize() 
{
	geocoder = new google.maps.Geocoder();
        var mapOptions = {
          center: new google.maps.LatLng(40.372134, -105.1960795),
          zoom: 4,
	 mapTypeId:google.maps.MapTypeId.ROADMAP
        };
        map = new google.maps.Map(document.getElementById("map_canvas"),
            mapOptions);
	  map.setOptions({draggableCursor:'crosshair'});
	google.maps.event.addListener(map,'click',function(event) {mouseDown(event);});	  
}
      


