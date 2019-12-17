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
let coin = []; 

//Textures
let textureBall;
let texturePlatform;
let textureCoin;


//Sounds
let sndMusic = new THREE.Audio(listener);
let sndCoin = new THREE.Audio(listener);
let sndJump = new THREE.Audio(listener);

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
let globalSpeedMin =25;
let globalSpeedMax = 100;
let globalSpeed = globalSpeedMin;
let globalSpeedIncrease = 0.5;

let ballSize = 64;
let coinSize = 16;

// limit = how far the player moves to fall off platform 

let limit = 5.1;
let leftBound = -ballSize * (3.25 + limit);
let rightBound = ballSize * (3.25 + limit);
let font = Koji.config.strings.font;
let score = 0;
let requestID; //Should be used later for cancelling animation frames
let renderUI = true;
let inGame = true;
let platformCount = 10;
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

    audioLoader.load(Koji.config.sounds.coin, function (buffer) {
        sndCoin.setBuffer(buffer);
    });

    audioLoader.load(Koji.config.sounds.jump, function (buffer) {
        sndJump.setBuffer(buffer);
    });

    //===Load font from google fonts link provided in game settings

    var link = document.createElement('link');
    link.href = Koji.config.strings.fontFamily;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    font = getFontFamily(Koji.config.strings.fontFamily);
    let newStr = font.replace("+", " ");
    font = newStr;
    //===

    // Load, and start game when done

    AssetLoader.load(function () { // This function is called when all assets are loaded
        // Initialize the game
        setup();

    });
}

//Setup the game after loading'

function setup() {
    initiateScene();8

    // setup our renderer and add it to the DOM
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    document.body.style.fontFamily = font;

    camera.position.z = 1000;
    camera.position.y = 500;

    //Load textures
    textureBall = new THREE.TextureLoader().load(Koji.config.images.ball);
    textureCoin = new THREE.TextureLoader().load(Koji.config.images.coin);
    texturePlatform = new THREE.TextureLoader().load(Koji.config.images.platform);


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

//touch Down
function onMouseDown(e) {
    mouseX = e.changedTouches[0].pageX;
    mouseY = e.changedTouches[0].pageY;

    touching = true;
    usingKeyboard = false;
    platformCount ++
}

//touch Up
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
        let size = 40;
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
        if (gameOver) {
            openLeaderboard();
        }

    })

    //Title
    let titleSize = 128;
    title = ui.createText(Koji.config.strings.title, titleSize, font, Koji.config.colors.titleColor);
    title.y = window.innerHeight * 0.1 + titleSize * 0.5;

    title.textAlign = 'center';
    title.anchor.x = ThreeUI.anchors.center;
    title.anchor.y = ThreeUI.anchors.top;

    while (titleSize * title.text.length * 0.8 > window.innerWidth) {

        titleSize *= 0.99;
        title.size = titleSize;
        title.y = window.innerHeight * 0.1 + titleSize * 0.5;

    }

    //Instructions
    let instructionsSize;
    let instructionsColor = Koji.config.colors.instructionsColor;
    instructionsText[0] = Koji.config.strings.instructions0;
    instructionsText[1] = Koji.config.strings.instructions1;
    instructionsText[2] = Koji.config.strings.instructions2;

    instructionsSize = 25;
    for (let i = 0; i < instructionsText.length; i++) {

        instructions[i] = ui.createText(instructionsText[i], instructionsSize, font, instructionsColor);
       
        instructions[i].textAlign = 'center';
        instructions[i].anchor.x = ThreeUI.anchors.center;
        instructions[i].anchor.y = ThreeUI.anchors.top;
        instructions[i].y = title.y + titleSize * 0.5 + i * instructionsSize + (i * instructionsSize * 0.5);
    }


    scoreText = ui.createText("0", 58, font, Koji.config.colors.scoreColor);
    scoreText.textAlign = 'center';
    scoreText.anchor.x = ThreeUI.anchors.center;
    scoreText.anchor.y = ThreeUI.anchors.top;
    scoreText.y = 80;
    scoreText.visible = false;


}

//Start the game
function init() {   

    gameOver = false;

    platforms = [];
    coin  = [];


    score = 0;

    lives = startingLives;

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


    if (keyCode == 32) {
        
        if (ball) {
            ball.jump();
        }
        // console.log("press");
        // console.log(ball.mesh.position.y);

        platformCount ++
        // console.log(platformCount);
    }

} 

function handleInputUp() {
    // console.log(ball.mesh.position.y);

    // var keyCode = event.which;
    // if (keyCode == 37) {
    //     //left
    //     if (ball.dir == -1) {
    //         ball.dir = 0;
    //     }
    // } else if (keyCode == 39) {
    //     //right
    //     if (ball.dir == 1) {
    //         ball.dir = 0;
    //     }
    // }

}

function managePlatforms() {

    globalSpeedIncreaseTimer -= 1.0 / 60;

    if (globalSpeedIncreaseTimer <= 0) {
        if (globalSpeed < globalSpeedMax) {
            globalSpeed += globalSpeedIncrease;
            globalSpeedIncreaseTimer = globalSpeedIncreasePeriod;
        }
    }

    let g = platforms[platforms.length - 1].mesh.position.z;    
    spawn(g);
    
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
                ball.jump();
            } else {
                // ball.dir = 0;
            }
        }

        for (let i = 0; i < platforms.length; i++) {
            platforms[i].update();
        }

        managePlatforms();
        updateLives();

        camera.position.x = Smooth(camera.position.x, ball.mesh.position.x, 12);
        camera.position.y = Smooth(camera.position.y, ball.mesh.position.y + 208 , 12);
        camera.position.z = Smooth(camera.position.z, ball.mesh.position.z + ballSize*15, 10);

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

    for (let  i = 0; i < coin.length; i++){
        if(coin[i].point){
            scene.remove(coin[i].mesh);
            coin.splice(i,1); 
        }
    }

}

function spawn(z){

     // this spawns 10 platforms
    if (platforms.length < platformCount) { 
        platforms.push(new Platform(0, 0, z - ballSize*15 ));

        let inc = 5;

          
        if(platforms.length  %  inc == 0){
            coin.push(new Coin(0, coinSize + 32, z - ballSize*15));
            } 
    }

   
}

preload();

 