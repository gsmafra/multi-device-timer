// Generate or retrieve a unique device ID
export let myDeviceId = localStorage.getItem('deviceId');
if (!myDeviceId) {
    myDeviceId = 'device-' + Math.random().toString(36).substr(2, 8);
    localStorage.setItem('deviceId', myDeviceId);
}
  
export let currentActiveDevice = null;

// Update active device status based on socket events (you might also export a function to update the UI)
export function updateActiveDevice(activeDevice) {
    currentActiveDevice = activeDevice;
    const activeStatusElem = document.getElementById('activeStatus');
    if (currentActiveDevice === myDeviceId) {
        activeStatusElem.textContent = "This is the active device";
    } else if (currentActiveDevice) {
        activeStatusElem.textContent = "Active device: " + currentActiveDevice;
    } else {
        activeStatusElem.textContent = "No active device";
    }
}
  
// Claim active device
export function claimActive() {
    fetch('/claim_active/' + myDeviceId)
        .then(response => response.text())
        .then(txt => console.log("Claim active response:", txt))
        .catch(err => console.error(err));
}
  
// Listen for active_device updates
import { socket } from './socket.js';
socket.on('active_device', function(data) {
    updateActiveDevice(data.active_device);
});
