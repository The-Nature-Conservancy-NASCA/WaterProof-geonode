
let selectedFechaInicio = "";
let selectedFechaFin = "";
let nameValue = 0;
let btnSearch = $("#btnSearch")[0]
let countryValue=0;
let graphYear = $("#myLineChart1")[0];
let graphMonth = $("#myChart1")[0];
let btnFilter = $("#btnFilter")[0];
let counterFilter = 0;

$(document).ready(function () {
    // var selectUser = $("#SelectUser")[0]
    // var selectCountry = $("#SelectCountry")[0]
    // // console.log(selectUser)
    // // console.log(selectCountry)
    // let userArray=[]
    // let countryArray=[]

    // selectUser.forEach(e => {
    //     let listUsers= new Object();
    //     listUsers.id= e.value;
    //     listUsers.name = e.text;
    //     userArray.push(listUsers)
    // });
    // selectCountry.forEach(e => {
    //     let listCountry= new Object();
    //     listCountry.id= e.value;
    //     listCountry.name = e.text;
    //     countryArray.push(listCountry)
    // });
    // // console.log(countryArray)

    // let unicUserSet = new Set(userArray.map(JSON.stringify));  
    // let unicUserArray = Array.from(unicUserSet).map(JSON.parse);
    // unicUserArray.sort((a, b) => a.name.localeCompare(b.name));

    // let unicCountrySet = new Set(countryArray.map(JSON.stringify));  
    // let unicCountryArray = Array.from(unicCountrySet).map(JSON.parse);
    // unicCountryArray.sort((a, b) => a.name.localeCompare(b.name));

    // selectUser.innerHTML = '' ;
    // selectUser.innerHTML = '<option value="" disabled="" selected="" hidden="">Select User</option>\n' ;

    // selectCountry.innerHTML = '' ;
    // selectCountry.innerHTML = '<option value="" disabled="" selected="" hidden="">Select Country</option>\n' ;


    // // console.log(selectUser)
    // unicUserArray.forEach(e => {
    //     if (e.name !== "") {
    //         var opt = document.createElement('option');
    //         opt.value = e.id;
    //         opt.innerHTML = e.name;
    //         selectUser.appendChild(opt);
    //     }
    // });

    // unicCountryArray.forEach(e => {
    //     if (e.name !== "") {
    //         var opt = document.createElement('option');
    //         opt.value = e.id;
    //         opt.innerHTML = e.name;
    //         selectCountry.appendChild(opt);
    //     }
    // });


});

function updateIniDate(elem) {
    selectedFechaInicio = elem.target.value;
    // console.log(selectedFechaInicio)
}
function updateFinDate(elem) {
    selectedFechaFin = elem.target.value;
    // console.log(selectedFechaFin)
}
function getNameValue(elem) {
    nameValue = elem.target.value;
    // console.log(nameValue)
    // console.log(btnSearch)
    btnSearch.href= "/records/search/"+nameValue+"/"+countryValue
    // console.log(btnSearch)
    
}

function getCountryValue(elem){
    countryValue = elem.target.value;
    btnSearch.href= "/records/search/"+nameValue+"/"+countryValue
    // console.log(countryValue)
    return countryValue;

}
function setData(){
    console.log(nameValue)
    let tableSc = $("#tbl-SC")
    // console.log(tableSc)
}

function showGraph(){
    if (counterFilter === 0){
        graphMonth.classList.add('d-none');
        graphYear.classList.remove('d-none');
        btnFilter.innerText= "Filtrar por mes"
        counterFilter=1;
    }else{
        graphMonth.classList.remove('d-none');
        graphYear.classList.add('d-none');
        btnFilter.innerText= "Filtrar por Año"
        counterFilter=0;
    }
}


// $("#FechaInicio").change(updateIniDate)
// $("#FechaFin").change(updateFinDate)
$("#SelectUser").change(getNameValue)
$("#SelectCountry").change(getCountryValue)
$("#btnFilter").click(showGraph)


// $("#btnSearch").click(setData)
