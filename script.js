var marker;
var map;
var pos;
var GoogleLink;
var SelfLink;
var diDisplay;
var recognition;
async function initMap()
{
  map = await new google.maps.Map(document.getElementById("map"), 
  {
    zoom: 15,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  });
  /*fetch('http://127.0.0.1:60146/gps')
  .then((resp)=>resp.json())
  .then(function(data)
  {
    pos={
      lat: parseFloat(data[0]['lat']),
      lng: parseFloat(data[0]['lng'])
    };
    SelfLink = pos.lat + "," + pos.lng;
        map.setCenter(pos);
        Selfmarker = new google.maps.Marker({
          position: pos,
          map: map,
        });
  }) */

  const infoWindow = new google.maps.InfoWindow();
  if (navigator.geolocation) 
  {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        pos = {
          lat: parseFloat(position.coords.latitude),
          lng: parseFloat(position.coords.longitude),
        };
        SelfLink = position.coords.latitude + "," + position.coords.longitude;
        infoWindow.open(map);
        map.setCenter(pos);
        Selfmarker = new google.maps.Marker({
          position: pos,
          map: map,
        });
      },
      () => {
        handleLocationError(true, infoWindow, map.getCenter());
      }
    );
  } else 
  {
    handleLocationError(false, infoWindow, map.getCenter());
  }
  document.getElementById("btImg").disabled=true;
}
  
async function getMap()
{
  document.getElementById("btTalk").disabled=false;
  clearBt();
  Selfmarker.setMap(null);
  if(document.getElementById("tbSearch").value != "")
  {
    var name = await testname(document.getElementById("tbSearch").value);
    var url = "https://quiet-harbor-07073.herokuapp.com/getalias/"+name;
    await fetch(url)
    .then((resp)=>resp.json())
    .then(function(data)
    {
      if(data == null)
      {
        alert("Sorry We didn't find this building name in our database");
        clearmap();
      }
      else
      {
        if(data.length>1)
        {
          var btContainer = document.getElementById("btContainer");
          var h = document.createElement("h5");
          var t = document.createTextNode("Please Select Your Choice");
          h.appendChild(t);
          btContainer.appendChild(h);
          clearmap();
          btList = data.length;
          for(var i = 0;i<data.length;i++)
          {
            var button = document.createElement("button");
            button.id = "buttonlist"+(i);
            button.className = "btlist";
            button.onclick=function()
            {
              var name = document.getElementById("tbSearch");
              name.value = this.innerHTML;
              getMap();
            }
            button.innerHTML = data[i]["name"];
            var btContainer = document.getElementById("btContainer");
            btContainer.appendChild(button);
            btContainer.appendChild(document.createTextNode("\u00A0"));
          }
        }
        else
        {
          lat = JSON.stringify(data[0]["lat"]);
          lng = JSON.stringify(data[0]["lng"]);
          GoogleLink=lat+","+lng;
          gotoMap(lat,lng);
          linkmap(data[0]["name"],name);
          document.getElementById("btImg").disabled=false;
        }
      }
    });
    /*await postdata("http://127.0.0.1:60146/reset",{
      "countertime" : 0
    });*/
    window.setTimeout(clearmap,10000);
  }
  else 
  {
    alert("Please enter the building name");
    clearmap();
  }
}

function gotoMap(bdlat,bdlng)
{
  var diService = new google.maps.DirectionsService();
  if(diDisplay != null) 
  {
    diDisplay.setMap(null);
    diDisplay = null;
  }
  diDisplay = new google.maps.DirectionsRenderer();
  diDisplay.setMap(map);
  var request = 
  {
    origin: pos, 
    destination:
    {
      lat: parseFloat(bdlat),
      lng: parseFloat(bdlng)
    },
    travelMode: google.maps.DirectionsTravelMode.DRIVING
  };
  diService.route(request, function(response, status) 
  {
    if (status == google.maps.DirectionsStatus.OK) 
    {
      diDisplay.setDirections(response);
    }
  });
}

function linkmap(buildname,aliasname)
{
  var maplink="https://www.google.com/maps/dir/"+SelfLink+"/"+GoogleLink+"/@"+GoogleLink+",16z";
  document.getElementById("imgmap").src="https://api.qrserver.com/v1/create-qr-code/?data="+maplink+"&amp;size=100x100";
  document.getElementById("lbQr").innerHTML="Your Destination (Marker B): "+"<br>"+buildname+"<br>"+aliasname;
}

function clearmap()
{
  window.clearTimeout();
  document.getElementById("btImg").disabled=true;
  document.getElementById("lbQr").innerHTML="";
  document.getElementById("imgmap").src="";
  document.getElementById("tbSearch").value="";
  if(diDisplay != null) 
  {
    diDisplay.setMap(null);
    diDisplay = null;
  }
  Selfmarker = new google.maps.Marker(
  {
    position: pos,
    map: map,
  });
}

function runSpeech() {
  document.getElementById("btTalk").disabled=true;
  var output = document.getElementById("tbSearch");
  var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
  var recognition = new SpeechRecognition();
  recognition.lang = 'th-TH';
  recognition.onstart = function() 
  {
  };  
  recognition.onspeechend = function() 
  {
    recognition.stop();
  };
  recognition.onresult = function(event) 
  {
    var transcript = event.results[0][0].transcript;
    output.value = transcript;
    getMap();
  };
  recognition.start();
}

function takeshot() { 
  let div = document.getElementById("mapall");
  html2canvas(div,
    {
      proxy: "server.js",
      useCORS: true,
    }).then( 
    function (canvas) 
    {
      var dl = document.createElement("a");
      dl.href = canvas.toDataURL();
      dl.download = "imgmap";
      document.body.appendChild(dl);
      dl.click();
      document.body.removeChild(dl);
      /*postdata('http://127.0.0.1:60146/print',{
        "data" : dl.href
      })*/
      console.log("Complete");
      clearmap();
    })
     
}
async function postdata(url='',data = {})
{
  const response = await fetch(url,
  {
    method: "POST",
    mode: 'cors', 
    cache: 'no-cache', 
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json'
    },
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
    body:JSON.stringify(data)
          
  });
}

function clearBt()
{
  var btContainer = document.getElementById("btContainer");
  while(btContainer.firstChild) 
  { 
      btContainer.removeChild(btContainer.firstChild); 
  }
}

async function testname(name)
{
  var spName = name.split(" ");
  var allName="";
  var countName=-1;
  var previousLength=100;
  for(var i=0;i<spName.length;i++)
  {
    allName+=spName[i]+" ";
    var url = "https://quiet-harbor-07073.herokuapp.com/getalias/"+allName;
    await fetch(url)
    .then((resp)=>resp.json())
    .then(function(data)
    {
      if(data!=null)
      {
        if(data.length==1)
        {
          countName = i ;
        }
        else if(data.length>0)
        {
          if(data.length<previousLength)
          {
            previousLength = data.length;
            countName = i;
          }
        }
      }
    });
  }
  console.log(countName);
  allName = "";
  for(var j=0;j<=countName;j++)
  {
    allName += spName[j]+" ";
  }
  if(countName==-1) allName=name;
  return allName;
}
