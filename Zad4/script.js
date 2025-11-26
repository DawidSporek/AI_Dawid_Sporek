document.getElementById("pogodaBtn").addEventListener("click", function() {
    const city = document.getElementById("city").value;
    const apiKey = "e7c28138ba047fabe8136bef6a60734f";
    const resultDiv = document.getElementById("weatherResult");
    const headerTitle = document.getElementById("tytul"); 

    resultDiv.innerHTML = "";

    if (!city) {
        alert("Wpisz nazwe miasta");
        return;
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=pl`;
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                const data = JSON.parse(xhr.responseText);
                console.log("Otrzymane dane z XMLHttpRequest:", data);
                const now = new Date();
                const godzina = now.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });

                headerTitle.innerHTML = `Pogoda w ${data.name}, ${data.sys.country}`;

                resultDiv.innerHTML += `
                    <div class="forecast">
                        <div class="forecast-left">
                            <p><strong>${godzina}</strong></p>
                            <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="ikona pogody">
                            <p class="temp-big">${Math.round(data.main.temp)} °C</p>
                        </div>
                        <div class="forecast-right">
                            <p><strong>Odczuwalna:</strong> ${data.main.feels_like} °C</p>
                            <p><strong>Opis:</strong> ${data.weather[0].description}</p>
                            <p><strong>Wilgotność:</strong> ${data.main.humidity}%</p>
                            <p><strong>Wiatr:</strong> ${data.wind.speed} m/s</p>
                        </div>
                    </div>
                `;
            } else {
                resultDiv.innerHTML = "<p style='text-align:center; color:white;'>Nie znaleziono miasta.</p>";
                headerTitle.innerHTML = "Sprawdź pogodę"; 
            }
        }
    }
    xhr.send();

    const url2 = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric&lang=pl`;

    fetch(url2)
        .then(response => {
            if (!response.ok) {
                throw new Error("Nie znaleziono miasta");
            }
            return response.json();
        })
        .then(data => {
            console.log("Dane z Fetch:", data);
            const dayColors = {
                "poniedziałek": "#ffeb99",
                "wtorek": "#ffcccb",
                "środa": "#ccffcc",
                "czwartek": "#cce5ff",
                "piątek": "#e0ccff",
                "sobota": "#bfccf2",
                "niedziela": "#ffd9b3"
            };

            let currentDay = "";
            let htmlContent = "";

            const filteredList = data.list.filter((item, index) => index % 3 === 0).slice(0, 8);

            filteredList.forEach((item) => {
                const date = new Date(item.dt * 1000);
                const dayNameFull = date.toLocaleDateString("pl-PL", { weekday: "long" });
                
                const formattedDate = date.toLocaleString("pl-PL", {
                    weekday: "short",
                    hour: "2-digit",
                    minute: "2-digit"
                });

                if (dayNameFull !== currentDay) {
                    if (currentDay !== "") {
                        htmlContent += `</div>`; 
                    }
                    const bgColor = dayColors[dayNameFull] || "#eee";
                    htmlContent += `
                        <div class="day-container" style="background-color: ${bgColor};">
                            <h3 class="day-header">${dayNameFull.toUpperCase()}</h3>
                    `;
                    currentDay = dayNameFull;
                }

                htmlContent += `
                    <div class="forecast">
                        <div class="forecast-left">
                            <p><strong>${formattedDate}</strong></p>
                            <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png" alt="ikona">
                            <p class="temp-big">${Math.round(item.main.temp)} °C</p>
                        </div>
                        <div class="forecast-right">
                            <p>Odczuwalna: ${item.main.feels_like} °C</p>
                            <p>Opis: ${item.weather[0].description}</p>
                            <p>Wilgotność: ${item.main.humidity}%</p>
                            <p>Wiatr: ${item.wind.speed} m/s</p>
                        </div>
                    </div>
                `;
            });

            htmlContent += `</div>`;
            resultDiv.innerHTML += htmlContent;
        })
        .catch(error => {
            console.error(error);
        });
});