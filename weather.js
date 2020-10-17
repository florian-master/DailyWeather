let search_fld = document.querySelector('#search');
let search_btn = document.querySelector('#submit');
let result = document.querySelector('#data');

search_btn.addEventListener('click', function(e) {
    let search = search_fld.value
    console.log(search);
    result.innerHTML = 
    "<div style=\"width:510px;color:#000;border:1px solid #F2F2F2;\">" +
        "<iframe height=\"85\" frameborder=\"0\" width=\"510\" scrolling=\"no\"" + 
                "src=\"http://www.prevision-meteo.ch/services/html/"+ 
                    search + 
                "/horizontal?bg=ff0000&txtcol=F2F2F2&tmpmin=fff000&tmpmax=378ADF\"" +
                
                "allowtransparency=\"true\">" +
        "</iframe>"+
        "<a style=\"text-decoration:none;font-size:0.75em;\" title=\"Détail des prévisions pour Paris\"" + 
            "href=\"http://www.prevision-meteo.ch/meteo/localite/"+
                    search + "\">Prévisions complètes pour " + search
        "</a>" +
    "</div>"
})

document.getElementById('search').addEventListener('input', (event)=>{
    let matchList = [];
    let value = event.target.value;
    if(Number.isInteger(parseInt(value))) {
        if(value.length > 1) {        
            fetch(`https://vicopo.selfbuild.fr/cherche/${value}`)
            .then(response => response.json().then((JsonMatchList) => {
                JsonMatchList.cities.forEach(matched => {
                    matchList.push(matched.city);
                });
                showMatchList(matchList);
            }))
            .catch((e) => error(e));
        }
    } else if(value.length > 0) {
        matchList=[]
        fetch(`https://geo.api.gouv.fr/communes?nom=${value}&fields=departement&boost=population&limit=5`)
        .then(response => response.json().then((JsonMatchList) => {
            JsonMatchList.forEach(matched => {
                matchList.push(matched.nom);
            });
            showMatchList(matchList);
        }))
        .catch((e) => error(e));
    } else {
        console.log("no matcing city")
        matchList=[]
        document.querySelector('.matchList').innerHTML = "";
    }
});


function showMatchList(matchList){
    matchList = matchList.map(matched => `<a href=# id="selected">${matched}</a></br>`)
    const html = !matchList.length ? '' : matchList.join('');
    document.querySelector('.matchList').innerHTML = html;
    
    let selected = document.getElementById('selected')
    selected.addEventListener('click', (e)=> {
        console.log(selected.innerHTML);
        document.getElementById('search').value = selected.innerHTML      
    
        document.querySelector('.matchList').innerHTML = "";
    });
}    