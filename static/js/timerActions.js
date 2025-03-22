import { parseTime, lockTimerInput } from './timerUI.js';
  
export function startTimer() {
    const timerInput = document.getElementById("timerDisplay");
    const duration = parseTime(timerInput.value);
    if (duration <= 0) {
        alert("Please enter a valid time in hh:mm:ss format.");
        return;
    }
    lockTimerInput(true);
    fetch('/start/' + duration);
}
  
export function pauseTimer() {
    fetch('/pause');
    lockTimerInput(false);
}

export function presetTimer(duration) {
    lockTimerInput(true);
    fetch('/start/' + duration);
}
