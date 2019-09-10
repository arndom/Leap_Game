// An example three.js project, a spinning cube

// create our basic constructs
let scene; //initialised later
let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 20000);
let renderer = new THREE.WebGLRenderer();
let ui;

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

//UI
let lifeIcons = [];
let playButton;
let title;
let instructions = [];
let instructionsText = [];


//Global Variables
let mouseX = 0;
let mouseY = 0;
let gameOver = true;
let globalSpeed = 50;
let ballSize = 128;
let leftBound = -ballSize * 7.5;
let rightBound = ballSize * 7.5;
let startingLives = 3;
let lives = startingLives;
let font = "Russo One";

initiateScene();


//Time stuff
clock = new THREE.Clock();



function preload() {
    AssetLoader.add.image(Koji.config.images.life);

    // Set a progress listener, can be used to create progress bars
    AssetLoader.progressListener = function (progress) {
        console.info('Progress: ' + (progress * 100) + '%');
    };


    // Load, and start game when done
    AssetLoader.load(function () { // This function is called when all assets are loaded
        // Initialize the game
        setup();

        console.log("loaded")
    });
}


//Setup the game after loading
function setup() {

    // setup our renderer and add it to the DOM
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);


    // Create a UI of 720 pixels high
    // will scale up to match renderer.domElement's size
    ui = new ThreeUI(renderer.domElement, 720);

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

    //Load UI
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

    playButton = new Button("PLAY NOW");

    playButton.rectangle.onClick(function () {
        init();
    });

    //Title
    let titleSize = 128;
    title = ui.createText("AMAZING BALL 3D", titleSize, font, Koji.config.colors.buttonTextColor);
    title.y = window.innerHeight * 0.05 + titleSize * 0.5;

    title.textAlign = 'center';
    //title.textVerticalAlign = 'top';
    title.anchor.x = ThreeUI.anchors.center;
    title.anchor.y = ThreeUI.anchors.top;

    while (titleSize * title.text.length * 0.9 > window.innerWidth) {

        titleSize *= 0.99;
        title.size = titleSize;
        title.y = window.innerHeight * 0.05 + titleSize * 0.5;

    }

    //Instructions
    let instructionsSize;
    instructionsText[0] = "Collect as many apples as you can";
    instructionsText[1] = "Avoid boxes";
    instructionsText[2] = "Controls: TOUCH or ARROW KEYS";

    instructionsSize = 32;
    for (let i = 0; i < instructionsText.length; i++) {

        instructions[i] = ui.createText(instructionsText[i], instructionsSize, font, Koji.config.colors.buttonTextColor);
        instructions[i].y = title.y + titleSize * 0.75 + i * instructionsSize + (i * instructionsSize * 0.75);

        instructions[i].textAlign = 'center';
        //title.textVerticalAlign = 'top';
        instructions[i].anchor.x = ThreeUI.anchors.center;
        instructions[i].anchor.y = ThreeUI.anchors.top;

        while (instructionsSize * instructions[i].text.length * 0.9 > window.innerWidth * 0.9) {

            instructionsSize *= 0.99;
            instructions[i].size = instructionsSize;
            instructions[i].y = title.y + titleSize * 0.75 + i * instructionsSize + (i * instructionsSize * 0.75);

        }
    }

    console.log(instructions);



    document.addEventListener("keydown", handleInputDown, false);
    document.addEventListener("keyup", handleInputUp, false);

    document.onmousemove = function (e) {
        mouseX = e.pageX;
        mouseY = e.pageY;


    }

    //Start rendering the game
    render();

    updateLives();




}


//Start the game
function init() {
    gameOver = false;

    initiateScene();

    boxes = [];
    platforms = [];

    lives = startingLives;

    updateLives();


    ball = new Ball(0, ballSize + 16, 0);
    platforms.push(new Platform(0, 0, 0));

    playButton.rectangle.visible = false;
    title.visible = false;
    for (let i = 0; i < instructions.length; i++) {
        instructions[i].visible = false;
    }




}

function initiateScene() {

    scene = new THREE.Scene();
    let fogColor = new THREE.Color(Koji.config.colors.fogColor);
    let backgroundColor = new THREE.Color(Koji.config.colors.backgroundColor);


    scene.background = backgroundColor;
    scene.fog = new THREE.Fog(fogColor, 50, 10000);
}

function handleInputDown() {

    var keyCode = event.which;
    if (keyCode == 37) {
        //left
        ball.dir = -1;

    } else if (keyCode == 39) {
        //right
        ball.dir = 1;
    }

    if (keyCode == 32) {
        init();
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
    if (platforms.length < 30) {
        let z = platforms[platforms.length - 1].mesh.position.z;
        platforms.push(new Platform(0, 0, z - ballSize * 15));


        let x = random(leftBound, rightBound);
        boxes.push(new Box(x, ballSize * 1.75, z - ballSize * 15));

        let xCol = 0;

        do {
            xCol = random(leftBound, rightBound);
        } while (Math.abs(x - xCol) < ballSize * 2);


        collectibles.push(new Collectible(xCol, ballSize * 1.75, z - ballSize * 5));

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

    scene = new THREE.Scene();

    playButton.rectangle.visible = true;
    title.visible = true;
    for (let i = 0; i < instructions.length; i++) {
        instructions[i].visible = true;
    }
}


// a basic render loop
function render() {
    // do this again next frame
    requestAnimationFrame(render);

    if (gameOver) {
        //Draw Main Menu

        playButton.update();
    } else {

        ball.update();

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




    }

    renderer.render(scene, camera);
    ui.render(renderer);
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

