import { socket } from './socket.js';
import { myDeviceId, claimActive } from './device.js';
import { formatTime, parseTime, lockTimerInput } from './timerUI.js';
import { startTimer, pauseTimer, presetTimer } from './timerActions.js';

// Preload the audio file
const audio = new Audio('static/siren-alert-96052.mp3');
audio.loop = true;
  
// Listen for timer_finished event and trigger alert only if active
socket.on('timer_finished', function() {
    // Assume currentActiveDevice is updated in device.js
    import('./device.js').then(module => {
       const { myDeviceId, currentActiveDevice } = module;
       if (myDeviceId === currentActiveDevice) {
           audio.currentTime = 0;
           audio.play();
           document.body.classList.add('flashing');
       } else {
           console.log('Timer finished, but this device is not active.');
       }
    });
});

socket.on('update_timer', function(data) {
    document.getElementById("timerDisplay").value = formatTime(data.time_left);
});
  
// Stop the alert function can be here
window.dismissAlert = function() {
    audio.pause();
    audio.currentTime = 0;
    document.body.classList.remove('flashing');
};
  
// Expose functions to the global scope for HTML event handlers
window.startTimer = startTimer;
window.pauseTimer = pauseTimer;
window.presetTimer = presetTimer;
window.claimActive = claimActive;
window.formatTime = formatTime;
window.parseTime = parseTime;
window.lockTimerInput = lockTimerInput;
