class Ball {
    
    constructor(x, y, z) {
        var geometry = new THREE.SphereGeometry(ballSize, 32, 32);
        var material = new THREE.MeshPhongMaterial({ map: textureBall });

        material.shininess = 80;
        material.metalness = 1;

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.x = x;
        this.mesh.position.y = y;
        this.mesh.position.z = z;
        scene.add(this.mesh);

        this.velocity = 0;
        this.maxVelocity = 35;
        this.dir = 0;
        this.moveSpeedY = 0;
        this.nextZPlatform= 960;// ballSize*15
        this.jumpStrength = 20;
        this.canJump = true;
        this.mesh.geometry.computeBoundingSphere();


        //To prevent hitting the same block multiple times
        this.invincibilityTimer = 0;

    }

    update() {
        // console.log(this.mesh.position.y);


        for( let i = 0; i < platforms.length; i++){

            if(this.collisionWith(platforms[i])){
  
                platforms[i].moving = false;
 
            }

            //death cond.
            if(platforms[i].mesh.position.z == this.mesh.position.z){
                if(platforms[i].moving){
                    if (!platforms[i].destroyed && this.invincibilityTimer <= 0) {
                        loseLife();
                        
                        platforms[i].destroyed = true;

                        this.invincibilityTimer = 0.5;
                    }
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

        let gravity = 1.981;

        this.invincibilityTimer -= clock.getDelta();

     

        // when ball reaches max height apply gravity   
        if (this.mesh.position.y >= 100 ) {
            this.moveSpeedY -= gravity;
            for( let i = 0; i < platforms.length; i++){
                // console.log("log");
            }
            
        }
        else {
            this.mesh.position.y = 100;
            this.moveSpeedY = Math.abs(this.moveSpeedY) * 0.8; //0.3 control bounce
            this.canJump = true;
        }  

        this.mesh.position.y += this.moveSpeedY ; // apply  drag  0.65

        
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

        let requiredDistance = (this.mesh.geometry.boundingSphere.radius + other.mesh.geometry.boundingSphere.radius) / tolerance;

        if (distance <= requiredDistance) {
            return true;
        } else {
            return false;
        }

    }

}

class Platform {

    constructor(x, y, z) {
        var geometry = new THREE.BoxBufferGeometry(ballSize * 7.5, 16, ballSize * 5 ); // prev 7.5

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
