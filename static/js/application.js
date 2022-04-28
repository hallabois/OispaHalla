// Stuff to make sure that only one tab can play the game at a time
var tabID = sessionStorage.tabID ? 
            sessionStorage.tabID : 
            sessionStorage.tabID = Math.random();
function unregisterTabID() {
  if(localStorage){
    if(localStorage.lastSession){
      if(localStorage.lastSession == tabID){
        delete localStorage.lastSession;
      }
    }
  }
}
window.onpagehide = unregisterTabID;
window.onbeforeunload = unregisterTabID;

var GameManagerInstance;

function initGameManager(size = 4){
  GameManagerInstance = new GameManager(4, KeyboardInputManager, HTMLActuator, LocalStorageManager);
}

// Wait till the browser (and svelte) are ready to render the game (avoids glitches)
var onInitDone = function () {
  if(window.location.href.includes("?pack=")){
    let packname = window.location.href.split("?pack=")[1];
    console.log("Pack name: ", packname);
    try{
      let actual_path = atob(packname);
      console.log("Parsed path: ", actual_path);
      setImageBasePath(actual_path);
    }
    catch(e){
      alert("Failed to parse pack!");
      console.warn("Failed to parse pack!", e);
    }
  }
  initGameManager();

  // Load theme from storage
  if(localStorage.imageTheme){
    if(localStorage.imageThemeLastVersion && localStorage.imageThemeLastVersion == currentImageThemeVersion){
      setImageTheme(localStorage.imageTheme);
    }
    else{
      setImageTheme( defautTheme );
    }
	}
  else{
    setImageTheme( defautTheme );
  }
};

var themeCount = 2;
var defautTheme = 1;
var currentImageThemeVersion = 5;
window.isLeaderboardOpen = false;

var base_path = "";
function setImageBasePath(path){
  if(path != ""){
    setImageTheme(0);
    let newStyle = document.createElement('style');
    newStyle.innerHTML = "html, body{background-image: none !important;}";
    document.querySelector("html").appendChild(newStyle);
  }
  base_path = path;
}
function preloadImages(path){
  // path = base_path + path;
  var imageList = [
    "2.png",
    "4.png",
    "8.png",
    "16.png",
    "32.png",
    "64.png",
    "128.png",
    "256.png",
    "512.png",
    "1024.png",
    "2048.png"
  ];
  
  for(var i = 0; i < imageList.length; i++ ) {
    //var imageObject = new Image();
    let img = document.createElement("img");
    img.src = path + imageList[i];
    img.style="height:0!important;";
    img.alt = ""; // decorative, alt not needed
    document.getElementsByClassName("preload-container")[0].appendChild(img);
    //imageObject.src = imageList[i];
  }

  let img = document.createElement("img");
    img.src = 'img/parinkulautus.png';
    img.style="height:0!important;";
    img.alt = ""; // decorative, alt not needed
    document.getElementsByClassName("preload-container")[0].appendChild(img);
}

var currentTheme = 1;
var prefersDark = false;
function setImageTheme(themeID){
  currentTheme = themeID;
  document.querySelector("html").classList = ["theme-" + themeID];
  preloadImages("/img/theme-" + themeID + "/");
  localStorage.imageTheme = themeID;
  localStorage.imageThemeLastVersion = currentImageThemeVersion;
  try{
			sa_event('theme_changed_to_' + themeID);
		}
	catch{}
  applyThemeUIElements();
}

const darkThemeList = [1]

function applyThemeUIElements(){
  var toggle = document.getElementById('darkmode-icon');
  prefersDark = darkThemeList.includes(currentTheme);
  if(prefersDark) {
    toggle.classList.remove("dark");
    toggle.innerHTML = "🔆";
  }
  else{
    toggle.classList.add("dark");
    toggle.innerHTML = "🔅";
  }
}