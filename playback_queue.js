// Name: playback_queue.js
//
// Description: Queues audio file names for FIFO playback.
//              Adds delay between files based on file size.
//              Supports msg.clear = true to reset the queue.
//
// Input:
//   msg.payload - string: filename (e.g., "HelloWorld.mp3")
//   msg.size    - number: file size in bytes
//   msg.clear   - boolean (optional): true to clear the queue
//
// Output:
//   msg.payload - string: filename (one at a time, spaced)
//
// REVISIONS:
// 03JUL2025 - Final version, rfesler@gmail.com
// 01JUL2025 - Added clear command, rfesler@gmail.com
// 30JUN2025 - Initial version, rfesler@gmail.com

const scaleFactor = 100; // milliseconds per KB
const minDelay = 1000;   // Minimum delay between files (ms)

// === Handle Clear Command ===
if (msg.clear === true) {
    global.set("audioQueue", []);
    global.set("isPlaying", false);
    node.warn("Audio queue cleared.");
    return null;
}

// === Retrieve or Initialize State ===
let queue = global.get("audioQueue") || [];
let isPlaying = global.get("isPlaying") || false;

// === Queue New Message ===
queue.push({
    payload: msg.payload,
    size: msg.size
});
global.set("audioQueue", queue);

// === Start Playback If Idle ===
if (!isPlaying) {
    global.set("isPlaying", true);
    processQueue();
}

// === Playback Loop ===
function processQueue() {
    let queue = global.get("audioQueue") || [];

    if (queue.length === 0) {
        global.set("isPlaying", false);
        return;
    }

    let next = queue.shift(); // FIFO
    global.set("audioQueue", queue);

    let delay = Math.max(minDelay, (next.size / 1024) * scaleFactor);

    node.send({ payload: next.payload });

    setTimeout(processQueue, delay);
}

return null;
