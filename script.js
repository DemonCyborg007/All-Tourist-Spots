const apiKey = "5ae2e3f221c38a28845f05b6411ebe93458f78942b7fafa5ad124288";
    
function apiGet(method, query) {
    return new Promise(function (resolve, reject) {
        var otmAPI =
            "https://api.opentripmap.com/0.1/en/places/" +
            method +
            "?apikey=" +
            apiKey;
        if (query !== undefined) {
            otmAPI += "&" + query;
        }
        fetch(otmAPI)
            .then(response => response.json())
            .then(data => resolve(data))
            .catch(function (err) {
                console.log("Fetch Error :-S", err);
            });
    });
}

const pageLength = 8;

let offset = 0;
let lon = 0;
let lat = 0;
let count = 0;

function onShowPOI(data) {
    let poi = document.getElementById("poi");
    poi.innerHTML = "";
    if (data.preview) {
        poi.innerHTML += `<img src="${data.preview.source}">`;
    }
    poi.innerHTML += data.wikipedia_extracts
        ? data.wikipedia_extracts.html
        : data.info
            ? data.info.descr
            : "No description";

    //poi.innerHTML += `<p><a target="_blank" href="${data.otm}">Show more at OpenTripMap</a></p>`;
}

function createListItem(item) {
    let a = document.createElement("a");
    a.className = "list-group-item list-group-item-action";
    a.setAttribute("data-id", item.xid);
    a.innerHTML = `<h5 class="list-group-item-heading">${item.name}</h5>
      <p class="list-group-item-text">${item.kinds[0]+item.kinds[1]+item.kinds[2]+item.kinds[3]+item.kinds[4]+item.kinds[5]+item.kinds[6]+item.kinds[7]+item.kinds[8]+item.kinds[9]+item.kinds[10]+item.kinds[11]+item.kinds[12]+item.kinds[13]}...</p>`;

    a.addEventListener("click", function () {
        document.querySelectorAll("#list a").forEach(function (item) {
            item.classList.remove("active");
        });
        this.classList.add("active");
        let xid = this.getAttribute("data-id");
        apiGet("xid/" + xid).then(data => onShowPOI(data));
    });
    return a;
}

function loadList() {
    apiGet(
        "radius",
        `radius=100000&limit=${pageLength}&offset=${offset}&lon=${lon}&lat=${lat}&rate=2&format=json`
    ).then(function (data) {
        let list = document.getElementById("list");
        list.innerHTML = "";
        data.forEach(item => list.appendChild(createListItem(item)));
        let nextBtn = document.getElementById("next_button");
        if (count < offset + pageLength) {
            nextBtn.style.visibility = "hidden";
        } else {
            nextBtn.style.visibility = "visible";
            nextBtn.innerText = `Next (${offset + pageLength} of ${count})`;
        }
    });
}

function firstLoad() {
    apiGet(
        "radius",
        `radius=100000&limit=${pageLength}&offset=${offset}&lon=${lon}&lat=${lat}&rate=2&format=count`
    ).then(function (data) {
        count = data.count;
        offset = 0;
        document.getElementById(
            "info"
        ).innerHTML += `<p>${count} objects with description in a 100km radius</p>`;
        loadList();
    });
}
window.onload=function(){
document.getElementById("search_form")
    .addEventListener("submit", function (event) {
        let name = document.getElementById("textbox").value;
        apiGet("geoname", "name=" + name).then(function (data) {
            let message = "Name not found";
            if (data.status == "OK") {
                message = data.name ;
                lon = data.lon;
                lat = data.lat;
                firstLoad();
            }
            document.getElementById("info").innerHTML = `<p>${message}</p>`;
        });
        event.preventDefault();
    });

document
    .getElementById("next_button")
    .addEventListener("click", function () {
        offset += pageLength;
        loadList();
    });
}