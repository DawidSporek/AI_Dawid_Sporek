var map;
let puzzleSolved = false;

function inicjujMape(lat, lon) {
    map = L.map('map').setView([lat, lon], 13); 

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '&copy; <a href="https://www.esri.com/">Esri</a> contributors'
    }).addTo(map);
}

function pobierzLokalizacje() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (pozycja) {
            var lat = pozycja.coords.latitude;
            var lon = pozycja.coords.longitude;

            if (!map) {
                inicjujMape(lat, lon);
            } else {
                map.setView([lat, lon], 13);
            }
        }, function (blad) {
            alert(`Błąd pobierania lokalizacji: ${blad.message}`);
        });
    } else {
        alert("Twoja przeglądarka nie obsługuje geolokalizacji.");
    }
}

function mojeLokalizacja() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (pozycja) {
            var lat = pozycja.coords.latitude;
            var lon = pozycja.coords.longitude;

            map.setView([lat, lon], 25);

            L.marker([lat, lon]).addTo(map)
                .bindPopup("Jesteś tutaj")
                .openPopup();
        }, function (blad) {
            alert(`Błąd pobierania lokalizacji: ${blad.message}`);
        });
    } else {
        alert("Twoja przeglądarka nie obsługuje geolokalizacji.");
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; 
    }
    return array;
}

function createUlozoneGrid() {
    const uTable = document.getElementById('ulozone');
    uTable.innerHTML = ''; 

    let pos = 0;
    for (let r = 0; r < 4; r++) {
        const tr = document.createElement('tr');
        for (let c = 0; c < 4; c++) {
            const td = document.createElement('td');
            td.classList.add('dropzone');
            td.dataset.pos = String(pos); 
            pos++;

            td.addEventListener('dragover', function (e) {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                td.classList.add('dropzone-over');
            });

            td.addEventListener('dragleave', function () {
                td.classList.remove('dropzone-over');
            });

            td.addEventListener('drop', function (e) {
                e.preventDefault();
                td.classList.remove('dropzone-over');
                const id = e.dataTransfer.getData('text/plain');
                const dragged = document.getElementById(id);
                if (!dragged) return;

                const sourceParent = dragged.parentElement;
                const targetChild = td.querySelector('canvas');

                if (targetChild) {
                    sourceParent.appendChild(targetChild);
                }

                td.appendChild(dragged);

                verifyUlozone();
            });

            tr.appendChild(td);
        }
        uTable.appendChild(tr);
    }
}

function makeFragmentDraggable(fragmentCanvas) {
    fragmentCanvas.setAttribute('draggable', 'true');
    if (!fragmentCanvas.id) {
        fragmentCanvas.id = 'frag-' + Math.random().toString(36).substr(2, 9);
    }
    fragmentCanvas.classList.add('fragment-canvas');

    fragmentCanvas.addEventListener('dragstart', function (e) {
        e.dataTransfer.setData('text/plain', fragmentCanvas.id);
        if (e.dataTransfer.setDragImage) {
            const img = new Image();
            img.src = fragmentCanvas.toDataURL();
            setTimeout(() => {
                try { e.dataTransfer.setDragImage(img, img.width / 2, img.height / 2); } catch (err) { /* ignore */ }
            }, 0);
        }
        fragmentCanvas.style.opacity = '0.6';
    });

    fragmentCanvas.addEventListener('dragend', function () {
        fragmentCanvas.style.opacity = '1';
        verifyUlozone();
    });

    fragmentCanvas.addEventListener('drop', function (e) {
        e.preventDefault();
    });
}

function podzielMape(canvas) {
    const ctx = canvas.getContext('2d');
    const image = new Image();
    image.src = canvas.toDataURL();
    
    image.onload = function () {
        const width = Math.floor(image.width / 4);
        const height = Math.floor(image.height / 4);

        let elements = [];

        let origIndex = 0;
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const fragmentCanvas = document.createElement('canvas');
                const fragmentCtx = fragmentCanvas.getContext('2d');

                fragmentCanvas.width = width;
                fragmentCanvas.height = height;

                fragmentCtx.drawImage(image, j * width, i * height, width, height, 0, 0, width, height);

                fragmentCanvas.dataset.correctPos = String(origIndex);
                origIndex++;

                fragmentCanvas.style.width = '100%';
                fragmentCanvas.style.height = 'auto';

                elements.push(fragmentCanvas);
            }
        }

        elements = shuffleArray(elements);

        const rastrowePodzieloneTable = document.getElementById('rastrowe_podzielone');
        rastrowePodzieloneTable.innerHTML = ''; 

        let index = 0;
        for (let r = 0; r < 4; r++) {
            const tr = document.createElement('tr');
            for (let c = 0; c < 4; c++) {
                const td = document.createElement('td');

                const frag = elements[index++];

                makeFragmentDraggable(frag);

                td.classList.add('dropzone');
                td.addEventListener('dragover', function (e) {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    td.classList.add('dropzone-over');
                });
                td.addEventListener('dragleave', function () {
                    td.classList.remove('dropzone-over');
                });
                td.addEventListener('drop', function (e) {
                    e.preventDefault();
                    td.classList.remove('dropzone-over');
                    const id = e.dataTransfer.getData('text/plain');
                    const dragged = document.getElementById(id);
                    if (!dragged) return;

                    const sourceParent = dragged.parentElement;
                    const targetChild = td.querySelector('canvas');

                    if (targetChild) {
                        sourceParent.appendChild(targetChild);
                    }
                    td.appendChild(dragged);

                    verifyUlozone();
                });

                td.appendChild(frag);
                tr.appendChild(td);
            }
            rastrowePodzieloneTable.appendChild(tr);
        }

        createUlozoneGrid();

        if (!window._verifyInterval) {
            window._verifyInterval = setInterval(verifyUlozone, 1000);
        }
    };
}

function verifyUlozone() {
    const uTable = document.getElementById('ulozone');
    if (!uTable) return;

    const cells = Array.from(uTable.querySelectorAll('td.dropzone'));
    let allCorrect = true;
    let filledCount = 0;

    cells.forEach(cell => {
        const expectedPos = cell.dataset.pos;
        const child = cell.querySelector('canvas');
        if (child) {
            filledCount++;
            const correctPos = child.dataset.correctPos;
            if (correctPos === expectedPos) {
                cell.classList.add('correct');
                cell.classList.remove('incorrect');
            } else {
                cell.classList.add('incorrect');
                cell.classList.remove('correct');
                allCorrect = false;
            }
        } else {
            cell.classList.remove('correct');
            cell.classList.remove('incorrect');
            allCorrect = false;
        }
    });

    if (allCorrect && filledCount === 16 && !puzzleSolved) {
        puzzleSolved = true;
        setTimeout(() => {
            alert("Gratulacje! Układ jest poprawny.");
            notifyMe();
        }, 100);
    }
}

function pobierzMape() {
    if (!map) {
        alert("Mapa nie jest jeszcze załadowana.");
        return;
    }

    leafletImage(map, function (err, canvas) {
        if (err) {
            alert("Błąd podczas generowania obrazu mapy.");
            return;
        }

        var img = new Image();
        img.src = canvas.toDataURL();

        var rastroweDiv = document.getElementById("rastrowe");
        rastroweDiv.innerHTML = '';
        rastroweDiv.appendChild(img);

        podzielMape(canvas);

        var link = document.createElement('a');
        link.href = img.src;
        link.download = 'mapa.png';
    });
}

function pobierzZgodeNaPowiadomienia() {
    if ('Notification' in window) {
        if (Notification.permission === "granted") {
            alert("Masz już włączone powiadomienia.");
        } else if (Notification.permission === "denied") {
            alert("Odmówiłeś powiadomienia.");
        } else {
            Notification.requestPermission().then(function (zgoda) {
                if (zgoda === "granted") {
                    alert("Zgoda na powiadomienia została udzielona!");
                } else {
                    alert("Nie udzieliłeś zgody na powiadomienia.");
                }
            });
        }
    } else {
        alert("Twoja przeglądarka nie obsługuje powiadomień.");
    }
}
function notifyMe() {
  if (!("Notification" in window)) {
    alert("This browser does not support desktop notification");
  } else if (Notification.permission === "granted") {
    const notification = new Notification("Udało się ułożyć układankę!");
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        const notification = new Notification("Udało się ułożyć układankę!");
      }
    });
  }
}
document.addEventListener('DOMContentLoaded', () => {
    pobierzLokalizacje();
    pobierzZgodeNaPowiadomienia();
    const r = document.getElementById('rastrowe_podzielone');
    r.innerHTML = '';
    for (let i = 0; i < 4; i++) {
        const tr = document.createElement('tr');
        for (let j = 0; j < 4; j++) {
            tr.appendChild(document.createElement('td'));
        }
        r.appendChild(tr);
    }

    createUlozoneGrid();
    if (!window._verifyInterval) {
        window._verifyInterval = setInterval(verifyUlozone, 1000);
    }
});