export default class {
  setString(view, offset, str) {
    let len = str.length;
    for (let i = 0; i < len; ++i)
      view.setUint8(offset + i, str.charCodeAt(i));
  }
  constructor(config) {
    this.min = Math.min
    this.max = Math.max
    this.sampleRate = config.sampleRate;
    this.numSamples = 0;
    this.dataViews = [];
  }
  encode(buffer) {
    let len = buffer.length,
      view = new DataView(new ArrayBuffer(len * 2)),
      offset = 0;
    for (let i = 0; i < len; ++i) {
      let x = buffer[i] * 0x7fff;
      view.setInt16(offset, x < 0 ? this.max(x, -0x8000) : this.min(x, 0x7fff), true);
      offset += 2;
    }
    this.dataViews.push(view);
    this.numSamples += len;
  }
  finish() {
    let dataSize = this.numSamples * 2
    let view = new DataView(new ArrayBuffer(44));
    this.setString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    this.setString(view, 8, 'WAVE');
    this.setString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, this.sampleRate, true);
    view.setUint32(28, this.sampleRate * 4, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    this.setString(view, 36, 'data');
    view.setUint32(40, dataSize, true);
    this.dataViews.unshift(view);
    let blob = new Blob(this.dataViews, { type: 'audio/wav' });
    this.cleanup();
    return {
      id    : Date.now(),
      blob  : blob,
      url   : URL.createObjectURL(blob)
    }
  }
  cleanup() {
    console.log(this.dataViews)
    delete this.dataViews;
  }
}
