class Card{
    constructor(apiObject){
        this.name = apiObject.name;
        if(apiObject.attributes.factionSecondary == "")
            this.faction = apiObject.attributes.faction;
        else
            this.faction = apiObject.attributes.faction +"/"+apiObject.attributes.factionSecondary;

        this.type = apiObject.attributes.type;
        this.rarity = apiObject.attributes.rarity;
        this.power = apiObject.attributes.power;
        this.provision = apiObject.attributes.provision;
        this.armor = apiObject.attributes.armor;
        this.artLink = apiObject.id.art
        }

    setImage(){
        imgContainer.src = "https://gwent.one/image/gwent/assets/card/art/high/" + this.artLink+ ".jpg";
        this.setInfo()
    };

    setInfo(){
        provisionSpan.innerHTML = this.provision;
        armorSpan.innerHTML = this.armor;
        powerSpan.innerHTML = this.power;
        typeSpan.innerHTML = this.type;
        raritySpan.innerHTML = this.rarity;
        factionSpan.innerHTML = this.faction;
    };
};

// #region elements
const decreaseButton = document.getElementById('decreaseButton');
const increaseButton = document.getElementById('increaseButton');
const imgContainer = document.getElementById('card-img');
const input = document.getElementById('your_guess')
const checkBoxes = document.querySelectorAll('.check'); 
const sendButton = document.getElementById('send-answer');
const startButton = document.getElementById('start-button');
const reRollButton = document.getElementById('re-roll');
//#endregion

// #region spans
const provisionSpan = document.getElementById("provision-info");
const armorSpan = document.getElementById("armor-info");
const powerSpan = document.getElementById("power-info");
const typeSpan = document.getElementById("type-info");
const raritySpan = document.getElementById("rarity-info");
const factionSpan = document.getElementById("faction-info");
const guessSpan = document.getElementById("guess-info");
//#endregion

//#region global variables
let displayedCard;
let blurFactor;
let checkBoxesFlags = [false, false, false, false, false, false];
let globalData;
//#endregion

//#region Preparing variables
function api_connect(){
    fetch("https://api.gwent.one?key=data&response=json&linkart")
    .then(response => response.json())
    .then(data => {
        dataReady(data.response);
        createDataList();
    })
    .catch(error => {
        console.error(error);
    });
}

function dataReady(data){ 
    globalData = data;
    startButton.disabled = false;
};

function createDataList(){
    let values = [];
    for(let i=0; i< Object.keys(globalData).length; i++){
        values.push(globalData[i].name) 
    }   

    let dataList = document.createElement('datalist');
    dataList.id = "cards_list";
    
    values.forEach(value =>{
        let option = document.createElement('option');
        option.innerHTML = value;
        option.value = value;
        dataList.appendChild(option);
    })
    document.body.appendChild(dataList);
}

//#endregion

//#region Preparing the game
function startTheGame(){
    startButton.style.display = "none";
    rollCard();
    blurImage();
    addListnersAndEnableElements();
}

function addListnersAndEnableElements(){
    // Listeners
    increaseButton.addEventListener("click", increaseBlur)
    decreaseButton.addEventListener("click", decreaseBlur)
    for(let i = 0; i < checkBoxes.length; i++){
        let el = checkBoxes[i];
        el.addEventListener("click", checkBoxClick);
    }
    sendButton.addEventListener('click', sendGuess)
    input.addEventListener('focusin', function(){
        input.style.border = "solid rgb(0, 0, 0)"
    })

    // Enable elemenets
    decreaseButton.disabled = false;
    increaseButton.disabled = false;
    input.disabled = false;
    sendButton.disabled = false;
    for(let i = 0; i < checkBoxes.length; i++){
        let el = checkBoxes[i];
        el.disabled = false;
    }

    //re-roll button
    reRollButton.style.display = "block";
    reRollButton.addEventListener('click', rollCard)
}

//#endregion

//#region cycle functions of the game
function rollCard(){
    let id = randomizer(Object.keys(globalData).length);
    while(globalData[id].attributes.set == 'NonOwnable')
        id = randomizer(Object.keys(globalData).length)
    displayedCard = new Card(globalData[id]);
    displayedCard.setImage();
    resetInfo();
    console.log(id);
    console.log(globalData[id].name);
}

function randomizer(maxvalue){
    return Math.floor(Math.random() * maxvalue);
};

function resetInfo(){
    input.disabled = false;
    guessSpan.innerText = "";  
    input.value = "";
    input.style.border = "solid rgb(0, 0, 0)"
    blurFactor = 30;
    blurImage();
    checkBoxesFlags = [false, false, false, false, false, false];
    checkBoxesVisibility();
    for(let i = 0; i < checkBoxes.length; i++){
        let el = checkBoxes[i];
        el.checked = false;
    }
}

function sendGuess(){
    if(input.value == displayedCard.name){
        input.style.border = "solid rgb(144, 238, 144)"
        guessSpan.innerText = "Correct!";
        guessSpan.style.color = "rgb(144, 238, 144)"
        input.disabled = true;
    }else{
        input.style.border = "solid rgb(223, 32, 77)"
        input.value = "";
        guessSpan.innerText = "Incorrect!"
        guessSpan.style.color = "solid rgb(223, 32, 77)"
    };
}

//#endregion

//#region blur manipulation
function blurImage(){
    imgContainer.style.filter = 'blur('+ blurFactor + 'px)';
};

function increaseBlur(){
    if(blurFactor<50)
    blurFactor+=2;
    blurImage();
};

function decreaseBlur(){
    if(blurFactor>0)
        blurFactor-=2;
    blurImage();
};

//#endregion

//#region checkBoxes
function checkBoxClick(e){
    let id = e.target.dataset.id;
    checkBoxesFlag(id);
}

function checkBoxesFlag(id){
    if(checkBoxesFlags[id] == false)
        checkBoxesFlags[id] = true;
    else
        checkBoxesFlags[id] = false;
    checkBoxesVisibility();
}

function checkBoxesVisibility(){
    const visibilityArr = checkBoxesFlags.map(function(element){
        if(element == false)
            return "hidden"
        else{
            return "visible"
        }
    });
    factionSpan.style.visibility = visibilityArr[0];
    typeSpan.style.visibility = visibilityArr[1];
    raritySpan.style.visibility = visibilityArr[2];
    provisionSpan.style.visibility = visibilityArr[3];
    powerSpan.style.visibility = visibilityArr[4];
    armorSpan.style.visibility = visibilityArr[5];
}

//#endregion


api_connect()
startButton.addEventListener('click', startTheGame);