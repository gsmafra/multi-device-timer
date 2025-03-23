import { socket } from './socket.js';
import { myDeviceId, claimActive } from './device.js';
import { formatTime, parseTime, lockTimerInput, updateTimerDisplay } from './timerUI.js';
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
    updateTimerDisplay(data.time_left);
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

// Prevent non-numeric keys and colon input in the timer field
document.addEventListener("DOMContentLoaded", () => {
    const inputs = document.querySelectorAll(".timer-container input");
  
    inputs.forEach((input, idx) => {
        input.addEventListener("keydown", (event) => {
            const allowedKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"];
            if (allowedKeys.includes(event.key)) return;
            if (!/^\d$/.test(event.key)) {
                event.preventDefault();
            }
        });
  
        input.addEventListener("input", () => {
            if (input.value.length === 2 && idx < inputs.length - 1) {
                inputs[idx + 1].focus();
            }
        });
  
        input.addEventListener("paste", (event) => {
            const pasteData = (event.clipboardData || window.clipboardData).getData("text");
            if (!/^\d{1,2}$/.test(pasteData)) {
                event.preventDefault();
            }
        });
    });

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/static/js/sw.js')
                .then(registration => {
                    console.log('Service Worker registered with scope:', registration.scope);
                })
                .catch(err => {
                    console.log('Service Worker registration failed:', err);
                });
        });
    }
});
