
class Ball {
    constructor(x, y, z) {
        var geometry = new THREE.SphereGeometry(ballSize, 32, 32);

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

        if (this.mesh.position.x <= leftBound) {
            this.mesh.position.x = leftBound;
        }


        if (this.mesh.position.x >= rightBound) {
            this.mesh.position.x = rightBound;
        }

        for (let i = 0; i < boxes.length; i++) {
            //if(this.hitbox.isIntersectionBox(boxes[i].hitbox.box)){
            //console.log('sdf')
            //}

            if (this.collisionWith(boxes[i])) {
                if (this.invincibilityTimer <= 0) {
                    loseLife();
                    this.invincibilityTimer = 0.5;
                }

            }

        }

        for (let i = 0; i < collectibles.length; i++) {
            if (!collectibles[i].collected && this.collisionWith(collectibles[i])) {
                collectibles[i].collected = true;

                collectibles[i].goalY += ballSize * 15;
            }
        }



    }

    collisionWith(other) {
        let distance = getDistance(this.mesh, other.mesh);

        //Probably not perfect but works in this case
        let requiredDistance = (this.mesh.geometry.boundingSphere.radius + other.mesh.geometry.boundingSphere.radius) / 1.25;

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


        this.removable = false;


    }

    update() {
        //this.mesh.rotation.z += 0.001;

        this.mesh.position.z += globalSpeed;

        if (this.mesh.position.z > ballSize * 15) {
            this.removable = true;

        }

    }
}




class Collectible {
    constructor(x, y, z) {
        var geometry = new THREE.SphereGeometry(ballSize, 32, 32);

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

        this.goalY = y;

    }

    update() {

        this.mesh.rotation.y += 0.05;

        this.mesh.position.z += globalSpeed;

        this.mesh.position.y = Smooth(this.mesh.position.y, this.goalY, 12);

        if (this.mesh.position.z > ballSize * 15) {
            this.removable = true;

        }



    }



}