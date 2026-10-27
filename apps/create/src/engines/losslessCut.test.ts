import { describe, it } from "node:test";
import assert from "node:assert";

function handleTrimAudioWAV(
  sampleRate: number,
  numChannels: number,
  channelDataSamples: Float32Array[],
  startSec: number,
  endSec: number
): Uint8Array {
  const startSample = Math.floor(startSec * sampleRate);
  const endSample = Math.floor(endSec * sampleRate);
  const frameCount = Math.max(0, endSample - startSample);

  const dataLength = frameCount * numChannels * 2;
  const bufferLength = 44 + dataLength;
  const arrayBuffer = new ArrayBuffer(bufferLength);
  const view = new DataView(arrayBuffer);

  /* RIFF identifier */
  view.setUint32(0, 0x52494646, false); // "RIFF"
  view.setUint32(4, 36 + dataLength, true);
  view.setUint32(8, 0x57415645, false); // "WAVE"
  /* fmt sub-chunk */
  view.setUint32(12, 0x666d7420, false); // "fmt "
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * 2, true);
  view.setUint16(32, numChannels * 2, true);
  view.setUint16(34, 16, true); // 16-bit
  /* data sub-chunk */
  view.setUint32(36, 0x64617461, false); // "data"
  view.setUint32(40, dataLength, true);

  let offset = 44;
  for (let i = 0; i < frameCount; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const channel = channelDataSamples[ch] || new Float32Array(0);
      const sample = Math.max(-1, Math.min(1, channel[startSample + i] || 0));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }

  return new Uint8Array(arrayBuffer);
}

describe("LosslessCut Audio Buffer Slicing Logic", () => {
  it("should generate a valid 44-byte WAV header and PCM data payload for trimmed segment", () => {
    const sampleRate = 44100;
    const numChannels = 1;
    // 2 seconds of dummy samples
    const channelData = new Float32Array(sampleRate * 2);
    for (let i = 0; i < channelData.length; i++) {
      channelData[i] = Math.sin((i / sampleRate) * 440 * Math.PI * 2);
    }

    // Cut 0.5s to 1.5s (1.0s segment)
    const wavBytes = handleTrimAudioWAV(sampleRate, numChannels, [channelData], 0.5, 1.5);

    assert.ok(wavBytes.length > 44, "Should be larger than header size");

    const view = new DataView(wavBytes.buffer);
    const riffHeader = String.fromCharCode(wavBytes[0]!, wavBytes[1]!, wavBytes[2]!, wavBytes[3]!);
    const waveHeader = String.fromCharCode(wavBytes[8]!, wavBytes[9]!, wavBytes[10]!, wavBytes[11]!);

    assert.strictEqual(riffHeader, "RIFF");
    assert.strictEqual(waveHeader, "WAVE");

    const numChannelsInHeader = view.getUint16(22, true);
    const sampleRateInHeader = view.getUint32(24, true);

    assert.strictEqual(numChannelsInHeader, 1);
    assert.strictEqual(sampleRateInHeader, 44100);
  });
});
