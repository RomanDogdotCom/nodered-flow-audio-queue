# Node-RED Audio Queue Flow

DESCRIPTION:
This project provides a Node-RED function node that implements a FIFO audio playback queue. Each message (MP3 filename) is outputed one at a time, with a delay based on file size. It’s designed for use with TTS systems, audio alerts, sound boards, and automated playback.


## 💡 Features

- FIFO queue: messages are played in the order received
- Dynamic delay: based on file size (ms per KB)
- Minimum enforced delay between messages
- Auto-starts when a message is queued
- Supports manual queue clearing via `msg.clear`
- No external modules required


## 📦 Installation

1. Open your Node-RED editor
2. Add a **Function node**
3. Paste in the code from `playback_queue.js`
4. Wire it like this:

[Inject] → [Function: Audio Queue] → [Your Audio Player Node]


## ⚙️ Configuration

These two values control timing and can be edited at the top of the function:

const scaleFactor = 100; // ms per KB
const minDelay = 1000;   // minimum 1 second between files

scaleFactor: controls spacing based on file size
minDelay: ensures a minimum delay between all outputs

You can tune these based on how long it takes your audio system to play each file.


## 🔁 Inputs
| Field       | Type    | Description                                          |
|-------------|---------|------------------------------------------------------|
| `payload`   | string  | Filename to play (e.g., `"HelloWorld.mp3"`)          |
| `size`      | number  | File size in bytes (used to compute playback delay)  |
| `clear`     | boolean | *(optional)* `true` to clear and reset the queue     |


## 🔊 Output
Each file is outputed as a new message:
{ "payload": "hello.mp3" }

Output can be sent to:
* EXEC node (e.g., mpg123 /path/{{payload}})
* MQTT
* File streaming
* Or, any custom audio handling node


## 🧪 Testing
You can test with a simple Inject node set to JSON:
{
  "payload": "test.mp3",
  "size": 204800
}

To clear the queue:
{ "clear": true }

For a test sequence:

Quickly Inject three messages with different filenames and sizes

Watch the output space them out over time (tune as needed)

Observe that the timing is based on the size field.
(I personally use a FS-FileSize Node for this.)

Send a clear: true to immediately flush the queue


## 📘 How It Works
* Maintains a global audioQueue array
* Maintains a isPlaying flag so queue isn't started twice
* setTimeout() handles delay based on file size
* clear command flushes both queue and state immediately
