

/*
    Basic smoothing function
    v = ((v * (N - 1)) + w) / N; 

    v - current value
    w - goal value
    The higher the factor, the slower v approaches w.
*/
function Smooth(current, goal, factor) {
    return ((current * (factor - 1)) + goal) / factor;
}

function random(min, max) {
    return Math.random() * (max - min) + min;
}

function getDistance(mesh1, mesh2) {
    var dx = mesh1.position.x - mesh2.position.x;
    var dy = mesh1.position.y - mesh2.position.y;
    var dz = mesh1.position.z - mesh2.position.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

//DO NOT USE FOR NOW
function submitScore() {
    window.stop(requestID);
    window.setScore(score);
    window.setAppView('setScore');
}

function openLeaderboard() {
    window.stop(requestID);
    window.setAppView('leaderboard');

}
//====

//Make a copy of needed sound and play it immediately
//Not sure if it causes leaks
function playSound(sound) {
    if(!soundEnabled) return;

    if (sound) {
        let snd = new THREE.Audio(listener);
        snd.buffer = sound.buffer;
        snd.setPlaybackRate(random(0.8, 1.2));
        snd.play();
        
    }
}

function toggleSound(){
    soundEnabled = !soundEnabled;

    soundButton.updateImage();

    if(!soundEnabled){
        listener.setMasterVolume(0);
    }else{
        listener.setMasterVolume(1);
    }
    
}