import { readTimerInput } from "./timerUI.js";

export function startTimer() {
  const duration = readTimerInput();
  if (duration <= 0) {
    alert("Please enter a valid time.");
    return;
  }
  fetch("/start/" + duration);
}

export function pauseTimer() {
  fetch("/pause");
}

export function presetTimer(duration) {
  fetch("/start/" + duration);
}
