// Set up your Socket.IO connection
var socket = io();

// Preload the audio file
var audio = new Audio('static/siren-alert-96052.mp3');
audio.loop = true; // Enable looping

// When the timer finishes
socket.on('timer_finished', function() {
    audio.currentTime = 0; // Reset playback position
    audio.play();          // Play the sound
    document.body.classList.add('flashing'); // Start flashing effect
});

// Stop the audio playback and flashing effect
function dismissAlert() {
    audio.pause();
    audio.currentTime = 0;
    document.body.classList.remove('flashing');
}

// Update the timer display (the input value)
socket.on('update_timer', function(data) {
    document.getElementById("timerDisplay").value = formatTime(data.time_left);
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

// Lock or unlock the timer input based on whether the timer is running
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

function resetTimer() {
    fetch('/reset');
    lockTimerInput(false);
}

function resumeTimer() {
    lockTimerInput(true);
    fetch('/resume');
}
