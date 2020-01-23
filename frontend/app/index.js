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
let powerup = [];
let checkpoint = [];

//Textures
let textureBall;
let texturePlatform;
let textureCoin;
let texturePowerup;
let bkgImage;
let art ;

// ball = true
let playerChoice = true; 

let modelPlayersChoice = { model: null };
let modelPlayer1 = { model: null };
let modelPlayer2 = { model: null };
let modelPlayer3 = { model: null };
let modelPlayer4 = { model: null };
let modelPlayer5 = { model: null };

let modelName =  'soccerball';

//Sounds
let sndMusic = new THREE.Audio(listener);
let sndCoin = new THREE.Audio(listener);
let sndJump = new THREE.Audio(listener);
// let sndPowerup = new THREE.Audio(listener);

//UI
let lifeIcons = [];

let clockIcon;

// let selectorIcon;

let playButton;
let soundButton, soccerButton, pokeButton, tennisButton, shipButton, bounceButton, earthButton;
let imgSoundOff, imgSoundOn;
let leaderboardButton;
let title;
let instructions = [];
let instructionsText = [];
let scoreText;

let timerText;

//Global Variables
let mouseX = 0;
let mouseY = 0;
let gameOver = true;
let globalSpeedIncreasePeriod = parseInt(Koji.config.strings.duration);//10
let globalSpeedIncreaseTimer = globalSpeedIncreasePeriod;
let globalSpeedMin =parseInt(Koji.config.strings.minWorldSpeed); //30
let globalSpeedMax = parseInt(Koji.config.strings.maxWorldSpeed); //100
let globalSpeed = globalSpeedMin;
let globalSpeedIncrease = parseInt(Koji.config.strings.amount); //2

let ballSize = 64;
let coinSize = 16;
let powerupSize = 16;
let checkpointSize = 16;

let pwidth = 7.5 ;
let pdepth = 5;


let totalModels = 0;
let modelsLoaded = 0;


// limit = how far the player moves to fall off platform 

let limit = 5.1;
let leftBound = -ballSize * (3.25 + limit);
let rightBound = ballSize * (3.25 + limit);
// let font = Koji.config.strings.font;
let score = 0;
let requestID; //Should be used later for cancelling animation frames
let renderUI = true;
let inGame = true;
let platformCount = 1000;
let touching = false;
let usingKeyboard = false;
let soundEnabled = true;

let jumpC = 0;

//Game settings

let scoreGain = parseInt(Koji.config.strings.scoreGain);
let startingLives = parseInt(Koji.config.strings.lives);
let lives = startingLives;

let num = 1;

let bkgImg;

//Time stuff

clock = new THREE.Clock();

function preload() {

    AssetLoader.add.image(Koji.config.images.life);
    AssetLoader.add.image(Koji.config.images.soundOff);
    AssetLoader.add.image(Koji.config.images.soundOn);
    AssetLoader.add.image(Koji.config.images.clock);

    AssetLoader.add.image(Koji.config.images.selector);
    
    AssetLoader.add.image(Koji.config.images.soccer);
    AssetLoader.add.image(Koji.config.images.poke);
    AssetLoader.add.image(Koji.config.images.tennis);
    AssetLoader.add.image(Koji.config.images.earth);
    AssetLoader.add.image(Koji.config.images.ship);
    AssetLoader.add.image(Koji.config.images.bounce);

    // Set a progress listener, can be used to create progress bars

    AssetLoader.progressListener = function (progress) {
        console.info('Progress: ' + (progress * 100) + '%');
    };

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

    loadModel(Koji.config.player.soccerball.mtl, Koji.config.player.soccerball.obj, modelPlayer1, ballSize*Koji.config.player.soccerballScale);
    loadModel(Koji.config.player.pokeball.mtl, Koji.config.player.pokeball.obj, modelPlayer2, ballSize * Koji.config.player.pokeballScale);
    loadModel(Koji.config.player.earth.mtl, Koji.config.player.earth.obj, modelPlayer3, ballSize * Koji.config.player.earthScale);
    loadModel(Koji.config.player.tennisball.mtl, Koji.config.player.tennisball.obj, modelPlayer4, ballSize * Koji.config.player.tennisballScale);
    loadModel(Koji.config.player.ship.mtl, Koji.config.player.ship.obj, modelPlayer5, ballSize*Koji.config.player.shipScale );


    //===Load font from google fonts link provided in game settings
 
    var link = document.createElement('link');
    link.href = "https://fonts.googleapis.com/css?family=" + Koji.config.strings.fontFamily;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    font = getFontFamily("https://fonts.googleapis.com/css?family=" + Koji.config.strings.fontFamily);
    let newStr = font.replace("+", " ");
    font = newStr;
    
    // WebFont.load({ google: { families: [Koji.config.strings.fontFamily] } });

    // Load, and start game when done

    AssetLoader.load(function () { // This function is called when all assets are loaded
        // Initialize the game
        setup();

    });
}

//Setup the game after loading'

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
    textureCoin = new THREE.TextureLoader().load(Koji.config.images.coin);
    texturePlatform = new THREE.TextureLoader().load(Koji.config.images.platform);
    texturePowerup = new THREE.TextureLoader().load(Koji.config.images.powerup);
    bkgImage = new THREE.TextureLoader().load(Koji.config.images.bkg);



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

    if (ball) {
        ball.jump();
    }
    //  jumpC ++;
    platformCount ++;
    
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

    let clocksize = 50;
    clockIcon = ui.createSprite(Koji.config.images.clock);

    clockIcon.width = clocksize;
    clockIcon.height = clocksize;

    clockIcon.anchor.x = ThreeUI.anchors.right;
    clockIcon.anchor.y = ThreeUI.anchors.top;

    clockIcon.y = 40;
    clockIcon.x = 50;

    clockIcon.visible = false;

    playButton = new Button(Koji.config.strings.playButtonText, 0);
    
    soundButton = new SoundButton();
    
    leaderboardButton = new Button("LEADERBOARD", 1);

    soccerButton = new SliderButton(1, -20);
    pokeButton = new SliderButton(2, -50);
    tennisButton = new SliderButton(3, 15);
    shipButton = new SliderButton(4, 45); 
    bounceButton = new SliderButton(0, -82);
    earthButton = new SliderButton(5, 75);

    bounceButton.img.onClick(function () {
        if (gameOver){
            playerChoice = true; 
            // art = Koji.config.images.bounce;
            bounceButton.img.alpha = 0.6;
            soccerButton.img.alpha = 1;
            pokeButton.img.alpha = 1;
            tennisButton.img.alpha = 1;
            shipButton.img.alpha = 1;
            earthButton.img.alpha = 1;
        }
          
    });

    soccerButton.img.onClick(function () {
        if (gameOver){
            playerChoice = false; 
            modelName = "soccerball";
            // art = Koji.config.images.soccer;
            bounceButton.img.alpha = 1;
            soccerButton.img.alpha = 0.6;
            pokeButton.img.alpha = 1;
            tennisButton.img.alpha = 1;
            shipButton.img.alpha = 1;
            earthButton.img.alpha = 1;
            // selectorIcon.x = -60; // soccerball
            // selectorIcon.visible = true;
        }
    });

    pokeButton.img.onClick(function () {
        if (gameOver){
            playerChoice = false;
            modelName = "pokeball";
            bounceButton.img.alpha = 1;
            soccerButton.img.alpha = 1;
            pokeButton.img.alpha = 0.6;
            tennisButton.img.alpha = 1;
            shipButton.img.alpha = 1;
            earthButton.img.alpha = 1;
            // art =  Koji.config.images.poke;
            // selectorIcon.x = -140; // poke
            // selectorIcon.visible = true;
        }
          
    });

    tennisButton.img.onClick(function () {
        if (gameOver){
            playerChoice = false;
            modelName = "tennisball"; 
            bounceButton.img.alpha = 1;
            soccerButton.img.alpha = 1;
            pokeButton.img.alpha = 1;
            tennisButton.img.alpha = 0.6;
            shipButton.img.alpha = 1;
            earthButton.img.alpha = 1;
            // art = Koji.config.images.tennis;
            // selectorIcon.x = 30; // beach ball
            // selectorIcon.visible = true;

        }

    });

    shipButton.img.onClick(function () {
        if (gameOver){
            playerChoice = false;
            modelName = "ship"; 
            bounceButton.img.alpha = 1;
            soccerButton.img.alpha = 1;
            pokeButton.img.alpha = 1;
            tennisButton.img.alpha = 1;
            shipButton.img.alpha = 0.6;
            earthButton.img.alpha = 1;
            // art= Koji.config.images.ship;
            // selectorIcon.x = 110; // ship
            // selectorIcon.visible = true;

        }

    });

    earthButton.img.onClick(function () {
        if (gameOver){
            playerChoice = false;
            modelName = "earth"; 
            bounceButton.img.alpha = 1;
            soccerButton.img.alpha = 1;
            pokeButton.img.alpha = 1;
            tennisButton.img.alpha = 1;
            shipButton.img.alpha = 1;
            earthButton.img.alpha = 0.6;
            // art=Koji.config.images.earth;
            // selectorIcon.x = 200; // earth 
            // selectorIcon.visible = true;
            
        }
    });

    playButton.rectangle.onClick(function () {
        if (gameOver && totalModels == modelsLoaded) {
        // if (gameOver ) {
            scene.remove(bkg.mesh);
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

    bkg = new BkgImage(0,window.innerHeight,0);
        
    //Title
    let titleSize = 128;
    title = ui.createText(Koji.config.strings.title, titleSize, font, Koji.config.colors.titleColor);
    title.y = 100;
    //  window.innerHeight * 0.15 
    // + titleSize * 0.5;

    title.textAlign = 'center';
    title.anchor.x = ThreeUI.anchors.center;
    title.anchor.y = ThreeUI.anchors.top;

    while (titleSize * title.text.length * 0.8 > window.innerWidth) {

        titleSize *= 0.99;
        title.size = titleSize;
        title.y = 100;
        // window.innerHeight * 0.15 
        // + titleSize * 0.5;

    }

    //Instructions
    let instructionsSize;
    let instructionsColor = Koji.config.colors.instructionsColor;
    instructionsText[0] = Koji.config.strings.instructions0;
    instructionsText[1] = Koji.config.strings.instructions1;
    instructionsText[2] = Koji.config.strings.instructions2;
    instructionsText[3] = Koji.config.strings.instructions3;

    instructionsSize = 22;
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

    timerText = ui.createText("0", 38, font, Koji.config.colors.scoreColor);
    timerText.textAlign = 'right';
    timerText.anchor.x = ThreeUI.anchors.right;
    timerText.anchor.y = ThreeUI.anchors.top;
    timerText.y = 100;
    timerText.x = 20;
    timerText.visible = false;

    speedText = ui.createText("Speed +" + globalSpeedIncrease, 38, font, Koji.config.colors.scoreColor);
    speedText.textAlign = 'center';
    speedText.anchor.x =  ThreeUI.anchors.center;
    speedText.anchor.y = ThreeUI.anchors.center;
    speedText.visible = false;

}

//Start the game
function init() {   
  
    playerModelChosen(modelName)

    gameOver = false;

    platforms = [];
    coin  = [];
    powerup =[];
    checkpoint = [];


    score = 0;
    jumpC = 0;

    globalSpeedIncreasePeriod = 10;
    globalSpeedIncreaseTimer = globalSpeedIncreasePeriod;

    platformCount = 10;
    
    pwidth  = 7.5;

    lives = startingLives;

    updateLives();

    globalSpeed = globalSpeedMin;


    ball = new Ball(0, ballSize + 16, 0, Koji.config.player.playersRoll, Koji.config.player.playersPitch, Koji.config.player.playersYaw);

    platforms.push(new Platform(0, 0, 0, pwidth));

    playButton.rectangle.visible = false;

    soccerButton.rectangle.visible = false;
    tennisButton.rectangle.visible = false;
    bounceButton.rectangle.visible = false;
    shipButton.rectangle.visible = false;
    earthButton.rectangle.visible = false;
    pokeButton.rectangle.visible = false;

    // selectorIcon.visible = false;

    leaderboardButton.rectangle.visible = false;
    title.visible = false;
    // speedText.visible = false;

    for (let i = 0; i < instructions.length; i++) {
        instructions[i].visible = false;
    }

    scoreText.visible = true;
    timerText.visible = true;
    clockIcon.visible = true;


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

        // jumpC ++;

        // console .log(ball.jumpCount);

        platformCount ++;
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
    if(platformCount > 10){
        if(globalSpeedIncreaseTimer == globalSpeedIncreasePeriod || globalSpeedIncreaseTimer >= (globalSpeedIncreasePeriod -0.3) ){
            speedText.visible = true;
        }
        else{
            speedText.visible = false;
        }
    }
    
  

    let g = platforms[platforms.length - 1].mesh.position.z;    
    spawn(g);
    
}

function playerModelChosen(modelName){

    switch(modelName){
        case 'soccerball':
            modelPlayersChoice = modelPlayer1;
            break;
        case 'pokeball':
            modelPlayersChoice = modelPlayer2;
            break;
        case 'earth':
            modelPlayersChoice = modelPlayer3;
            break;
        case 'tennisball':
            modelPlayersChoice = modelPlayer4;
            break;
        case 'ship':
            modelPlayersChoice = modelPlayer5;
            break;
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
    lives  = lives - 1;
    // ball.mesh.position.z + 960;
    // ball.mesh.positio. y = 100;

    if (lives <= 0) {
        lives = 0;
        endGame();
    }
}

function respawn(){

    let point = checkpoint[0].mesh.position.z;
    let forward  = jumpC + 1;
    
    platforms[forward].moving = false;
    platforms[forward].mesh.position.z = point;
    platforms[forward].mesh.position.x =0;

    ball = new Ball(0, ballSize + 16, platforms[forward].mesh.position.z, Koji.config.player.playersRoll, Koji.config.player.playersPitch, Koji.config.player.playersYaw);
}

function endGame() {    
    gameOver = true;

    playButton.rectangle.visible = true;
    soccerButton.rectangle.visible = true;
    tennisButton.rectangle.visible = true;
    bounceButton.rectangle.visible = true;
    shipButton.rectangle.visible = true;
    earthButton.rectangle.visible = true;
    pokeButton.rectangle.visible = true;

    leaderboardButton.rectangle.visible = false;
    title.visible = true;
    for (let i = 0; i < instructions.length; i++) {
        instructions[i].visible = true;
    }

    scoreText.visible = false;
    timerText.visible = false;
    clockIcon.visible = false;

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
    // jumpC = 0;

        //Draw Main Menuk
        if (inGame) {
            playButton.update();
            soundButton.update();
            leaderboardButton.update();
        }
        
        

    }
    else {

        ball.update();


        for (let i = 0; i < platforms.length; i++) {
            platforms[i].update();
        }

        managePlatforms();
        updateLives();
        

        camera.position.x = Smooth(camera.position.x, ball.mesh.position.x, 12);
        camera.position.y = Smooth(camera.position.y, ball.mesh.position.y + 100  , 12); // was + 208
        camera.position.z = Smooth(camera.position.z, ball.mesh.position.z + ballSize*15, 10);

        cleanup();
        scoreText.text = "" + score;

        //2 decimal places for timer

        timerText.text = "" + (Math.round(globalSpeedIncreaseTimer * 100) / 100).toFixed(2);
    }

    if (renderer && inGame) {
        renderer.render(scene, camera);

        if (renderUI) {
            ui.render(renderer);
        }

    }

};

function cleanup() {
    for (let i = 2; i < platforms.length; i++) {
        if (platforms[i].removeable) {
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

    for (let  i = 0; i < powerup.length; i++){
        if(powerup[i].point){
            scene.remove(powerup[i].mesh);
            powerup.splice(i,1); 
        }
    }

    for (let  i = 0; i < checkpoint.length; i++){
        if(checkpoint[i].point){
            scene.remove(checkpoint[i].mesh);
            checkpoint.splice(i,1); 
            jumpC ++;
        }
    }
    
    
    if(ball.death){

        scene.remove(ball.model);
        if(ball.playerChoice){
          scene.remove(ball.model);
        }

    }

    // if(ball.death){
    //     scene.remove(ball.model)
    //     scene.remove(ball.mesh);
    // }
}

function spawn(z){

     // this spawns 10 platforms
    if (platforms.length < platformCount) { 
        platforms.push(new Platform(0, 0, z - ballSize*15, pwidth ));
        checkpoint.push(new Checkpoint(0, checkpointSize +32, z - ballSize*15));

        let inc = 5;

        if(platforms.length  %  inc == 0){
            coin.push(new Coin(0, coinSize + 32, z - ballSize*15));
            } 

        if(platforms.length  %  15 == 0){
            powerup.push(new Powerup(0, powerupSize + 32, z - ballSize*15));
            } 
    }
   
}

preload();

 