// Set up your Socket.IO connection
var socket = io();

// Generate/retrieve a unique device ID
var myDeviceId = localStorage.getItem('deviceId');
if (!myDeviceId) {
    myDeviceId = 'device-' + Math.random().toString(36).substr(2, 8);
    localStorage.setItem('deviceId', myDeviceId);
}
var currentActiveDevice = null; // will be set by socket event

// Preload the audio file
var audio = new Audio('static/siren-alert-96052.mp3');
audio.loop = true; // Enable looping

// When the timer finishes, trigger alert only if active
socket.on('timer_finished', function() {
    if (myDeviceId === currentActiveDevice) {
        audio.currentTime = 0;
        audio.play();
        document.body.classList.add('flashing');
    } else {
        console.log('Timer finished, but this device is not active.');
    }
});

// Stop the alert
function dismissAlert() {
    audio.pause();
    audio.currentTime = 0;
    document.body.classList.remove('flashing');
}

// Update the timer display (the input value)
socket.on('update_timer', function(data) {
    document.getElementById("timerDisplay").value = formatTime(data.time_left);
});

// Listen for active device updates
socket.on('active_device', function(data) {
    currentActiveDevice = data.active_device;
    var activeStatusElem = document.getElementById('activeStatus');
    if (currentActiveDevice === myDeviceId) {
        activeStatusElem.textContent = "This is the active device";
    } else if (currentActiveDevice) {
        activeStatusElem.textContent = "Active device: " + currentActiveDevice;
    } else {
        activeStatusElem.textContent = "No active device";
    }
});

// Format seconds into hh:mm:ss format
function formatTime(seconds) {
    var hours = Math.floor(seconds / 3600);
    var minutes = Math.floor((seconds % 3600) / 60);
    var remainingSeconds = seconds % 60;
    return (hours < 10 ? "0" + hours : hours) + ":" +
           (minutes < 10 ? "0" + minutes : minutes) + ":" +
           (remainingSeconds < 10 ? "0" + remainingSeconds : remainingSeconds);
}

// Parse a time string (hh:mm:ss) into seconds
function parseTime(timeStr) {
    var parts = timeStr.split(":");
    if (parts.length !== 3) return 0;
    var hours = parseInt(parts[0]) || 0;
    var minutes = parseInt(parts[1]) || 0;
    var seconds = parseInt(parts[2]) || 0;
    return hours * 3600 + minutes * 60 + seconds;
}

// Lock or unlock the timer input based on running state
function lockTimerInput(locked) {
    var timerInput = document.getElementById("timerDisplay");
    if (locked) {
        timerInput.setAttribute("readonly", true);
    } else {
        timerInput.removeAttribute("readonly");
    }
}

function startTimer() {
    var timerInput = document.getElementById("timerDisplay");
    var duration = parseTime(timerInput.value);
    if (duration <= 0) {
        alert("Please enter a valid time in hh:mm:ss format.");
        return;
    }
    lockTimerInput(true);
    fetch('/start/' + duration);
}

function pauseTimer() {
    fetch('/pause');
    lockTimerInput(false);
}

function resumeTimer() {
    lockTimerInput(true);
    fetch('/resume');
}

function presetTimer(duration) {
    lockTimerInput(true);
    fetch('/start/' + duration);
}

// Claim active: tells the server this device wants to be the active device.
function claimActive() {
    fetch('/claim_active/' + myDeviceId)
        .then(response => response.text())
        .then(txt => console.log("Claim active response:", txt))
        .catch(err => console.error(err));
}
