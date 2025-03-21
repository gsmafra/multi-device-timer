export const socket = io();

// Listen for timer_finished event
socket.on('timer_finished', function() {
    // You can handle the alert behavior in the activeDevice module
});
