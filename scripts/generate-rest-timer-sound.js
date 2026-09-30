#!/usr/bin/env node
// Gera assets/sounds/rest-timer-end.wav: dois beeps curtos (880 Hz, 120 ms cada,
// separados por 80 ms de silêncio), PCM 16-bit mono. Roda uma vez; o .wav gerado
// é commitado como asset — não é regenerado em runtime.
const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 44100;
const BEEP_HZ = 880;
const BEEP_MS = 120;
const GAP_MS = 80;
const AMPLITUDE = 0.5;

function beepSamples(ms) {
  const n = Math.round((SAMPLE_RATE * ms) / 1000);
  const samples = new Int16Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    // fade in/out curto para evitar clique
    const fade = Math.min(1, i / (SAMPLE_RATE * 0.005), (n - i) / (SAMPLE_RATE * 0.005));
    samples[i] = Math.round(AMPLITUDE * fade * 32767 * Math.sin(2 * Math.PI * BEEP_HZ * t));
  }
  return samples;
}

function silenceSamples(ms) {
  return new Int16Array(Math.round((SAMPLE_RATE * ms) / 1000));
}

function concat(...arrays) {
  const total = arrays.reduce((sum, a) => sum + a.length, 0);
  const out = new Int16Array(total);
  let offset = 0;
  for (const a of arrays) {
    out.set(a, offset);
    offset += a.length;
  }
  return out;
}

function writeWavHeader(dataLength) {
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataLength, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16); // fmt chunk size
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(1, 22); // mono
  header.writeUInt32LE(SAMPLE_RATE, 24);
  header.writeUInt32LE(SAMPLE_RATE * 2, 28); // byte rate (16-bit mono)
  header.writeUInt16LE(2, 32); // block align
  header.writeUInt16LE(16, 34); // bits per sample
  header.write('data', 36);
  header.writeUInt32LE(dataLength, 40);
  return header;
}

const samples = concat(beepSamples(BEEP_MS), silenceSamples(GAP_MS), beepSamples(BEEP_MS));
const dataBuffer = Buffer.from(samples.buffer);
const wav = Buffer.concat([writeWavHeader(dataBuffer.length), dataBuffer]);

const outDir = path.join(__dirname, '..', 'assets', 'sounds');
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, 'rest-timer-end.wav');
fs.writeFileSync(outPath, wav);
console.log(`Gerado: ${outPath} (${wav.length} bytes)`);
