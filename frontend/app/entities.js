
class Ball {
    constructor(x, y, z) {
        var geometry = new THREE.SphereGeometry(ballSize, 64, 64);
        var material = new THREE.MeshBasicMaterial({ map: textureBall });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.x = x;
        this.mesh.position.y = y;
        this.mesh.position.z = z;
        scene.add(this.mesh);

        this.velocity = 0;
        this.maxVelocity = 35;
        this.dir = 0;

        this.mesh.geometry.computeBoundingSphere();

        //To prevent hitting the same block multiple times
        this.invincibilityTimer = 0;

    }

    update() {

        this.invincibilityTimer -= clock.getDelta();

        this.mesh.rotation.x -= globalSpeed * 0.005;
        this.mesh.rotation.y -= this.velocity * 0.001;

        if (this.dir != 0) {
            this.velocity = Smooth(this.velocity, this.maxVelocity * this.dir, 16);
        } else {
            this.velocity = Smooth(this.velocity, 0, 6);
        }

        this.mesh.position.x += this.velocity;


        //Contain the ball within platform bounds
        if (this.mesh.position.x <= leftBound) {
            this.mesh.position.x = leftBound;
        }

        if (this.mesh.position.x >= rightBound) {
            this.mesh.position.x = rightBound;
        }


        //===Collisions
        for (let i = 0; i < boxes.length; i++) {
            if (this.collisionWith(boxes[i])) {
                if (this.invincibilityTimer <= 0) {
                    loseLife();
                    this.invincibilityTimer = 0.5;
                    boxes[i].destroyed = true;
                    boxes[i].moveDir = Math.sign(boxes[i].mesh.position.x - this.mesh.position.x);
                    if(boxes[i].moveDir == 0){
                        boxes[i].moveDir = 1
                    }

                    playSound(sndHit);
                }

            }
        }

        for (let i = 0; i < collectibles.length; i++) {
            if (!collectibles[i].collected && this.collisionWith(collectibles[i])) {
                collectibles[i].collected = true;

                collectibles[i].goalY += ballSize * 5;

                playSound(sndCollect);

                score += scoreGain;
            }
        }

        //===
    }

    collisionWith(other) {
        let distance = getDistance(this.mesh, other.mesh);

        //Probably not perfect but works in this case
        let tolerance = 1.5;
        if(other instanceof Collectible){
            //make a bit easier to hit a collectible
            tolerance = 1;

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
    constructor(x, y, z) {
        var geometry = new THREE.BoxBufferGeometry(ballSize * 15, 64, ballSize * 15);

        var material = new THREE.MeshBasicMaterial({ map: texturePlatform });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.x = x;
        this.mesh.position.y = y;
        this.mesh.position.z = z;

        //this.mesh.rotation.x = 90;

        this.removable = false;

        scene.add(this.mesh);

        platformCount++;
    }

    update() {
        //this.mesh.rotation.z += 0.001;

        this.mesh.position.z += globalSpeed;

        if (this.mesh.position.z > ballSize * 15) {
            this.removable = true;

        }

    }
}

class Box {
    constructor(x, y, z) {
        this.sizeMod = 3;
        let size = this.sizeMod * ballSize;
        var geometry = new THREE.BoxBufferGeometry(size, size, size);
        var material = new THREE.MeshBasicMaterial({ map: textureBox });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.x = x;
        this.mesh.position.y = y;
        this.mesh.position.z = z;

        this.mesh.geometry.computeBoundingSphere();

        scene.add(this.mesh);

        this.destroyed = false;
        this.removable = false;

        this.maxSpeed = random(10, 15);
        this.moveSpeed = 0;

        this.moveDir = -1;
        if (Math.random() * 100 < 50) {
            this.moveDir = 1;
        }

        this.moving = false;

    }

    update() {
        //this.mesh.rotation.z += 0.001;


        this.mesh.position.z += globalSpeed;
        if (this.mesh.position.z > ballSize * 15) {
            this.removable = true;

        }

        if (this.moving && !this.destroyed) {
            this.mesh.position.x += this.moveSpeed;

            this.moveSpeed = Smooth(this.moveSpeed, this.maxSpeed * this.moveDir, 8);

            if (this.mesh.position.x < leftBound + ballSize * this.sizeMod) {
                this.moveDir = 1;
            }
            if (this.mesh.position.x > rightBound - ballSize * this.sizeMod) {
                this.moveDir = -1;
            }
        }

        if (this.destroyed) {
            this.moveSpeed = Smooth(this.moveSpeed, globalSpeed * this.moveDir * 6, 12);
            
            this.mesh.position.x += this.moveSpeed;
        }
    }
}


class Collectible {
    constructor(x, y, z) {
        var geometry = new THREE.SphereGeometry(ballSize, 24, 24);
        var material = new THREE.MeshBasicMaterial({ map: textureCollectible });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.x = x;
        this.mesh.position.y = y;
        this.mesh.position.z = z;
        scene.add(this.mesh);

        this.velocity = 0;
        this.maxVelocity = 35;
        this.dir = 0;
        this.mesh.geometry.computeBoundingSphere();
        this.collected = false;
        this.removable = false;
        this.startY = y;
        this.goalY = y;
        this.goalScale = 1;
        this.animTimer = 0;

    }

    update() {

        this.mesh.rotation.y += 0.05;

        let animSpeed = 3;

        if (this.collected) {

            this.mesh.position.z += globalSpeed * 0.75;

            this.animTimer += 1 / 60 * animSpeed;

            this.mesh.position.y = Ease(EasingFunctions.inBack, this.animTimer, this.startY, this.goalY, animSpeed);
            this.mesh.scale.x = Ease(EasingFunctions.easeOutQuint, this.animTimer, 1, -0.5, animSpeed);
            this.mesh.scale.z = Ease(EasingFunctions.easeOutQuint, this.animTimer, 1, -0.5, animSpeed);

        } else {
            this.mesh.position.z += globalSpeed;
        }

        //this.mesh.position.y = Smooth(this.mesh.position.y, this.goalY, 12);

        if (this.mesh.position.z > ballSize * 15) {
            this.removable = true;
        }
    }
}