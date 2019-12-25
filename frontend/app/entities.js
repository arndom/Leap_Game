 class Ball {
    
    constructor(x, y, z) {
        var geometry = new THREE.SphereGeometry(ballSize, 32, 32); // radius, weight, height
        var material = new THREE.MeshPhongMaterial({ map: textureBall });

        // true = ball
        //false = model
        this.playerChoice = playerChoice;
        this.material = material
       
        material.transparent = true;  

        material.shininess = 80;
        material.metalness = 1;

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.x = x;
        this.mesh.position.y = y;
        this.mesh.position.z = z;
        scene.add(this.mesh);
        
        this.model = modelPlayersChoice.model.clone();        
        // this.model = modelPlayer1.model.clone();

        this.velocity = 0;
        this.maxVelocity = 35;
        this.dir = 0;
        this.moveSpeedY = 0;
        this.nextZPlatform= 960;// ballSize*15
        this.jumpStrength = 20;
        this.canJump = true;
        this.mesh.geometry.computeBoundingSphere();

        this.defaultScale = new THREE.Vector3(this.model.scale.x, this.model.scale.y, this.model.scale.z);
        
        this.model.position.set(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z);


        this.startY = y;
        this.goalY = y;
        this.animTimer = 0;

        this.allowedgravity = true;

        //To prevent hitting the same block multiple times
        this.invincibilityTimer = 0;

    }

    update(){

            if(!playerChoice){
                this.material.opacity = 0;
                scene.add(this.model);
            }
        


        let gravity = 1.981;
        this.invincibilityTimer -= clock.getDelta();
        this.model.scale.set(this.mesh.scale.x * this.defaultScale.x, this.mesh.scale.y * this.defaultScale.y, this.mesh.scale.z * this.defaultScale.z);
        this.model.position.set(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z);


        for( let i = 0; i < platforms.length; i++){

            if(this.collisionWith(platforms[i])){
  
                platforms[i].moving = false;
 
            }

            //death cond.
            if(platforms[i].mesh.position.z == this.mesh.position.z){  

                // player didnt collide with  platform
                if(platforms[i].moving){
 
                    this.allowedgravity = false;

                    platforms[i].moving = false;
                }

            }

             if(this.mesh.position.y <= -200){

            
                if (!platforms[i].destroyed && this.invincibilityTimer <= 0) {
                    platforms[i].destroyed = true;
                    
                    loseLife();

                    this.invincibilityTimer = 0.5;
                }
            
            }

            //platform score
            if(!platforms[i].point && this.collisionWith(platforms[i])){
                platforms[i].point = true;

                score += scoreGain;
            }

           
           
        }

        for( let i = 0; i < coin.length; i++){
            if(!coin[i].point && this.collisionWith(coin[i])){
                coin[i].point = true;

                 playSound(sndCoin);
                
                score += scoreGain + 2;   
            }
        }

        // shrinks platform
        for( let i = 0; i < powerup.length; i++){
            if(!powerup[i].point && this.collisionWith(powerup[i])){
                powerup[i].point = true;

                //  playSound(sndCoin);

                // 7.5 / 4 
                if(pwidth >= 1.875){
                    pwidth /= 1.1;
                } 
                else{
                    pwidth = 7.5;
                }
                
            }
        }


        if(this.allowedgravity){

             // when ball reaches max height apply gravity   
            if (this.mesh.position.y >= 100 ) {
                this.moveSpeedY -= gravity;

                
            }
            else {
                this.mesh.position.y = 100;
                this.moveSpeedY = Math.abs(this.moveSpeedY) * 0.8; //0.3 control bounce
                this.canJump = true;
            }  

            this.mesh.position.y += this.moveSpeedY ; // apply  drag  0.65

        }
        // falls to his doom 
        else{
            this.mesh.position.y += this.moveSpeedY
            this.moveSpeedY -= gravity;
        }


   
    }

    jump() {
            
            if (this.canJump) {
                this.mesh.position.y += 1;
                this.moveSpeedY = this.jumpStrength;
                this.canJump = false;
                this.mesh.position.z -= this.nextZPlatform;
                
                playSound(sndJump);
            }

    }


    collisionWith(other) {
        let distance = getDistance(this.mesh, other.mesh);

        //Probably not perfect but works in this case
        let tolerance = 1.5;
         if (other instanceof Platform) {
                //make a bit easier to hit platform
                tolerance = 1.2;

            }

        let requiredDistance = (this.mesh.geometry.boundingSphere.radius + other.mesh.geometry.boundingSphere.radius) / tolerance;

        if (distance <= requiredDistance) {
            return true;
        } else {
            return false;
        }

    }

}

class Platform {

    constructor(x, y, z, pwidth) {
        var geometry = new THREE.BoxBufferGeometry(ballSize * pwidth, 16, ballSize * pdepth ); // pwidth 7.5 height  pdepth 5

        var material = new THREE.MeshPhongMaterial({ map: texturePlatform });
  
        material.shininess = 80;
        material.metalness = 0;

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.x = x;
        this.mesh.position.y = y;
        this.mesh.position.z = z;

        this.point = false;

        this.destroyed = false;


        this.maxSpeed = random(10, 15);
        this.moveSpeed = 0;

        this.mesh.geometry.computeBoundingSphere();

        
        this.moveDir = -1;
        if (Math.random() * 100 < 50) {
            this.moveDir = 1;
        }

        this.moving = true;

        scene.add(this.mesh);

    }

    update(){
            if (this.moving) {
                this.mesh.position.x += this.moveSpeed;

                this.moveSpeed = Smooth(this.moveSpeed, globalSpeed * this.moveDir, 8);

                if (this.mesh.position.x < leftBound + ballSize) {
                    this.moveDir = 1;
                }
                if (this.mesh.position.x > rightBound - ballSize) {
                    this.moveDir = -1;
                }
            }

            

    } 
}

class Coin{
    
    constructor(x, y, z) {
        var geometry = new THREE.SphereGeometry(coinSize, 32, 32);
        var material = new THREE.MeshPhongMaterial({ map: textureCoin });

        material.shininess = 80;
        material.metalness = 1;

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.x = x;
        this.mesh.position.y = y;
        this.mesh.position.z = z;

        this.point = false;

       
        this.mesh.geometry.computeBoundingSphere();
        
        scene.add(this.mesh);

    }

    update() {

    }

}

// obj is invisible(why though?)
class Powerup{
    constructor(x, y, z) {
        var geometry = new THREE.SphereGeometry(powerupSize, 32, 32);
        var material = new THREE.MeshPhongMaterial({ map: texturePowerup });

        material.shininess = 80;
        material.metalness = 1;
        material.transparent = true;
        material.opacity = 0;

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.x = x;
        this.mesh.position.y = y;
        this.mesh.position.z = z;

        this.point = false;

       
        this.mesh.geometry.computeBoundingSphere();
        
        scene.add(this.mesh);

    }
    update(){

    }
}

