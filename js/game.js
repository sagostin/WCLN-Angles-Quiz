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
            "src": "img/questions/question1.png",
            "angle": "60 degrees",
            "rational": "Corresponding Angles (L-Rule)",
        },
        {
            "src": "img/questions/question2.png",
            "angle": "120 degrees",
            "rational": "Supplementary Angles",
        },
        {
            "src": "img/questions/question3.png",
            "angle": "120 degrees",
            "rational": "Co-interior Angles (C-Rule)",
        },
        {
            "src": "img/questions/question4.png",
            "angle": "60 degrees",
            "rational": "Alternate Angles (Z-Rule)",
        },
        {
            "src": "img/questions/question5.png",
            "angle": "60 degrees",
            "rational": "Opposite Angles",
        },
        {
            "src": "img/questions/question6.png",
            "angle": "60 degrees",
            "rational": "Co-interior Angles (C-Rule)",
        },
        {
            "src": "img/questions/question7.png",
            "angle": "120 degrees",
            "rational": "Opposite Angles",
        },
        {
            "src": "img/questions/question8.png",
            "angle": "60 degrees",
            "rational": "Supplementary Angles",
        },
        {
            "src": "img/questions/question9.png",
            "angle": "120 degrees",
            "rational": "Corresponding Angles (L-Rule)",
        },
        {
            "src": "img/questions/question10.png",
            "angle": "120 degrees",
            "rational": "Alternate Angles (Z-Rule)",
        }

    ]
};

/**
 * Fix angle text to prevent duplicate answers
 * also fix rational items for this
 *
 * Fix text box size to make it work better.
 *
 * add it to show the answer's image after you click check
 *
 */

//text
let angleText;
let rationalText;
let scoreText;
let correctText;
let incorrectText;

let answerBox = new createjs.Shape();
let rationalBox = new createjs.Shape();

// bitmap letiables
let background;
let checkButton;
let winScreen;
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
        },
        {
            src: "img/win-screen.png",
            id: "winscreen"
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
    if (event.item.id == "winscreen") {
        winScreen = new createjs.Bitmap(event.result);
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

    //rational box
    rationalBox.graphics.beginStroke("black");
    rationalBox.graphics.drawRect(60, 120, STAGE_WIDTH - 120, 45);
    stage.addChild(rationalBox);
    nextButton[1].x = STAGE_WIDTH / 2 + 100;
    nextButton[1].y = 128;

    //angle text
    angleText = new createjs.Text("Select Angle X", "24px Comic Sans MS", "#FFFFFF");
    angleText.textBaseline = "alphabetic";
    angleText.x = 65;
    angleText.y = 90;

    //rational text
    rationalText = new createjs.Text("Select Rational", "24px Comic Sans MS", "#FFFFFF");
    rationalText.textBaseline = "alphabetic";
    rationalText.x = 65;
    rationalText.y = 150;

    //correct text
    correctText = new createjs.Text("Correct!", "24px Comic Sans MS", "#FFFFFF");
    correctText.textBaseline = "alphabetic";
    correctText.x = STAGE_WIDTH / 2 - correctText.getMeasuredWidth() / 2;
    correctText.y = 200;

    //incorrect text;
    incorrectText = new createjs.Text("Incorrect!", "24px Comic Sans MS", "#FFFFFF");
    incorrectText.textBaseline = "alphabetic";
    incorrectText.x = STAGE_WIDTH / 2 - incorrectText.getMeasuredWidth() / 2;
    incorrectText.y = 200;

    if (!gameStarted) {
        nextButton[0].on("click", function (event) {
            changeAngleText(event);
        });
        nextButton[1].on("click", function (event) {
            changeRationalText(event);
        });

        winScreen.on("click", function (event) {
            winScreenClick(event);
        });
    }

    stage.addChild(nextButton[0]);
    stage.addChild(nextButton[1]);
    stage.addChild(angleText);
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

    var currentText = angleText.text.toString()

    if (angleClickCount >= json.questions.length) {
        angleClickCount = 0;
    }

    console.log(json.questions.length + " " + angleClickCount);

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

//reset the random number for the correct answer
function winScreenClick() {
    stage.removeChild(winScreen);
    stage.removeChild(scoreText);

    score = 0;

    loadQuestion(0);
    loadTextAndBoxes();
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

    if (questionNumber < json.questions.length - 1) {
        nextQuestion = questionNumber + 1;

        loadQuestion(nextQuestion);
        loadTextAndBoxes();
    } else {
        showWinScreen();
    }
}

function showWinScreen() {
    stage.addChild(winScreen);

    scoreText
        = new createjs.Text(score, "24px Comic Sans MS", "#5771b7");
    scoreText.textBaseline = "alphabetic";
    scoreText.x = STAGE_WIDTH / 2 + 60;
    scoreText.y = 248;

    stage.addChild(scoreText);
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
        score++;

        stage.addChild(correctText);
        createjs.Tween.get(correctText).to({alpha: 0}, 2000).call(removeCorrectText);

        resetChecks();
    } else {
        stage.addChild(incorrectText);
        createjs.Tween.get(incorrectText).to({alpha: 0}, 2000).call(removeIncorrectText);
    }
}

function removeIncorrectText() {
    stage.removeChild(incorrectText);
    //incorrect text;
    incorrectText = new createjs.Text("Incorrect!", "24px Comic Sans MS", "#FFFFFF");
    incorrectText.textBaseline = "alphabetic";
    incorrectText.x = STAGE_WIDTH / 2 - incorrectText.getMeasuredWidth() / 2;
    incorrectText.y = 200;
}

function removeCorrectText() {
    stage.removeChild(correctText);
    //correct text
    correctText = new createjs.Text("Correct!", "24px Comic Sans MS", "#FFFFFF");
    correctText.textBaseline = "alphabetic";
    correctText.x = STAGE_WIDTH / 2 - correctText.getMeasuredWidth() / 2;
    correctText.y = 200;
}