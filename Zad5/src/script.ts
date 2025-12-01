const msg: string = "Hello!";
alert(msg);

interface AppState {
    currentStyle: string;
    styles: Record<string, string>;
  }
  
  const state: AppState = {
    currentStyle: "style-1",
    styles: {
      "style-1": "style-1.css",
      "style-2": "style-2.css",
      "style-3": "style-3.css"
    }
  };
  
  function zmienStyle(styleName: string) {
    const head = document.head;
    const staryLink = document.getElementById("dynamic-style");
    if (staryLink) {
      staryLink.remove();
    }
    const nowyLink = document.createElement("link");
    nowyLink.rel = "stylesheet";
    nowyLink.href = state.styles[styleName];
    nowyLink.id = "dynamic-style";
    head.appendChild(nowyLink);
    state.currentStyle = styleName;
  }
  

function zrobLinki() {
  const kontener = document.createElement("div");
  kontener.className = "style-switcher";

  const ul = document.createElement("ul");

  Object.keys(state.styles).forEach(styleName => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = "#";
      a.textContent = `Styl: ${styleName}`;
      a.addEventListener("click", (e) => {
          e.preventDefault();
          zmienStyle(styleName);
      });
      li.appendChild(a);
      ul.appendChild(li);
  });

  kontener.appendChild(ul);
  const sectionElement = document.querySelector("section");

  if (sectionElement) {
      sectionElement.appendChild(kontener);
  } 
}
  
  function init() {
    zmienStyle(state.currentStyle);
    zrobLinki();
  }
  
  init();
  