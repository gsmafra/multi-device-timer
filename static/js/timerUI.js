// Format seconds into hh:mm:ss format
export function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return (hours < 10 ? "0" + hours : hours) + ":" +
           (minutes < 10 ? "0" + minutes : minutes) + ":" +
           (remainingSeconds < 10 ? "0" + remainingSeconds : remainingSeconds);
}
  
// Parse a time string (hh:mm:ss) into seconds
export function parseTime(timeStr) {
    const parts = timeStr.split(":");
    if (parts.length !== 3) return 0;
    const hours = parseInt(parts[0]) || 0;
    const minutes = parseInt(parts[1]) || 0;
    const seconds = parseInt(parts[2]) || 0;
    return hours * 3600 + minutes * 60 + seconds;
}
  
// Lock or unlock the timer input based on running state
export function lockTimerInput(locked) {
    const timerInput = document.getElementById("timerDisplay");
    if (locked) {
        timerInput.setAttribute("readonly", true);
    } else {
        timerInput.removeAttribute("readonly");
    }
}
