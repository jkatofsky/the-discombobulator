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

export default function discombobulate(audio) {
    audio.effects.forEach(effect => audio.removeEffect(effect));
    const effects = getRandomEffects();
    effects.forEach(effect => audio.addEffect(effect));
}