const mainContent = document.querySelector('#main-content');
const pages = document.getElementById('footer');
const detailsPopup = document.querySelector('.bg-modal');
const breweryName = document.getElementById('BreweryName');
const breweryDetails = document.querySelector('.brewery-details');
const closeButton = document.querySelector('.close');
const properties = ["street","address_2","address_3","city","country_province","state","country","postal_code","website_url","phone"];
let data;
const searchButton = document.querySelector('#search-button');
const logo = document.querySelector('#logo');

//To get the Data from the specific URL
async function getData(url='https://api.openbrewerydb.org/breweries'){
    try{
        const response = fetch(url,{
            method: 'GET',
            headers: {
                "Content-Type": "application/json"
            }
        }).then((response) => {
            if (response.status >= 400 && response.status < 600) {
              throw new Error("Bad response from server");
            }
            return response;
        })
        const breweryData = await response;
        const breData = await breweryData.json();
        return breData;
    }catch(error){
        console.log(error.message);
    }
}

//Get the data by ID to display contact details in the pop-up card
async function getByID(id){
    let idDetails;
    try{
        const getById_URL = "https://api.openbrewerydb.org/breweries/"+id;
        idDetails = await getData(getById_URL);
        if(idDetails == undefined){
            throw new Error("Couldn't find the data for the requested ID");
        }else{
            openDetailsPopup(idDetails);
        }
    }catch(error){
        console.log(error.message);
    }
}

//Function to display the pop-up card
function openDetailsPopup(idDetails) {
    //console.log(idDetails);
    breweryName.innerText = idDetails.name;
    breweryDetails.innerHTML = "";
    let address = "";
     for(prop in idDetails){
        if(prop == "website_url"){
            breweryDetails.innerHTML += `<p> Website Details: ${ (idDetails[prop]) ? "<a href="+idDetails[prop]+" target='_blank'>"+idDetails[prop]+"</a>" : "<p>Oops!Website Unavailable</p>"}`;
        }else if(properties.includes(prop) && idDetails[prop]!=null){
            if(["street","address_2","address_3","city","country_province","state","country"].includes(prop)){
                if(prop == "country"){
                    address += `${idDetails[prop]}.`
                }else{
                    address += `${idDetails[prop]},`
                }
                continue;
            }else{
              breweryDetails.innerHTML +=`<p>${prop}: <span class="dataClass">${idDetails[prop]}</span></p>`
            }
        }
     }
     breweryDetails.innerHTML +=`<p>Address : <span class="dataClass">${address}</span></p>`
    detailsPopup.style.display = 'flex';
}

closeButton.addEventListener('click', closeDetailsPopup)

//function to close the pop-ip card
function closeDetailsPopup() {
    detailsPopup.style.display = 'none';
}

//Function to get the details by type
async function getByType(searchValue){
    try{
        if(searchValue == "" || searchValue == undefined){
            displayData(1)
        }else{
            let searchDetails;
            const getByType_URL = "https://api.openbrewerydb.org/breweries?by_type="+searchValue;
            searchDetails = await getData(getByType_URL);
            console.log(getByType_URL);
            if(searchDetails == undefined){
                throw new Error("Couldn't find the data for the requested Type");
            }else{
                displayData(1,searchDetails)
            }
        }
    }catch(error){
        console.log(error.message);
    }
}

//Function to Display the Query Data
async function getByQuery(searchValue){
    try{
        if(searchValue == "" || searchValue == undefined){
            data = await getData();
            displayData(1,data).then(addShowDetailsListener);
        }else{
            let searchDetails;
            const getByQuery_URL = "https://api.openbrewerydb.org/breweries/search?query="+searchValue;
            searchDetails = await getData(getByQuery_URL);
            if(searchDetails == undefined){
                throw new Error("Couldn't find the data for the requested Type");
            }else{
                data = searchDetails
                displayData(1,data).then(addShowDetailsListener);
            }
        }
    }catch(error){
        console.log(error.message);
    }
}

//Adding showDetails Event Listener to the display details
async function addShowDetailsListener(){
    let showDetailsButton = document.querySelectorAll(".showDetails");
    showDetailsButton.forEach(function(button){
        button.addEventListener('click',function(){
            getByID(button.id);
        })
    })
}

//On-loading the window initially, this function will be called
window.onload = async function(){
    try{
        //Retrieving data from API URL
        data = await getData();
        if(data == undefined){
            throw new Error('Bad Response from server');
        }else{
            //After receiving data, Loading the page with data received
            let pageLoaded = displayData(1,data);
            //If pageLoaded is successfull, ShowDetails Event listener is added to each visible data. 
            //Following that, Adding SearchBox event listener(ENTER & CLICK)
            pageLoaded.then(addShowDetailsListener).then(function() {
                let searchValue = document.querySelector('#search-value');
                searchButton.addEventListener('click',function(){
                    getByQuery(searchValue.value);  
                })
                searchValue.addEventListener('keypress',function(event){
                    if(event.key == 'Enter'){
                        getByQuery(searchValue.value);
                    }
                })
        })
        }
    }catch(error){
        console.log(error.message);
    }
}

//Footer - Pagination details
async function paginationFor(displayList,pageNumber){
    //Pagination Details
    const breweryPerPage = 6;
    //number of Brewery details received via response
    let numberOfBrewery = displayList.length;
    //number of pages we require to showcase the brewery details in the webpage
    const numberOfPages = (numberOfBrewery % breweryPerPage ? Math.floor(numberOfBrewery / breweryPerPage) + 1 : numberOfBrewery / breweryPerPage);
    //starting index of the data to be shown in the page calculated
    let startingIndex = (breweryPerPage*pageNumber)-breweryPerPage;
    
    //refreshing the pages div  
    pages.innerHTML = "";
    
    //Adding prev page button
    const prevPage = document.createElement('button');
    prevPage.classList.add(`pageButtons`);
    prevPage.innerText = "<<";
    prevPage.addEventListener('click',function () {
        pageLoaded = displayData(pageNumber-1,data);
        pageLoaded.then(addShowDetailsListener);
    });
    pages.appendChild(prevPage);

    //for first page, previous button should be disabled
    if(pageNumber == 1){
        prevPage.setAttribute('disabled',"true");
    }
    
    //Adding NUMBER pages button - page number calculated respective to displayList
    for(let i = 1; i <= numberOfPages; i++){
        const page= document.createElement('button');
        page.addEventListener('click',function () {
                pageLoaded = displayData(i,data);
                pageLoaded.then(addShowDetailsListener);
            })
        page.classList.add(`pageButtons`);
        if(i == pageNumber){
            page.classList.add('active');
        }
        page.innerText = i;
        pages.appendChild(page);
    }

    //Adding next page button
    const nextPage = document.createElement('button');
    nextPage.addEventListener('click',function () {
        pageLoaded = displayData(pageNumber+1,data);
        pageLoaded.then(addShowDetailsListener);
    })
    nextPage.classList.add(`pageButtons`);;
    nextPage.innerHTML = ">>";
    pages.appendChild(nextPage);
    
    //for last page calculated, next button should be disabled
    if(pageNumber == numberOfPages){
        nextPage.setAttribute('disabled',"true");
    }

    //returning starting index & records per page -> used in displayData function
    return {"startingIndex":startingIndex,"breweryPerPage":breweryPerPage};
}


//function to create a brewery data container
async function createDataContainer(){
    const container = document.createElement('div');
    container.className = 'brewery-container col-xs-12 col-sm-4 col-md-3 col-lg-3';
    return container;
}

//function to display data in main-content
async function displayData(pageNumber,response = getData()){ 
    try{
        //main-content to be refreshed as we traverse through the pages
        mainContent.innerHTML = "";
       
        //Assigning the response received to common displayList variable
        let displayList = response;
        /*if(Object.prototype.toString.call(response) === "[object Promise]"){
              displayList = await response;
            }
        */

        //With the response received, pagination details to be updated respective to the Data(i.e.displayList)
        const pagination = await paginationFor(displayList,pageNumber);
       
        //If Data are unavailable, display "No data available".
        if(displayList.length == 0){
            mainContent.innerHTML = `<img src="${'/imgs/No_Data.png'}" alt="No Data Available" class="no-data" /><h4 id="no-data">Whoops! Looks like there is No Data! Please try other options.</h4>`
            throw new Error("No Data Available");
        }
        //Displaying the data respective to page numbers with help of pagination details
        else{
            displayList.slice(pagination.startingIndex,pagination.startingIndex+pagination.breweryPerPage).forEach(async function(data) {
                const breweryContainer = await createDataContainer();
                breweryContainer.innerHTML = `
                <p>Brewery Name: <span class="dataClass">${data.name}</span></p>
                <p>Type: <span class="dataClass">${data.brewery_type}</span></p>
                <button id="${data.id}" class="showDetails">Show Details</button>
                `
                mainContent.append(breweryContainer);
            }) 
        }
        return mainContent;
    }catch(err){
        console.log(err);
    }
}
