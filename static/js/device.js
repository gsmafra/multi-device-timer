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
    const claimBtn = document.getElementById('claimActiveButton');
    if (!claimBtn) return;

    if (activeDevice === myDeviceId) {
        claimBtn.classList.add("active");
        claimBtn.textContent = "device is active";
    } else if (activeDevice) {  // When another device is active, allow clicking to force-claim
        claimBtn.classList.remove("active");
        claimBtn.textContent = "claim active";
    } else {
        claimBtn.classList.remove("active");
        claimBtn.textContent = "claim active";
    }
}
  
// Claim active device
export function claimActive() {
    // Send claim request to the server (ensure your backend marks the device as active)
    fetch('/claim_active/' + myDeviceId)
        .then(response => {
            if (response.ok) {
                updateActiveDevice(myDeviceId);
            }
        })
        .catch(error => console.error("Error claiming active:", error));
}
  
// Listen for active_device updates
import { socket } from './socket.js';
socket.on('active_device', function(data) {
    updateActiveDevice(data.active_device);
});
