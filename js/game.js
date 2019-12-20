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
            "answer": "img/questions/question1A.png",
            "angle": "60 degrees",
            "rational": "Corresponding Angles (F-Rule)",
        },
        {
            "src": "img/questions/question2.png",
            "answer": "img/questions/question2A.png",
            "angle": "120 degrees",
            "rational": "Supplementary Angles",
        },
        {
            "src": "img/questions/question3.png",
            "answer": "img/questions/question3A.png",
            "angle": "120 degrees",
            "rational": "Co-interior Angles (C-Rule)",
        },
        {
            "src": "img/questions/question4.png",
            "answer": "img/questions/question4A.png",
            "angle": "60 degrees",
            "rational": "Alternate Angles (Z-Rule)",
        },
        {
            "src": "img/questions/question5.png",
            "answer": "img/questions/question5A.png",
            "angle": "60 degrees",
            "rational": "Opposite Angles",
        },
        {
            "src": "img/questions/question6.png",
            "answer": "img/questions/question6A.png",
            "angle": "60 degrees",
            "rational": "Co-interior Angles (C-Rule)",
        },
        {
            "src": "img/questions/question7.png",
            "answer": "img/questions/question7A.png",
            "angle": "120 degrees",
            "rational": "Opposite Angles",
        },
        {
            "src": "img/questions/question8.png",
            "answer": "img/questions/question8A.png",
            "angle": "60 degrees",
            "rational": "Supplementary Angles",
        },
        {
            "src": "img/questions/question9.png",
            "answer": "img/questions/question9A.png",
            "angle": "120 degrees",
            "rational": "Corresponding Angles (L-Rule)",
        },
        {
            "src": "img/questions/question10.png",
            "answer": "img/questions/question10A.png",
            "angle": "120 degrees",
            "rational": "Alternate Angles (Z-Rule)",
        }

    ]
};

let fake = {angles: ["30 degrees", "90 degrees"]}

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
let answerImg = [];
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
        },
        {
            src: "img/incorrect-screen.png",
            id: "incorrect"
        },
        {
            src: "img/correct-screen.png",
            id: "correct"
        }
    ];

    let count = 0;
    for (i in json.questions) {
        manifest.push({src: json.questions[i].src, id: "question" + count});
        manifest.push({src: json.questions[i].answer, id: "answer" + count});
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

let incorrectScreen;
let correctScreen;

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
    if (event.item.id.startsWith("answer")) {
        answerImg.push(new createjs.Bitmap(event.result));
    }

    if (event.item.id.startsWith("incorrect")) {
        incorrectScreen = new createjs.Bitmap(event.result);
    }
    if (event.item.id.startsWith("correct")) {
        correctScreen = new createjs.Bitmap(event.result);
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

    //angle text
    angleText = new createjs.Text("Select Angle X", "24px Comic Sans MS", "#FFFFFF");
    angleText.textBaseline = "alphabetic";
    angleText.x = 65;
    angleText.y = 90 + 40;

    //rational text
    rationalText = new createjs.Text("Select Rational", "24px Comic Sans MS", "#FFFFFF");
    rationalText.textBaseline = "alphabetic";
    rationalText.x = 65;
    rationalText.y = 150 + 70;

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

        correctScreen.on("click", function (event) {
            nextQuestionClick(event);
        });

        incorrectScreen.on("click", function (event) {
            nextQuestionClick(event);
        });

        answerBox.alpha = 0.5;
        rationalBox.alpha = 0.5;

        answerBox.graphics.beginStroke("black");
        answerBox.graphics.beginFill("#465F99");
        answerBox.graphics.drawRect(60, 60 + 40, STAGE_WIDTH - 120, 45);
        nextButton[0].x = STAGE_WIDTH / 2 + 100;
        nextButton[0].y = 68 + 40;

        //rational box
        rationalBox.graphics.beginStroke("black");
        rationalBox.graphics.beginFill("#465F99");
        rationalBox.graphics.drawRect(60, 120 + 70, STAGE_WIDTH - 120, 45);
        nextButton[1].x = STAGE_WIDTH / 2 + 100;
        nextButton[1].y = 128 + 70;
    }

    stage.addChild(answerBox);
    stage.addChild(rationalBox);

    stage.addChild(nextButton[0]);
    stage.addChild(nextButton[1]);
    stage.addChild(angleText);
    stage.addChild(rationalText);

    for (let i = 0; i < json.questions.length; i++) {
        if (!possibleAngles.includes(json.questions[i].angle)) {
            possibleAngles.push(json.questions[i].angle)
        }

        if (!possibleRationals.includes(json.questions[i].rational)) {
            possibleRationals.push(json.questions[i].rational)
        }
    }

    for (let i = 0; i < fake.angles.length; i++) {
        if (!possibleAngles.includes(fake.angles[i])) {
            possibleAngles.push(fake.angles[i])
        }
    }
}

/**
 * Change the text for the angle option based on the current selected option.
 *
 * @type {number}
 */
let angleClickCount = 0;
function changeAngleText() {
    stage.removeChild(angleText);

    if (angleClickCount >= possibleAngles.length) {
        angleClickCount = 0;
    }

    console.log(json.questions.length + " " + angleClickCount);

    angleText = new createjs.Text(possibleAngles[angleClickCount], "24px Comic Sans MS", "#FFFFFF");
        angleText.textBaseline = "alphabetic";
        angleText.x = 65;
    angleText.y = 90 + 40;

    angleClickCount++;

    stage.addChild(angleText);
}

/**
 * Change the rational option based on the current selected one.
 *
 * @type {number}
 */
let rationalClickCount = 0;
function changeRationalText() {
    stage.removeChild(rationalText);

    if (rationalClickCount >= possibleRationals.length) {
        rationalClickCount = 0;
    }

    let textSize = 24

    let fakeTextForSizing = new createjs.Text(possibleRationals[rationalClickCount], textSize + "px Comic Sans MS", "#FFFFFF");
    while (fakeTextForSizing.getMeasuredWidth() >= 230) {
        textSize -= 1;
        fakeTextForSizing = new createjs.Text(possibleRationals[rationalClickCount], textSize + "px Comic Sans MS", "#FFFFFF");
    }
    //textSize -= 1;
    rationalText = new createjs.Text(possibleRationals[rationalClickCount], textSize + "px Comic Sans MS", "#FFFFFF");
    rationalText.textBaseline = "alphabetic";
    rationalText.x = 65;
    rationalText.y = 150 + 70;

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
        questionImg[number].y = 300;
        stage.addChild(questionImg[number]);

        questionNumber = number;
    } else {
        console.error("number out of bounds");
    }
}

function loadAnswerImage(number) {
    let count = json.questions.length;

    if (!(number >= count)) {
        answerImg[number].x = STAGE_WIDTH / 2 - (answerImg[number].image.width / 2);
        answerImg[number].y = 300;
        stage.addChild(answerImg[number]);
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
        = new createjs.Text(score + "/" + json.questions.length, "24px Comic Sans MS", "#5771b7");
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

    if ((angleText.text.toString() == json.questions[questionNumber].angle) && (rationalText.text.toString() == json.questions[questionNumber].rational)) {
        console.log("correct!");
        score++;

        //TODO display correct screen & show correct answer

        correctScreen.alpha = 0;
        stage.addChild(correctScreen);
        createjs.Tween.get(correctScreen).to({alpha: 1}, 1000);

        loadAnswerImage(questionNumber);
    } else {
        //TODO display incorrect screen & show correct answer

        incorrectScreen.alpha = 0;
        stage.addChild(incorrectScreen);
        createjs.Tween.get(incorrectScreen).to({alpha: 1}, 1000);
        loadAnswerImage(questionNumber);
    }
}

function nextQuestionClick(event) {
    stage.removeChild(event.target)
    event.target.alpha = 1.0;

    resetChecks();
}
