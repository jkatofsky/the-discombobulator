import Pizzicato from 'pizzicato';

function rand() {
    return Math.random();
}

function randBool() {
    return rand() > 0.5;
}

function randRange(min, max) {
    return Math.random() * (max - min) + min;
}

function randRangeInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function getRandomEffects() {
    const effects = [
        new Pizzicato.Effects.PingPongDelay({
            feedback: rand(),
            time: rand(),
            mix: rand()
        }),
        new Pizzicato.Effects.Distortion({
            gain: rand()
        }),
        new Pizzicato.Effects.Flanger({
            time: rand(),
            speed: rand(),
            depth: rand(),
            feedback: rand(),
            mix: rand()
        }),
        new Pizzicato.Effects.LowPassFilter({
            frequency: randRangeInt(500, 22050)
        }),
        new Pizzicato.Effects.StereoPanner({
            pan: randRange(-1, 1)
        }),
        new Pizzicato.Effects.Reverb({
            time: randRange(0.0001, 10),
            decay: randRange(0, 10),
            reverse: randBool(),
            mix: rand()
        }),
        new Pizzicato.Effects.Tremolo({
            speed: randRange(0, 20),
            depth: rand(),
            mix: rand()
        })
    ];
    shuffle(effects);
    return effects.slice(0, randRangeInt(1, 7));
}

export function discombobulate(audio) {
    audio.effects.forEach(effect => audio.removeEffect(effect));
    const effects = getRandomEffects();
    effects.forEach(effect => audio.addEffect(effect));
}

// all of below stolen from: https://stackoverflow.com/questions/62172398/convert-audiobuffer-to-arraybuffer-blob-for-wav-download

// Returns Uint8Array of WAV bytes
function getWavBytes(buffer, options) {
    const type = options.isFloat ? Float32Array : Uint16Array
    const numFrames = buffer.byteLength / type.BYTES_PER_ELEMENT

    const headerBytes = getWavHeader(Object.assign({}, options, { numFrames }))
    const wavBytes = new Uint8Array(headerBytes.length + buffer.byteLength);

    // prepend header, then add pcmBytes
    wavBytes.set(headerBytes, 0)
    wavBytes.set(new Uint8Array(buffer), headerBytes.length)

    return wavBytes
}

// adapted from https://gist.github.com/also/900023
// returns Uint8Array of WAV header bytes
function getWavHeader(options) {
    const numFrames = options.numFrames
    const numChannels = options.numChannels || 2
    const sampleRate = options.sampleRate || 44100
    const bytesPerSample = options.isFloat ? 4 : 2
    const format = options.isFloat ? 3 : 1

    const blockAlign = numChannels * bytesPerSample
    const byteRate = sampleRate * blockAlign
    const dataSize = numFrames * blockAlign

    const buffer = new ArrayBuffer(44)
    const dv = new DataView(buffer)

    let p = 0

    function writeString(s) {
        for (let i = 0; i < s.length; i++) {
            dv.setUint8(p + i, s.charCodeAt(i))
        }
        p += s.length
    }

    function writeUint32(d) {
        dv.setUint32(p, d, true)
        p += 4
    }

    function writeUint16(d) {
        dv.setUint16(p, d, true)
        p += 2
    }

    writeString('RIFF')              // ChunkID
    writeUint32(dataSize + 36)       // ChunkSize
    writeString('WAVE')              // Format
    writeString('fmt ')              // Subchunk1ID
    writeUint32(16)                  // Subchunk1Size
    writeUint16(format)              // AudioFormat
    writeUint16(numChannels)         // NumChannels
    writeUint32(sampleRate)          // SampleRate
    writeUint32(byteRate)            // ByteRate
    writeUint16(blockAlign)          // BlockAlign
    writeUint16(bytesPerSample * 8)  // BitsPerSample
    writeString('data')              // Subchunk2ID
    writeUint32(dataSize)            // Subchunk2Size

    return new Uint8Array(buffer)
}

export function downloadAudio(audioBuffer) {
    const [left, right] = [audioBuffer.getChannelData(0), audioBuffer.getChannelData(1)]

    // interleaved
    const interleaved = new Float32Array(left.length + right.length)
    for (let src = 0, dst = 0; src < left.length; src++, dst += 2) {
        interleaved[dst] = left[src]
        interleaved[dst + 1] = right[src]
    }

    // get WAV file bytes and audio params of your audio source
    const wavBytes = getWavBytes(interleaved.buffer, {
        isFloat: true,       // floating point or 16-bit integer
        numChannels: 2,
        sampleRate: 48000,
    })
    const wav = new Blob([wavBytes], { type: 'audio/wav' })

    // create download link and append to Dom
    const downloadLink = document.createElement('a')
    downloadLink.href = URL.createObjectURL(wav)
    downloadLink.setAttribute('download', 'discombobulated.wav') // name file
    downloadLink.click();
}