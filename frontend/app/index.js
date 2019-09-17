// An example three.js project, a spinning cube


// create our basic constructs
let scene; //initialised later
let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 20000);
let renderer = new THREE.WebGLRenderer({ antialias: true });
let ui;
let listener = new THREE.AudioListener();
camera.add(listener);

//Create a DirectionalLight and turn on shadows for the light
let light = new THREE.DirectionalLight(0xffffff, 0.75);
light.castShadow = true;            // default false
light.position.set(0, 0.5, 1);

let pointLight = new THREE.PointLight(0xffffff, 1, 5000, 2);


let ambientLight = new THREE.AmbientLight(0xffffff);
ambientLight.intensity = 0.5;


//Game Objects
let ball;
let platforms = [];
let boxes = [];
let collectibles = [];

//Textures
let textureBall;
let texturePlatform;
let textureBox;
let textureCollectible;

//Sounds
let sndMusic = new THREE.Audio(listener);
let sndCollect = new THREE.Audio(listener);
let sndHit = new THREE.Audio(listener);

//UI
let lifeIcons = [];
let playButton;
let soundButton;
let imgSoundOff, imgSoundOn;
let leaderboardButton;
let title;
let instructions = [];
let instructionsText = [];
let scoreText;

//Global Variables
let mouseX = 0;
let mouseY = 0;
let gameOver = true;
let globalSpeedIncreasePeriod = 10;
let globalSpeedIncreaseTimer = globalSpeedIncreasePeriod;
let globalSpeedMin = 30;
let globalSpeedMax = 75;
let globalSpeed = globalSpeedMin;
let globalSpeedIncrease = 5;
let ballSize = 128;
let leftBound = -ballSize * 7.5;
let rightBound = ballSize * 7.5;
let font = Koji.config.strings.font;
let score = 0;
let requestID; //Should be used later for cancelling animation frames
let renderUI = true;
let inGame = true;
let platformCount = 0;
let touching = false;
let usingKeyboard = false;
let soundEnabled = true;

//Game settings
let scoreGain = parseInt(Koji.config.strings.scoreGain);
let startingLives = parseInt(Koji.config.strings.lives);
let lives = startingLives;

//Time stuff
clock = new THREE.Clock();


function preload() {

    AssetLoader.add.image(Koji.config.images.life);
    AssetLoader.add.image(Koji.config.images.soundOff);
    AssetLoader.add.image(Koji.config.images.soundOn);


    // Set a progress listener, can be used to create progress bars
    AssetLoader.progressListener = function (progress) {
        console.info('Progress: ' + (progress * 100) + '%');
    };

    // load a sound and set it as the Audio object's buffer
    var audioLoader = new THREE.AudioLoader();
    audioLoader.load(Koji.config.sounds.backgroundMusic, function (buffer) {
        sndMusic.setBuffer(buffer);
        sndMusic.setLoop(true);
        sndMusic.setVolume(0.25);
        sndMusic.play();
    });

    audioLoader.load(Koji.config.sounds.collect, function (buffer) {
        sndCollect.setBuffer(buffer);
    });

    audioLoader.load(Koji.config.sounds.hit, function (buffer) {
        sndHit.setBuffer(buffer);
    });

    // Load, and start game when done
    AssetLoader.load(function () { // This function is called when all assets are loaded
        // Initialize the game
        setup();

    });
}

//Setup the game after loading
function setup() {



    initiateScene();

    // setup our renderer and add it to the DOM
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    document.body.style.fontFamily = font;

    camera.position.z = 1000;
    camera.position.y = 500;

    //Load textures
    textureBall = new THREE.TextureLoader().load(Koji.config.images.ball);
    texturePlatform = new THREE.TextureLoader().load(Koji.config.images.platform);
    textureBox = new THREE.TextureLoader().load(Koji.config.images.box);
    textureCollectible = new THREE.TextureLoader().load(Koji.config.images.collectible);

    texturePlatform.wrapS = THREE.RepeatWrapping;
    texturePlatform.wrapT = THREE.RepeatWrapping;
    texturePlatform.repeat.set(4, 2);


    if (!ui) {
        loadUI();
    }


    document.addEventListener("keydown", handleInputDown, false);
    document.addEventListener("keyup", handleInputUp, false);

    document.onmousemove = function (e) {
        mouseX = e.pageX;
        mouseY = e.pageY;
    }

    document.addEventListener('touchstart', function (e) {
        onMouseDown(e);
    }, false);
    document.addEventListener('touchend', function (e) {
        onMouseUp(e);
    }, false);


    //Start rendering the game
    render();

    updateLives();

}

function onMouseDown(e) {
    mouseX = e.changedTouches[0].pageX;
    mouseY = e.changedTouches[0].pageY;

    touching = true;
    usingKeyboard = false;
}

function onMouseUp(e) {

    touching = false;
    usingKeyboard = false;
}

function loadUI() {
    //Load UI
    // Create a UI of 720 pixels high
    // will scale up to match renderer.domElement's size
    ui = new ThreeUI(renderer.domElement, 720);
    for (let i = 0; i < startingLives; i++) {
        let size = 48;
        lifeIcons[i] = ui.createSprite(Koji.config.images.life);
        lifeIcons[i].x = 5 + i * size;
        lifeIcons[i].y = 5;
        lifeIcons[i].pivot.x = 0;
        lifeIcons[i].pivot.y = 0;

        lifeIcons[i].width = size;
        lifeIcons[i].height = size;
    }

    playButton = new Button(Koji.config.strings.playButtonText, 0);
    soundButton = new SoundButton();
    leaderboardButton = new Button("LEADERBOARD", 1);

    playButton.rectangle.onClick(function () {
        if (gameOver) {
            init();
        }


    });

    soundButton.rectangle.onClick(function () {
        toggleSound();
    });

    leaderboardButton.rectangle.onClick(function () {
        if(gameOver){
            openLeaderboard();
        }
        
    })

    //Title
    let titleSize = 128;
    title = ui.createText(Koji.config.strings.title, titleSize, font, Koji.config.colors.titleColor);
    title.y = window.innerHeight * 0.05 + titleSize * 0.5;

    title.textAlign = 'center';
    //title.textVerticalAlign = 'top';
    title.anchor.x = ThreeUI.anchors.center;
    title.anchor.y = ThreeUI.anchors.top;

    while (titleSize * title.text.length * 0.8 > window.innerWidth) {

        titleSize *= 0.99;
        title.size = titleSize;
        title.y = window.innerHeight * 0.05 + titleSize * 0.5;

    }

    //Instructions
    let instructionsSize;
    let instructionsColor = Koji.config.colors.instructionsColor;
    instructionsText[0] = Koji.config.strings.instructions1;
    instructionsText[1] = Koji.config.strings.instructions2;
    instructionsText[2] = Koji.config.strings.instructions3;

    instructionsSize = 32;
    for (let i = 0; i < instructionsText.length; i++) {

        instructions[i] = ui.createText(instructionsText[i], instructionsSize, font, instructionsColor);
        instructions[i].y = title.y + titleSize * 0.75 + i * instructionsSize + (i * instructionsSize * 0.75);

        instructions[i].textAlign = 'center';
        //title.textVerticalAlign = 'top';
        instructions[i].anchor.x = ThreeUI.anchors.center;
        instructions[i].anchor.y = ThreeUI.anchors.top;

        while (instructionsSize * instructions[i].text.length * 0.8 > window.innerWidth * 0.9) {

            instructionsSize *= 0.99;
            instructions[i].size = instructionsSize;
            instructions[i].y = title.y + titleSize * 0.75 + i * instructionsSize + (i * instructionsSize * 0.75);

        }
    }


    scoreText = ui.createText("0", 48, font, Koji.config.colors.scoreColor);
    scoreText.textAlign = 'right';
    scoreText.anchor.x = ThreeUI.anchors.right;
    scoreText.anchor.y = ThreeUI.anchors.top;
    scoreText.x = 10;
    scoreText.y = 50;
    scoreText.visible = false;


}


//Start the game
function init() {

    gameOver = false;

    boxes = [];
    platforms = [];
    collectibles = [];

    score = 0;

    lives = startingLives;

    platformCount = 0;

    updateLives();

    globalSpeed = globalSpeedMin;


    ball = new Ball(0, ballSize + 16, 0);
    platforms.push(new Platform(0, 0, 0));

    playButton.rectangle.visible = false;
    leaderboardButton.rectangle.visible = false;
    title.visible = false;
    for (let i = 0; i < instructions.length; i++) {
        instructions[i].visible = false;
    }

    scoreText.visible = true;

    pointLight.position.set(ball.mesh.position.x, ball.mesh.position.y, ball.mesh.position.z);


}

function initiateScene() {


    scene = new THREE.Scene();
    let fogColor = new THREE.Color(Koji.config.colors.fogColor);
    let backgroundColor = new THREE.Color(Koji.config.colors.backgroundColor);


    scene.background = backgroundColor;
    scene.fog = new THREE.Fog(fogColor, 50, 10000);


    scene.add(light);
    scene.add(ambientLight);
    //scene.add(pointLight);
}

function handleInputDown() {

    var keyCode = event.which;

    if (touching) return;

    usingKeyboard = true;

    if (keyCode == 37) {
        //left
        ball.dir = -1;


    } else if (keyCode == 39) {
        //right
        ball.dir = 1;

    }

    if (keyCode == 32) {
        //space 

        //Ommited for now
        //submitScore();

        //openLeaderboard();

    }

}

function handleInputUp() {

    var keyCode = event.which;
    if (keyCode == 37) {
        //left
        if (ball.dir == -1) {
            ball.dir = 0;
        }
    } else if (keyCode == 39) {
        //right
        if (ball.dir == 1) {
            ball.dir = 0;
        }
    }

}

function managePlatforms() {

    globalSpeedIncreaseTimer -= 1.0 / 60;
    if (globalSpeedIncreaseTimer <= 0) {
        if (globalSpeed < globalSpeedMax) {
            globalSpeed += globalSpeedIncrease;
            globalSpeedIncreaseTimer = globalSpeedIncreasePeriod;
        }

    }

    if (platforms.length < 6) {
        let z = platforms[platforms.length - 1].mesh.position.z;
        platforms.push(new Platform(0, 0, z - ballSize * 15));

        if (platformCount > 3) {

            let x = random(leftBound + ballSize * 1.5, rightBound - ballSize * 1.5);
            let box = new Box(x, ballSize * 1.75, z - ballSize * 15);
            if (platformCount > 5) {
                if (Math.random() * 100 < 20) {
                    box.moving = true;

                }
            }

            boxes.push(box);
            let xCol = 0;

            do {
                xCol = random(leftBound, rightBound);
            } while (Math.abs(x - xCol) < ballSize * 2);
            collectibles.push(new Collectible(xCol, ballSize * 1.75, z - ballSize * 5));
        }


    }
}

function updateLives() {

    //Set corresponding life icons invisible depending on number of lives
    for (let i = 0; i < lifeIcons.length; i++) {
        if (lives < i + 1 || gameOver) {
            lifeIcons[i].visible = false;
        } else {
            lifeIcons[i].visible = true;
        }
    }

}

function loseLife() {
    lives--;

    if (lives <= 0) {
        lives = 0;

        endGame();
    }
}

function endGame() {
    gameOver = true;

    playButton.rectangle.visible = true;

    leaderboardButton.rectangle.visible = false;
    title.visible = true;
    for (let i = 0; i < instructions.length; i++) {
        instructions[i].visible = true;
    }

    scoreText.visible = false;

    if (score < 1) {
        score = 1;
    }

    submitScore();





}


// a basic render loop
function render() {
    // do this again next frame
    requestID = requestAnimationFrame(render);

    if (gameOver) {
        //Draw Main Menu
        if (inGame) {
            playButton.update();
            soundButton.update();
            leaderboardButton.update();
        }

    } else {

        ball.update();

        if (!usingKeyboard) {
            if (touching) {
                ball.dir = Math.sign((mouseX - window.innerWidth / 2));
            } else {
                ball.dir = 0;
            }
        }



        for (let i = 0; i < platforms.length; i++) {
            platforms[i].update();
        }

        for (let i = 0; i < boxes.length; i++) {
            boxes[i].update();
        }

        for (let i = 0; i < collectibles.length; i++) {
            collectibles[i].update();
        }

        managePlatforms();
        updateLives();

        camera.position.x = Smooth(camera.position.x, ball.mesh.position.x, 12);
        cleanup();
        scoreText.text = "" + score;


    }


    if (renderer && inGame) {
        renderer.render(scene, camera);

        if (renderUI) {
            ui.render(renderer);
        }

    }

};

function cleanup() {
    for (let i = 0; i < platforms.length; i++) {
        if (platforms[i].removable) {
            scene.remove(platforms[i].mesh);
            platforms.splice(i, 1);

        }
    }

    for (let i = 0; i < boxes.length; i++) {
        if (boxes[i].removable) {
            scene.remove(boxes[i].mesh);
            boxes.splice(i, 1);

        }
    }

    for (let i = 0; i < collectibles.length; i++) {

        if (collectibles[i].collected) {

            // collectibles[i].removable = true;

        }

        if (collectibles[i].removable) {
            scene.remove(collectibles[i].mesh);
            collectibles.splice(i, 1);

        }
    }
}

preload();
//setup();

// call our render loop
//render();

