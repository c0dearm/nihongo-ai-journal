export class AudioRecorder {
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private onDataAvailable: (data: string) => void;
  public sampleRate: number = 16000; // Default, updated on start

  constructor(onDataAvailable: (data: string) => void) {
    this.onDataAvailable = onDataAvailable;
  }

  async start() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioContext = new AudioContext();

      // Get the sample rate to send to the API
      this.sampleRate = this.audioContext.sampleRate;

      this.source = this.audioContext.createMediaStreamSource(this.stream);
      // Buffer size 4096 provides a good balance between latency and performance
      this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);

      this.processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        // Convert Float32 to Int16
        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          // Clamp values to [-1, 1]
          const s = Math.max(-1, Math.min(1, inputData[i]));
          // Convert to 16-bit PCM
          pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }

        // Convert to base64
        const buffer = pcmData.buffer;
        let binary = "";
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64 = btoa(binary);

        this.onDataAvailable(base64);
      };

      this.source.connect(this.processor);
      this.processor.connect(this.audioContext.destination); // Connect to destination to keep it alive, but mute it if needed (though capturing mic usually doesn't output to speakers by default unless connected)

      // Actually, connecting processor to destination might cause feedback if not careful.
      // But ScriptProcessor needs to be connected to output to fire events in some browsers.
      // A safer way is to connect to a GainNode with gain 0.
      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = 0;
      this.processor.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
    } catch (error) {
      console.error("Error starting audio recording:", error);
      throw error;
    }
  }

  stop() {
    if (this.processor) {
      this.processor.disconnect();
      this.processor.onaudioprocess = null;
      this.processor = null;
    }
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

export class AudioPlayer {
  private audioContext: AudioContext | null = null;
  private scheduledTime = 0;

  constructor() {
    // Initialize AudioContext lazily or on user interaction if possible,
    // but for now we'll create it when playback is requested or session starts.
  }

  private getContext() {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    return this.audioContext;
  }

  async start() {
    const context = this.getContext();
    if (context.state === "suspended") {
      await context.resume();
    }
  }

  play(base64Data: string) {
    const binaryString = atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const int16Data = new Int16Array(bytes.buffer);
    const float32Data = new Float32Array(int16Data.length);

    for (let i = 0; i < int16Data.length; i++) {
      // Convert Int16 to Float32 [-1, 1]
      float32Data[i] = int16Data[i] / 32768.0;
    }

    this.queueAudio(float32Data);
  }

  private queueAudio(data: Float32Array) {
    const context = this.getContext();

    const buffer = context.createBuffer(1, data.length, 24000);
    buffer.getChannelData(0).set(data);

    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);

    const currentTime = context.currentTime;

    if (this.scheduledTime < currentTime) {
      this.scheduledTime = currentTime;
    }

    source.start(this.scheduledTime);
    this.scheduledTime += buffer.duration;
  }

  stop() {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.scheduledTime = 0;
  }
}
