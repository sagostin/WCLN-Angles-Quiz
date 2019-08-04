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

let questionNumber = 0;

//question storage and such
let json = {
    "questions": [
        {
            "src": "img/questions/example1.png",
            "angle": "55 degrees",
            "rational": "Lines are parallel",
        },
        {
            "src": "img/questions/example2.png",
            "angle": "66 degrees",
            "rational": "Lines are parallel 2",
        },
        {
            "src": "img/questions/example3.png",
            "angle": "77 degrees",
            "rational": "Lines are parallel 3",
        }
    ]
};

let fakeAnswersAngles = ["test 1", "test 2", "oof"];
let fakeAnswersRational = ["test 1 - 2", "test 2 - 2", "iosdjan"];

//text
let angleText;
let rationalText;

let answerBox = new createjs.Shape();
let rationalBox = new createjs.Shape();

// bitmap letiables
let background;
let checkButton;
let questionImg = [];
let nextButton = [];

var imageContainer = new createjs.Shape();

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
            src: "img/check-button.png",
            id: "check-button"
        },
        {
            src: "img/next.png",
            id: "nextbutton"
        }
    ];

    let count = 0;
    for (i in json.questions) {
        manifest.push({src: json.questions[i].src, id: "question" + count});
        count++;
        console.log(json.questions[i].src);
    }
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
    if (event.item.id == "check-button") {
        checkButton = new createjs.Bitmap(event.result);
    }
    if (event.item.id == "nextbutton") {
        nextButton.push(new createjs.Bitmap(event.result));
        nextButton.push(new createjs.Bitmap(event.result));
    }
    if (event.item.id.startsWith("question")) {
        questionImg.push(new createjs.Bitmap(event.result));
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

    initGraphics();
}

/**
 * Load the basic stuff
 *
 */
function initGraphics() {
    imageContainer.graphics.beginStroke("#5771b7");
    imageContainer.graphics.beginFill("#ffffff");
    imageContainer.graphics.drawRect(40, 300, STAGE_WIDTH - 80, 240);
    stage.addChild(imageContainer);

    checkButton.x = STAGE_WIDTH / 2 - (checkButton.image.width / 2);
    checkButton.y = 240;
    checkButton.on("click", function (event) {
        checkButtonClick(event);
    });
    stage.addChild(checkButton);

    loadQuestion(0);
    loadTextAndBoxes();

    gameStarted = true;
}

/**
 *  Load the text and boxes
 */

let possibleAngles = [];
let possibleRationals = [];
let angleTextNum = getRandomInt(json.questions.length);
let rationalTextNum = getRandomInt(json.questions.length);

function loadTextAndBoxes() {
    //angle box
    answerBox.graphics.beginStroke("black");
    answerBox.graphics.drawRect(60, 60, STAGE_WIDTH - 120, 45);
    stage.addChild(answerBox);

    nextButton[0].x = STAGE_WIDTH / 2 + 100;
    nextButton[0].y = 68;
    stage.addChild(nextButton[0]);
    nextButton[0].on("click", function (event) {
        changeAngleText(event);
    });

    //rational box
    rationalBox.graphics.beginStroke("black");
    rationalBox.graphics.drawRect(60, 120, STAGE_WIDTH - 120, 45);
    stage.addChild(rationalBox);
    nextButton[1].x = STAGE_WIDTH / 2 + 100;
    nextButton[1].y = 128;

    nextButton[1].on("click", function (event) {
        changeRationalText(event);
    });
    stage.addChild(nextButton[1]);

    //angle text
    angleText = new createjs.Text("Select Angle X", "24px Comic Sans MS", "#FFFFFF");
    angleText.textBaseline = "alphabetic";
    angleText.x = 65;
    angleText.y = 90;
    stage.addChild(angleText);

    //rational text
    rationalText = new createjs.Text("Select Rational", "24px Comic Sans MS", "#FFFFFF");
    rationalText.textBaseline = "alphabetic";
    rationalText.x = 65;
    rationalText.y = 150;
    stage.addChild(rationalText);

    for (let i = 0; i < json.questions.length; i++) {
        if (i == angleTextNum) {
            possibleAngles.push(questionNumber);
        } else {
            if (i == questionNumber) {
                possibleAngles.push(angleTextNum);
            } else {
                possibleAngles.push(i);
            }
        }

        if (i == rationalTextNum) {
            possibleRationals
                .push(questionNumber);
        } else {
            if (i == questionNumber) {
                possibleRationals.push(rationalTextNum);
            } else {
                possibleRationals.push(i);
            }
        }
    }
}
let angleClickCount = 0;
function changeAngleText() {
    stage.removeChild(angleText);

    if (angleClickCount >= json.questions.length) {
        angleClickCount = 0;
    }
    angleText = new createjs.Text(json.questions[possibleAngles[angleClickCount]].angle, "24px Comic Sans MS", "#FFFFFF");
        angleText.textBaseline = "alphabetic";
        angleText.x = 65;
        angleText.y = 90;

    angleClickCount++;

    stage.addChild(angleText);
}

//reset the random number for the correct answer
let rationalClickCount = 0;
function changeRationalText() {
    stage.removeChild(rationalText);

    if (rationalClickCount >= json.questions.length) {
        rationalClickCount = 0;
    }
    rationalText = new createjs.Text(json.questions[possibleRationals[rationalClickCount]].rational, "24px Comic Sans MS", "#FFFFFF");
    rationalText.textBaseline = "alphabetic";
    rationalText.x = 65;
    rationalText.y = 150;

    rationalClickCount++;

    stage.addChild(rationalText);
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

/**
 * Load the image for the question
 *
 * @param number
 */

function loadQuestion(number) {
    let count = json.questions.length;

    if (!(number >= count)) {
        questionImg[number].x = STAGE_WIDTH / 2 - (questionImg[number].image.width / 2);
        questionImg[number].y = 335;
        stage.addChild(questionImg[number]);

        questionNumber = number;
    } else {
        console.error("number out of bounds");
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

function resetChecks() {
    rationalClickCount = 0;
    angleClickCount = 0;
    possibleRationals = [];
    possibleAngles = [];

    rationalTextNum = getRandomInt(json.questions.length);
    angleTextNum = getRandomInt(json.questions.length);

    stage.removeChild(rationalText);
    stage.removeChild(answerBox);
    stage.removeChild(nextButton[0]);
    stage.removeChild(rationalBox);
    stage.removeChild(nextButton[1]);
    stage.removeChild(angleText);

    stage.removeChild(questionImg[questionNumber]);

    nextQuestion = questionNumber;
    if (nextQuestion < json.questions.length) {
        nextQuestion = questionNumber + 1;
    } else {
        //TODO win message
    }

    loadQuestion(nextQuestion);
    loadTextAndBoxes();
}

/**
 * Pylon click handler
 *
 * @param event
 */
function checkButtonClick(event) {
    //event.target.x = event.stageX;
    //event.target.y = event.stageY;

    if (((rationalClickCount - 1) == rationalTextNum) && ((angleClickCount - 1) == angleTextNum)) {
        console.log("correct!");

        resetChecks();
    }
}