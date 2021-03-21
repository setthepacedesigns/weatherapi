// Set the base URL of the API
const api = {
    baseUrl: "https://xenodochial-edison-a2f234.netlify.app/.netlify/functions/"
}

// Find and store all needed DOM Elements

const searchBox = document.querySelector('.search-box');
const searchBoxButton = document.querySelector('.search-box__button');
const locationContainer = document.getElementById('location-wrapper');
const weatherContainer = document.getElementById('weather-results-wrapper');
const locationSection = document.getElementById('location-section');
const weatherSection = document.getElementById('weather-section');

// Set the event listeners for the keypress and search button

searchBox.addEventListener("keypress", function(e) {
    if (e.keyCode == 13) {
        e.preventDefault();
        searchBoxButton.click();
    }
});

searchBoxButton.addEventListener('click', getSearchedQuery);

// Pass the input value over to fetchLocations after the events triggered

function getSearchedQuery(e) {
    locationSection.classList.remove("hide");
    locationSection.classList.add("show");
    weatherSection.classList.add("hide");
    fetchLocations(searchBox.value);
}

// Fetch the JSON based on the town or city searched for

function fetchLocations(query) {

    fetch(`${api.baseUrl}search?query=${query}`)
        .then(res => {
            if(res.ok) {
                return res.json();
            } else {
                console.log("Fetch Unsuccesful");
            }
        })
        .then(data => {

            // Create a button with the title of each location returned
            let createLocations = "<span class='select-result font-s'>Select a Result:</span>";
            let i = "";

            data.forEach(function(location){

                i++;

                createLocations += `
                    <button class="location-btn font-s" id="${location.woeid}" >${location.title}</button>
                `;

            });

            // If no results are returned display a message to let the user know

            if (i < 1) {
                createLocations += `
                    <span class="select-result no-results font-s" >Sorry, there are no results available for your current search, please try again.</span>
                `;
            }
            
            // Add the button to the container
            locationContainer.innerHTML = createLocations;
            
            // Store all of the returned buttons from the DOM
            locationButtons = document.querySelectorAll('.location-btn');

            // Hide buttons container once a button has been selected and show the weather results container
            // Pass the buttons woeid over to the new API get location query
             locationButtons.forEach(function(locationButton) {
                locationButton.addEventListener("click", function() {
                    locationSection.classList.add("hide");
                    weatherSection.classList.remove("hide");
                    weatherSection.classList.add("show");
                    fetchLocationData(this.id);
                });
            });

            // Fetch results based from the API based on the woeid of the selected button
            function fetchLocationData(id) {
                fetch(`${api.baseUrl}get-location?id=${id}`)
                    .then(res => {
                        if(res.ok) {
                            return res.json();
                        } else {
                            console.log("Fetch Unsuccesful");
                        }
                    })
                    .then(data => {
                        // Blank variable to build up the information for the weather card
                        let createWeatherCard = "";
                        // Count to ensure we only return five days of weather
                        let i = "";
                        // Date arrays ready for passing date information
                        let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                        let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

                        data.consolidated_weather.forEach(function(report){
                            
                            // Count start
                            i++

                            // Loop array five times to obtain weather reports
                            if(i <= 5) {
                            
                                // Function to obtain the Ordinal indicator of the weather report
                                const nth = function(d) {
                                    if (d > 3 && d < 21) return 'th';
                                        switch (d % 10) {
                                            case 1:  return "st";
                                            case 2:  return "nd";
                                            case 3:  return "rd";
                                            default: return "th";
                                        }
                                }

                                // Build the date based on the returned applicable date from the API
                                let applicable_date = new Date(report.applicable_date);
                                let day = days[applicable_date.getDay()];
                                let date = applicable_date.getDate();
                                let month = months[applicable_date.getMonth()];

                                // Build the weather card for the front end passing trhough the API data

                                createWeatherCard += `
                                    <div class="weather-card">
                                        <div class="date font-s font-s-medium"><strong>${day}</strong> <span>${date}<sup>${nth(date)}</sup> ${month}</span></div>
                                        <div class="weather-img">
                                            <img src="https://www.metaweather.com/static/img/weather/${report.weather_state_abbr}.svg" alt="Weather Icon" width="95" height="95">
                                        </div>
                                        <div class="current-temp font-s font-s-medium"><strong>Current Temp ${report.the_temp.toFixed(1)}<span>&#8451;</span></strong></div>
                                        <div class="max-temp font-s font-s-medium">Max Temp: <strong>${report.max_temp.toFixed(1)}<span>&#8451;</span></strong></div>
                                    </div>
                                `;

                            }    

                        });

                        // Create the weather card
                        weatherContainer.innerHTML = createWeatherCard;
                        
                    })
                    .catch((err) => console.log(err));
            }

        })
        .catch((err) => console.log(err));

}