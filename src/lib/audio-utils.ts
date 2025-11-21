const workletCode = `
class PCMProcessor extends AudioWorkletProcessor {
  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (input.length > 0) {
      const inputData = input[0];
      const pcmData = new Int16Array(inputData.length);
      for (let i = 0; i < inputData.length; i++) {
        const s = Math.max(-1, Math.min(1, inputData[i]));
        pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
      }
      this.port.postMessage(pcmData);
    }
    return true;
  }
}
registerProcessor('pcm-processor', PCMProcessor);
`;

export class AudioRecorder {
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private processor: AudioWorkletNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private onDataAvailable: (data: string) => void;
  public sampleRate: number = 16000; // Default, updated on start
  private audioBuffer: Int16Array[] = [];
  private bufferSize = 0;

  constructor(onDataAvailable: (data: string) => void) {
    this.onDataAvailable = onDataAvailable;
  }

  async start() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioContext = new AudioContext();

      // Get the sample rate to send to the API
      this.sampleRate = this.audioContext.sampleRate;

      const blob = new Blob([workletCode], { type: "application/javascript" });
      const blobUrl = URL.createObjectURL(blob);
      await this.audioContext.audioWorklet.addModule(blobUrl);
      URL.revokeObjectURL(blobUrl);

      this.source = this.audioContext.createMediaStreamSource(this.stream);
      this.processor = new AudioWorkletNode(this.audioContext, "pcm-processor");

      this.processor.port.onmessage = (e) => {
        const data = e.data as Int16Array;
        this.audioBuffer.push(data);
        this.bufferSize += data.length;

        if (this.bufferSize >= 4096) {
          this.flush();
        }
      };

      this.source.connect(this.processor);
      this.processor.connect(this.audioContext.destination); // Keep alive
    } catch (error) {
      console.error("Error starting audio recording:", error);
      throw error;
    }
  }

  private flush() {
    if (this.bufferSize === 0) return;

    const merged = new Int16Array(this.bufferSize);
    let offset = 0;
    for (const chunk of this.audioBuffer) {
      merged.set(chunk, offset);
      offset += chunk.length;
    }

    // Convert to base64
    const buffer = merged.buffer;
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    // Using a more efficient approach for large strings if needed, but loop is fine for 8KB
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);

    this.onDataAvailable(base64);

    this.audioBuffer = [];
    this.bufferSize = 0;
  }

  stop() {
    if (this.processor) {
      this.processor.disconnect();
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
    this.audioBuffer = [];
    this.bufferSize = 0;
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
