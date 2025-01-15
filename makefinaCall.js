// Importing crypto functions for hash generation
async function sha256(input) {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

// Generate Audio Fingerprint
async function generateAudioFingerprint() {
  return new Promise((resolve) => {
    try {
      var context = null;
      var currentTime = null;
      var oscillator = null;
      var compressor = null;
      var fingerprint = null;
      function run() {
        try {
          setup();
          oscillator.connect(compressor);
          compressor.connect(context.destination);
          oscillator.start(0);
          context.startRendering();
          context.oncomplete = onComplete;
        } catch (e) {}
      }
      function setup() {
        setContext();
        currentTime = context.currentTime;
        setOscillator();
        setCompressor();
      }
      function setContext() {
        var audioContext =
          window.OfflineAudioContext || window.webkitOfflineAudioContext;
        context = new audioContext(1, 44100, 44100);
      }
      function setOscillator() {
        oscillator = context.createOscillator();
        oscillator.type = "triangle";
        oscillator.frequency.setValueAtTime(10000, currentTime);
      }
      function setCompressor() {
        compressor = context.createDynamicsCompressor();
        setCompressorValueIfDefined("threshold", -50);
        setCompressorValueIfDefined("knee", 40);
        setCompressorValueIfDefined("ratio", 12);
        setCompressorValueIfDefined("reduction", -20);
        setCompressorValueIfDefined("attack", 0);
        setCompressorValueIfDefined("release", 0.25);
      }
      function setCompressorValueIfDefined(item, value) {
        if (
          compressor[item] !== undefined &&
          typeof compressor[item].setValueAtTime === "function"
        ) {
          compressor[item].setValueAtTime(value, context.currentTime);
        }
      }
      function onComplete(event) {
        generateFingerprints(event);
        compressor.disconnect();
      }
      function generateFingerprints(event) {
        var output = null;
        for (var i = 4500; 5e3 > i; i++) {
          var channelData = event.renderedBuffer.getChannelData(0)[i];
          output += Math.abs(channelData);
        }
        fingerprint = output.toString();
        resolve(fingerprint);
      }
      run();
    } catch (e) {
      resolve("audioprint_error");
    }
  });
}

// Generate Canvas Fingerprint
function generateCanvasFingerprint() {
  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    context.textBaseline = "top";
    context.font = "16px Arial";
    context.textBaseline = "alphabetic";
    context.fillStyle = "#f60";
    context.fillRect(125, 1, 62, 20);
    context.fillStyle = "#069";
    context.fillText("Fingerprinting!", 2, 15);
    context.fillStyle = "rgba(102, 204, 0, 0.7)";
    context.fillText("Fingerprinting!", 4, 17);
    const data = canvas.toDataURL();
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      hash = (hash << 5) - hash + data.charCodeAt(i);
      hash |= 0;
    }
    return hash.toString();
  } catch (e) {
    return "canvasprint_error";
  }
}

// Generate Combined Fingerprint
async function generateFingerprint() {
  const audioFingerprint = await generateAudioFingerprint();
  const canvasFingerprint = generateCanvasFingerprint();
  const combined = `${audioFingerprint}-${canvasFingerprint}`;
  const encryptedFingerprint = await sha256(combined);
  return encryptedFingerprint;
}

// Example Usage
generateFingerprint().then((fingerprint) => {
  console.log("Device Fingerprint:", fingerprint);
  const element = document.getElementById("fingerprint");
  element.innerHTML = fingerprint;
});
