class GlobalManager {
    constructor() {
        this.controlArea = document.getElementById("ControlArea");
        this.dicSel = document.getElementById("DicSel");
        this.tocSel = document.getElementById("TOCSel");
        this.entryField = document.getElementById("EntryField");
        this.enterButton = document.getElementById("EnterButton");
        this.clearButton = document.getElementById("ClearButton");
        this.prevButton = document.getElementById("PrevButton");
        this.nextButton = document.getElementById("NextButton");
        this.imageArea = document.getElementById("ImageArea");
        this.fullSizedImageArea = document.getElementById("FullSizedImageArea");
        this.resourceRoot = "./resources/";
        this.indexFilename = "/index.js";
        this.imagePrefix = "/image-";
        this.currentPage = 0;
        this.magnifierOn = false;
    }
}

const G = new GlobalManager();

window.addEventListener("load", function() {
    initialise();
});

G.imageArea.addEventListener("mousedown", function(evt) {
    if (G.magnifierOn) {
        G.magnifierOn = false;
        document.querySelector(".fullsizedimage").style.opacity = 0;
    } else {
        G.magnifierOn = true;
        enableMagnifier(evt);
    }
});

function enableMagnifier(evt) {
    let fsi = document.querySelector(".fullsizedimage");
    fsi.style.opacity = 1;
    // set magnifier position
    fsi.style.top = (evt.offsetY - 50) + "px";
    fsi.style.left = (evt.offsetX - 200) + "px";
    // set area offset
    let newLensOffsetY = Math.floor((evt.offsetY * G.fullSizedImageArea.height / G.imageArea.height) * -1 + 50);
    let newLensOffsetX = Math.floor((evt.offsetX * G.fullSizedImageArea.width / G.imageArea.width) * -1 + 200);
    let fsic = document.querySelector(".fsimage");
    fsic.style.top = (newLensOffsetY) + "px";
    fsic.style.left = (newLensOffsetX) + "px";
}

G.imageArea.addEventListener("mousemove", function(evt) {
    if (G.magnifierOn) {
        enableMagnifier(evt);
    }
}, false);

G.imageArea.addEventListener("mouseout", function(evt) {
    document.querySelector(".fullsizedimage").style.opacity = 0;
    G.magnifierOn = false;
}, false);

function initialise() {
    document.addEventListener("keydown", function(evt) {
        let kc;
        if (evt) {
            kc = evt.keyCode;
        } else {
            kc = event.keyCode;
        }
        if (kc == 27) {
            let fsi = document.querySelector(".fullsizedimage");
            fsi.style.opacity = 0;
            G.magnifierOn = false;
            clearField();
        }
    });
    while (G.dicSel.lastChild) {
        G.dicSel.removeChild(G.dicSel.lastElementChild);
    }
    for (let i = 0; i < configInfo.length; i++) {
        let elem = document.createElement("option");
        elem.text = configInfo[i][0];
        elem.value = configInfo[i][1];
        G.dicSel.appendChild(elem);
    }
    G.dicSel.selectedIndex = 0;
    dicChange();
}

function clearField() {
    G.entryField.value ="";
    G.entryField.focus();
}

function dicChange() {
    let oldDicData = document.getElementById("DicData");
    if (oldDicData) oldDicData.remove();
    let script = document.createElement("script");
    script.id = "DicData";
    script.type = "text/javascript";
    script.src = G.resourceRoot + configInfo[G.dicSel.selectedIndex][1] + G.indexFilename;
    script.onload = function() {
        initialiseDic();
    };
    let firstScript = document.getElementsByTagName( 'script' )[ 0 ];
    firstScript.parentNode.insertBefore(script, firstScript);
//    document.head.appendChild(script);
}

function constructSelector(array) {
    for (let i = 0; i < array.length; i++) {
        let elem = document.createElement("option");
        elem.text = array[i][0];
        elem.value = array[i][1];
        G.tocSel.appendChild(elem);
    }
}

function initialiseDic() {
    // erase existing entries
    G.entryField.focus();
    while (G.tocSel.lastChild) {
        G.tocSel.removeChild(G.tocSel.lastElementChild);
    }

    G.tocSel.appendChild(document.createElement("option"));
    constructSelector(indexData[0]);
    constructSelector(indexData[2]);
    G.currentPage = 0;
}

function tocChange(pno) {
    if (pno == "")  return;
    G.currentPage = Number(pno);
    loadImage(pno);
}

function loadImage(pno) {
    G.magnifierOn = false;
    G.imageArea.src = G.resourceRoot + configInfo[G.dicSel.selectedIndex][1] + G.imagePrefix + pno + ".jpg";
    G.fullSizedImageArea.src = G.resourceRoot + configInfo[G.dicSel.selectedIndex][1] + G.imagePrefix + pno + ".jpg";
}

function getIndex(targetEntry) {
    let target = targetEntry.trim().toLowerCase();
    target = target.replaceAll(/[^a-z]/g, "");
    for (let i = 0; i < indexData[1].length; i++) {
        if (indexData[1][i][0] > target) {
            return indexData[1][i][1] - 1;
        } else if (indexData[1][i][0] == target) {
            return indexData[1][i][1];
        }
    }
    return indexData[1][indexData[1].length - 1][1];
}

function search() {
    G.tocSel.selectedIndex = 0;
    let targetEntry = G.entryField.value;
    let pno = getIndex(targetEntry);
    if (pno >= 1) {
        G.currentPage = pno;
        loadImage(pno);
    }
}

function prevPage() {
    if (G.currentPage > 1) {
        G.currentPage -= 1;
        loadImage(G.currentPage);
    }
}

function nextPage() {
    if (G.currentPage < maxPage) {
        G.currentPage += 1;
        loadImage(G.currentPage);
    }
}
