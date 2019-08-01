/**
 * WCLN.ca
 * Hockey Matchup
 * @author Shaun Agostinho (shaunagostinho@gmail.com)
 * July 2019
 */

let FPS = 24;
let gameStarted = false;
let STAGE_WIDTH, STAGE_HEIGHT;
let stage = new createjs.Stage("gameCanvas"); // canvas id is gameCanvas

let score = 0;
let level = 0;
let question = 0;

let numbers = [];
let numbersOrder = [];

let clickedPylon;

let levelText;
let questionText;
let scoreText;

// bitmap letiables
let background;
let logo;

let pylons = [];
let pylonText = [];
let numberBoxes = [];

let hockeypuck;
let checkbutton;

let winscreen;

/*
 * Called by body onload
 */
function init() {
    STAGE_WIDTH = parseInt(document.getElementById("gameCanvas").getAttribute("width"));
    STAGE_HEIGHT = parseInt(document.getElementById("gameCanvas").getAttribute("height"));

    // init state object
    stage.mouseEventsEnabled = true;
    stage.enableMouseOver(); // Default, checks the mouse 20 times/second for hovering cursor changes

    setupManifest(); // preloadJS
    startPreload();

    score = 0; // reset game score
    gameStarted = false;

    stage.update();
}

/*
 * Displays the end game screen and score.
 */
function endGame() {
    gameStarted = false;
}

function setupManifest() {
    manifest = [
        {
            src: "img/bg.png",
            id: "background"
        },
        {
            src: "img/logo.png",
            id: "logo"
        },
        {
            src: "img/pylon.png",
            id: "pylon"
        },
        {
            src: "img/number-box.png",
            id: "number-box"
        },
        {
            src: "img/hockey-puck.png",
            id: "hockey-puck"
        },
        {
            src: "img/check-button.png",
            id: "check-button"
        },
        {
            src: "img/win-screen.png",
            id: "win-screen"
        }
    ];
}

function startPreload() {
    let preload = new createjs.LoadQueue(true);
    preload.installPlugin(createjs.Sound);
    preload.on("fileload", handleFileLoad);
    preload.on("progress", handleFileProgress);
    preload.on("complete", loadComplete);
    preload.on("error", loadError);
    preload.loadManifest(manifest);
}

// not currently used as load time is short
function handleFileProgress(event) {
    /*progressText.text = (preload.progress*100|0) + " % Loaded";
    progressText.x = STAGE_WIDTH/2 - progressText.getMeasuredWidth() / 2;
    stage.update();*/
}

function handleFileLoad(event) {
    console.log("A file has loaded of type: " + event.item.type);
    // create bitmaps of images
    if (event.item.id == "background") {
        background = new createjs.Bitmap(event.result);
    }
    if (event.item.id == "logo") {
        logo = new createjs.Bitmap(event.result);
    }
    if (event.item.id == "check-button") {
        checkbutton = new createjs.Bitmap(event.result);
    }
    if (event.item.id == "pylon") {
        for (let i = 0; i < 5; i++) {
            pylons.push(new createjs.Bitmap(event.result));
        }
    }
    if (event.item.id == "number-box") {
        for (let i = 0; i < 5; i++) {
            numberBoxes.push(new createjs.Bitmap(event.result));
        }
    }
    if (event.item.id == "hockey-puck") {
        hockeypuck = new createjs.Bitmap(event.result);
    }
    if (event.item.id == "win-screen") {
        winscreen = new createjs.Bitmap(event.result);
    }
}

function loadError(evt) {
    console.log("Error!", evt.text);
}

/*
 * Displays the start screen.
 */
function loadComplete(event) {
    console.log("Finished Loading Assets");

    createjs.Ticker.setFPS(FPS);
    createjs.Ticker.addEventListener("tick", update); // call update function

    stage.addChild(background);
    stage.addChild(logo);

    generateNumbers();
    initGraphics();
}

/**
 * Get a random number based on max.
 *
 * @param max
 * @returns {number}
 */

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

/**
 * Generate the random numbers for the
 * game and make sure there isn't duplicates.
 *
 */
function generateNumbers() {
    while (numbers.length < 5) {
        let max = level * 10 + 10;

        let number = getRandomInt(max);
        if (!numbers.includes(number)) {
            numbers.push(number);
        }
    }
}

/**
 * Respawn all the hockey pucks.
 *
 */
function resetHockeyPuck() {
    hockeypuck.x = 590;
    hockeypuck.y = 510;
    hockeypuck.scaleX = 0.05;
    hockeypuck.scaleY = 0.05;

    stage.addChild(hockeypuck);
}

/**
 * Load the pylons, and boxes (only if not ingame)
 *
 */
function initGraphics() {

    levelText = new createjs.Text("Level: " + (level + 1), "32px Arial", "#FFFFFF");
    levelText.textBaseline = "alphabetic";
    levelText.align = "center";
    levelText.x = 650;
    levelText.y = 50;

    stage.addChild(levelText);

    questionText = new createjs.Text("Question: " + (question + 1), "32px Arial", "#FFFFFF");
    questionText.align = "center";
    questionText.textBaseline = "alphabetic";
    questionText.x = 625;
    questionText.y = 75;

    stage.addChild(questionText);

    scoreText = new createjs.Text("Score: " + (score) + "/" + ((level + 1) * (5)), "32px Arial", "#FFFFFF");
    scoreText.align = "center";
    scoreText.textBaseline = "alphabetic";
    scoreText.x = 25;
    scoreText.y = 575;

    stage.addChild(scoreText);

    if (!gameStarted) {
        for (let i = 0; i < numberBoxes.length; i++) {
            numberBoxes[i].scaleX = 2;
            numberBoxes[i].scaleY = 2;
            numberBoxes[i].y = 425;

            switch (i) {
                case 0:
                    numberBoxes[i].x = (STAGE_WIDTH / 2) - (numberBoxes[i].image.width * (6));
                    break;
                case 1:
                    numberBoxes[i].x = (STAGE_WIDTH / 2) - (numberBoxes[i].image.width * (4)) + (numberBoxes[i].image.width / 1.5);
                    break;
                case 2:
                    //                     //CENTER
                    numberBoxes[i].x = (STAGE_WIDTH / 2) - (numberBoxes[i].image.width);
                    break;
                case 3:
                    numberBoxes[i].x = (STAGE_WIDTH / 2) + (numberBoxes[i].image.width * (2)) - (numberBoxes[i].image.width / 1.5);
                    break;
                case 4:
                    numberBoxes[i].x = (STAGE_WIDTH / 2) + (numberBoxes[i].image.width * (4));
                    break;
            }
            stage.addChild(numberBoxes[i]);
        }
    }

    for (let i = 0; i < pylons.length; i++) {
        pylons[i].scaleX = 0.2;
        pylons[i].scaleY = 0.2;
        pylonText[i] = new createjs.Text(numbers[i] + "", "50px Arial", "#FFFFFF");
        pylonText[i].textAlign = "center";
        pylonText[i].textBaseline = "alphabetic";

        switch (i) {
            case 0:
                pylons[i].x = (STAGE_WIDTH / 2) - ((pylons[i].image.width * pylons[i].scaleX / 2) * (6)) + ((pylons[i].image.width * pylons[i].scaleX / 2) / 1.5);
                pylons[i].y = 250;
                pylonText[i].x = (STAGE_WIDTH / 2) - ((pylons[i].image.width * pylons[i].scaleX / 2) * (4)) - 20;
                pylonText[i].y = 350 + 60;
                break;
            case 1:
                pylons[i].x = (STAGE_WIDTH / 2) - ((pylons[i].image.width * pylons[i].scaleX / 2) * (4)) + ((pylons[i].image.width * pylons[i].scaleX / 2) / 1.5);
                pylons[i].y = 225;
                pylonText[i].x = (STAGE_WIDTH / 2) - ((pylons[i].image.width * pylons[i].scaleX / 2) * (2)) - 20;
                pylonText[i].y = 325 + 60;
                break;
            case 2:
                //CENTER
                pylons[i].x = (STAGE_WIDTH / 2) - (pylons[i].image.width * pylons[i].scaleX / 2);
                pylons[i].y = 200;
                pylonText[i].x = (STAGE_WIDTH / 2);
                pylonText[i].y = 300 + 60;
                break;
            case 3:
                pylons[i].x = (STAGE_WIDTH / 2) + ((pylons[i].image.width * pylons[i].scaleX / 2) * (2)) - ((pylons[i].image.width * pylons[i].scaleX / 2) / 1.5);
                pylons[i].y = 225;
                pylonText[i].x = (STAGE_WIDTH / 2) + ((pylons[i].image.width * pylons[i].scaleX / 2) * (2)) + 20;
                pylonText[i].y = 325 + 60;
                break;
            case 4:
                pylons[i].x = (STAGE_WIDTH / 2) + ((pylons[i].image.width * pylons[i].scaleX / 2) * (4)) - ((pylons[i].image.width * pylons[i].scaleX / 2) / 1.5);
                pylons[i].y = 250;
                pylonText[i].x = (STAGE_WIDTH / 2) + ((pylons[i].image.width * pylons[i].scaleX / 2) * (4)) + 20;
                pylonText[i].y = 350 + 60;
                break;
        }
        pylons[i].on("click", function (event) {
            pylonClickHandler(event);
        });
        stage.addChild(pylonText[i]);
        stage.addChild(pylons[i]);
    }

    if (!gameStarted) {
        checkbutton.y = 510;
        checkbutton.x = (STAGE_WIDTH / 2) - (checkbutton.image.width / 2);
        checkbutton.on("click", function (event) {
            checkNumbers(event);
        });

        stage.addChild(checkbutton);
    }

    resetHockeyPuck();

    gameStarted = true;
}

/**
 * Check button (check if numbers are sorted, if they are reload the stage with pylons and add to the question count)
 *
 * @param event
 */
function checkNumbers(event) {
    if (numbersOrder.length >= 5) {
        if (isSorted(numbersOrder)) {

            console.log("numbers are in order.");

            numbersOrder = [];
            numbers = [];
            clickedPylon = null;

            for (let i = 0; i < pylonText.length; i++) {
                stage.removeChild(pylonText[i]);
            }

            stage.removeChild(levelText);
            stage.removeChild(questionText);
            stage.removeChild(scoreText);

            pylonText = [];
            boxCount = 0;

            score++;

            gameStarted = false;
            generateNumbers();
            initGraphics();

            if (question < 3) {
                question++;
            } else {
                question = 0;
                if (level < 2) {
                    level++;
                } else {
                    winscreen.y = 200;
                    winscreen.x = (STAGE_WIDTH / 2) - (winscreen.image.width / 2);
                    winscreen.on("click", function (event) {
                        removeWinScreen(event);
                    });
                    stage.addChild(winscreen);
                }
            }
        } else {
            console.log("numbers are not in order.");

            numbersOrder = [];
            numbers = [];
            clickedPylon = null;

            for (let i = 0; i < pylonText.length; i++) {
                stage.removeChild(pylonText[i]);
            }

            stage.removeChild(levelText);
            stage.removeChild(questionText);
            stage.removeChild(scoreText);

            pylonText = [];
            boxCount = 0;

            gameStarted = false;
            generateNumbers();
            initGraphics();
        }
    }

    stage.removeChild(hockeypuck);
    resetHockeyPuck();

    //stage.removeChild(event.target);
}

function removeWinScreen() {
    gameStarted = false;

    stage.removeChild(winscreen);

    score = 0;
    level = 0;
    question = 0;

    numbersOrder = [];
    numbers = [];
    clickedPylon = null;

    for (let i = 0; i < pylonText.length; i++) {
        stage.removeChild(pylonText[i]);
    }

    stage.removeChild(levelText);
    stage.removeChild(questionText);
    stage.removeChild(scoreText);

    pylonText = [];
    boxCount = 0;

    generateNumbers();
    initGraphics();
}

/**
 * Pylon click handler
 *
 * @param event
 */
function pylonClickHandler(event) {
    //event.target.x = event.stageX;
    //event.target.y = event.stageY;

    if (pylons.includes(event.target)) {
        for (let i = 0; i < pylons.length; i++) {
            if (pylons[i] == event.target) {
                if (clickedPylon == null) {
                    numbersOrder.push(parseInt(pylonText[i].text.toString()));
                    //stage.removeChild(pylonText[i]);
                    clickedPylon = i;

                    // Move the hockey puck to the pylon which was clicked.
                    createjs.Tween.get(hockeypuck).to({
                        x: pylons[clickedPylon].x,
                        y: pylons[clickedPylon].y
                    }, 500).call(hockeyPuckAnimate);

                    break;
                }
            }
        }
    }
}

/**
 * Update the stage. (Tween Ticker)
 *
 * @param event
 */

function update(event) {
    stage.update(event);
}

/**
 * Animate the hockey puck
 */

let boxCount = 0;

function hockeyPuckAnimate() {

    //TODO fix these errors.
    pylonText[clickedPylon].x = numberBoxes[boxCount].x + (numberBoxes[boxCount].image.width);
    pylonText[clickedPylon].y = numberBoxes[boxCount].y + (numberBoxes[boxCount].image.height * 1.5);
    pylonText[clickedPylon].color = "black";
    stage.removeChild(pylons[clickedPylon]);

    clickedPylon = null;
    boxCount++;

    stage.removeChild(hockeypuck);
    resetHockeyPuck();
    //Tween complete
}

/**
 * Check if an array is sorted by number (lowest to highest)
 *
 * @param arr
 * @returns {boolean}
 */

function isSorted(arr) {
    const limit = arr.length - 1;
    return arr.every((_, i) => (i < limit ? arr[i] <= arr[i + 1] : true));
}