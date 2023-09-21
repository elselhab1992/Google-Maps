let map, bounds;

async function initMap() {
  const center = { lat: 55.378052, lng: -3.435973 };

  const { Map } = await google.maps.importLibrary("maps");

  map = new Map(document.getElementById("mapContainer"), {
    center: center,
    zoom: 6,
  });
  bounds = new google.maps.LatLngBounds();
}

window.initMap = initMap;

const API_KEY = "secret ;)";

const fetchCountries = async () => {
  const url =
    "https://wft-geo-db.p.rapidapi.com/v1/geo/countries?limit=10&offset=40";
  const options = {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": API_KEY,
      "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com",
    },
  };

  try {
    const response = await fetch(url, options);
    const result = await response.json();

    return result.data;
  } catch (error) {
    console.error(error);
  }
};

const fetchHotels = async (country) => {
  const url = `https://hotels4.p.rapidapi.com/locations/v3/search?q=${country}`;
  const options = {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": API_KEY,
      "X-RapidAPI-Host": "hotels4.p.rapidapi.com",
    },
  };

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    getMarkers(result.sr);
  } catch (error) {
    console.error(error);
  }
};

const loadCountries = async () => {
  const countries = await fetchCountries();
  const countriesList = document.getElementById("countries_list");
  const countriesInput = document.getElementById("countries_input");

  for (let i = 0; i < countries.length; i++) {
    countriesList.innerHTML += `<li data-country=${countries[i].name}>${countries[i].name}</li>`;
    countriesList.style.display = "none";
    countriesInput.addEventListener("click", () => {
      countriesList.style.display = "block";
    });
    const allCountries = Array.from(countriesList.children);

    allCountries.map((country) => {
      country.addEventListener("click", (e) => {
        const selectedCountry = e.target.dataset.country;
        countriesInput.value = selectedCountry;
        countriesList.style.display = "none";
        fetchHotels(selectedCountry);
      });
    });
  }
};
loadCountries();

const getMarkers = (markers) => {
  markers.map((hotel, index) => {
    const lat = parseFloat(hotel.coordinates.lat);
    const lng = parseFloat(hotel.coordinates.long);

    const position = { lat, lng };
    const label = (index + 1).toString();

    new google.maps.Marker({
      position: position,
      label: label,
      map,
    });
    bounds.extend(new google.maps.LatLng(position));
    map.fitBounds(bounds);
  });
};

//working on the input field

const search = document.getElementById("search");
const suggestList = document.getElementById("auto_suggest_list");

search.addEventListener("input", async (e) => {
  if (e.target.value === "") {
    suggestList.innerHTML = "";
  } else {
    const countries = await fetchCountries();

    const filteredCountries = countries.filter((country) => {
      return country.name.toLowerCase().startsWith(e.target.value);
    });

    suggestList.innerHTML = "";
    filteredCountries.map((country) => {
      suggestList.innerHTML += `<li data-country=${country.name}>${country.name}</li>`;
    });
  }
  const selectedCountries = Array.from(suggestList.children);

  selectedCountries.map((country) => {
    country.addEventListener("click", (e) => {
      fetchHotels(e.target.dataset.country);
      suggestList.innerHTML = "";
      search.value = e.target.dataset.country;
    });
  });
});
