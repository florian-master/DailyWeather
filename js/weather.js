
let center = [44.8421, -0.5777]; // Bordeaux
const zoom = 10; // adjust map's zoom

// Show Weather and refocus the map on the right position 
function getWeather(city, code, latlon) {
    document.querySelector('#search').value = city + " " + code; // Fill the search field
    city = city.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    document.querySelector('#data').innerHTML = 
    "<div style=\"width:510px;color:#000;border:1px solid #F2F2F2;\">" +
        "<iframe height=\"85\" frameborder=\"0\" width=\"510\" scrolling=\"no\"" + 
            "src=\"https://www.prevision-meteo.ch/services/html/"+ 
            city + 
            "/horizontal?bg=ff0000&txtcol=F2F2F2&tmpmin=fff000&tmpmax=378ADF\"" +
            
            "allowtransparency=\"true\">" +
        "</iframe>"+
        "<a style=\"text-decoration:none;font-size:0.75em;\" title=\"Détail des prévisions pour Paris\"" + 
            "href=\"https://www.prevision-meteo.ch/meteo/localite/"+
            city + "\">Prévisions complètes pour " + city
        "</a>" +
    "</div>";
    
    // Move the marker and show the place pointed on
    let center = [latlon[1],latlon[0]];
    map.setView(center,zoom);
    marker.setLatLng(center);

    // Clean matching list
    document.getElementById('matchList').innerHTML = '';
}

//Setting Up the Map
var map = L.map('map').setView(center, zoom);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Put Marker on the Map
let marker = L.marker(center)
marker.addTo(map)

// get the place pointed by the user on the map and show the weather
map.on('click', function(e) {
    let pt = e.latlng;
    fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${pt.lat}&lon=${pt.lng}`, { method: 'GET' })
    .then(response => response.json().then((json) => {
            getWeather(json.address.municipality, 33000 , [pt.lng, pt.lat]);
            // getCity(json.address.postcode); // not work properly due to wrong post code
    }))
    .catch((e) => console.log("can't get city and center "+ e));
} );

// Get the text written in the search field
document.getElementById('search').addEventListener('input', (event)=>{
    let matchList = [];
    document.getElementById('matchList').innerHTML = '';
    let value = event.target.value;
    if(Number.isInteger(parseInt(value))) { // case of postal code
        if(value.length > 1) { 
            matchList = [];
            fetch(`https://vicopo.selfbuild.fr/cherche/${value}`)
            .then(response => response.json().then((JsonMatchList) => {
                JsonMatchList.cities.forEach(matched => {
                    // Collecting the matching list 
                    matchList.push(
                    "<div class=\"card card-body selected\" onclick=getCity(\""+matched.code +"\")>"+
                        "<h4>"+matched.city+"<span class=\"text-info\"> ("+ matched.code +")</span></h4>"+
                    "</div>");
                });
                
                // Inject the matching list in the HTML body
                const html = !matchList.length ? '' : matchList.join('');
                document.getElementById('matchList').innerHTML = html;

            }))
            .catch((e) => console.log("can't find postal code "+ e));
        }
    } else if(value.length > 0) { // case of city
        matchList=[];
        fetch(`https://geo.api.gouv.fr/communes?nom=${value}&fields=codesPostaux,centre&boost=population&limit=5`)
        .then(response => response.json().then((JsonMatchList) => {
            JsonMatchList.forEach(matched => {
                // Collecting the matching list 
                let city = { "name" : matched.nom , "code" : matched.codesPostaux[0], 
                                "center" : matched.centre.coordinates};
                
                // Put the results in thml format
                matchList.push( 
                "<div class=\"card card-body selected\" onclick=getWeather(\""+city.name +"\",\""+city.code +"\",["+ city.center+"])>"+
                    "<h4>"+city.name+"<span class=\"text-info\"> ("+ city.code +")</span></h4>"+
                    "<small>Lat "+city.center[1]+",Long "+city.center[0]+" </small>"+
                "</div>");
            });
            
            // Inject the matching list in the HTML body
            const html = !matchList.length ? '' : matchList.join('');
            document.getElementById('matchList').innerHTML = html;
        }))
        .catch((e) => console.log("can't find city "+ e));
    } else { // if there nothing written clear the matching list
        console.log("no matcing city");
        matchList=[];
        document.getElementById('matchList').innerHTML = "";
    }
});

// Get city name and position by its postal code
function getCity(code) {
    fetch(`https://geo.api.gouv.fr/communes?codePostal=${code}&fields=codesPostaux,centre`)
    .then(response => response.json().then((json) => {
        getWeather(json[0].nom, json[0].codesPostaux[0], json[0].centre.coordinates);
    }))
    .catch((e) => console.log("can't find city and center "+ e));
}
