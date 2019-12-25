const synth = new Tone.PolySynth({ polyphony: 10 }).toDestination();

let currentScale = '12';
const toneMaxWidth = 50;

const scales = {
    12: [ 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0 ],
    17: [ 0, 1, 2, 0, 1, 2, 0, 0, 1, 2, 0, 1, 2, 0, 1, 2, 0 ],
    19: [ 0, 1, 2, 0, 1, 2, 0, 3, 0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 3 ],
    24: [ 0, 2, 1, 3, 0, 2, 1, 3, 0, 2, 0, 2, 1, 3, 0, 2, 1, 3, 0, 2, 1, 3, 0, 2 ],
};

const colors = [ 'white', 'black', 'lightgreen', 'brown' ];

function setup() {
    const container = select('#container');
    const controls = select('#controls');

    createCanvas(windowWidth, 300).parent(container);

    const scaleSel = createRadio();
    scaleSel.parent(controls);
    scaleSel.html('Scale: ');
    for (const scale in scales) {
        scaleSel.option(scale);
    }
    scaleSel.value(currentScale);
    scaleSel.changed(() => {
        currentScale = scaleSel.value();
        redraw();
    });

    noLoop();
}

function windowResized() {
    resizeCanvas(windowWidth, height);
    redraw();
}

function draw() {
    background(0xEE);
    strokeWeight(5);

    const scale = scales[currentScale];
    const toneCount = scale.length;
    const toneWidth = Math.min(toneMaxWidth, width / (toneCount + 1));
    const totalDrawn = width / toneWidth;

    // Array of [start, end] tuples for the x coordinates
    const whiteNotes = [];

    // Record where we would have drawn the white notes
    for (let i = 0; i < totalDrawn; i++) {
        const toneType = scale[i % toneCount];
        if (toneType === 0) {
            whiteNotes.push([i * toneWidth, (i + 1) * toneWidth]);
        }
    }

    // Even out the boundaries
    for (let i = 1; i < whiteNotes.length; i++) {
        const lastNote = whiteNotes[i - 1];
        const thisNote = whiteNotes[i];

        const newValue = 0.5 * (lastNote[1] + thisNote[0]);

        lastNote[1] = newValue;
        thisNote[0] = newValue;
    }
    whiteNotes[whiteNotes.length - 1][1] = width + 5;

    // Draw them
    fill(colors[0]);
    for (const note of whiteNotes) {
        rect(note[0], 0, note[1] - note[0], 300);
    }

    // Draw all of the other notes
    for (let i = 0; i < totalDrawn; i++) {
        const toneType = scale[i % toneCount];
        if (toneType !== 0) {
            fill(colors[toneType]);
            rect(i * toneWidth, 0, toneWidth, 200);
        }
    }
}

// Mouse handling
let currentFreq = 0;
function mousePressed() {
    const freq = frequencyAt(mouseX, mouseY);
    if (freq) synth.triggerAttack(freq);
    currentFreq = freq;
}

function mouseReleased() {
    const freq = currentFreq;
    if (freq) synth.triggerRelease(freq);
    currentFreq = 0;
}

function mouseDragged() {
    const freq = frequencyAt(mouseX, mouseY);
    if (!freq) {
        synth.releaseAll();
    } else if (currentFreq !== freq) {
        synth.triggerRelease(currentFreq);
        synth.triggerAttack(freq);
    }
    currentFreq = freq;
}

function frequency(n, scale) {
    const toneCount = scale.length;
    // Always start from C,
    // which is a minor third, or 3 normal semitones, above A
    // Also go an octave down
    return 440 * Math.pow(2, (3 - 12) / 12 + n / toneCount);
}

function frequencyAt(x, y) {
    const scale = scales[currentScale];
    const toneCount = scale.length;
    const toneWidth = Math.min(toneMaxWidth, width / (toneCount + 1));

    if (y < 0) {
        return null;
    } else if (y < 200) {
        const n = Math.floor(x / toneWidth);
        return frequency(n, scale);
    } else if (y < 300) {
        // Find the closest whole note if we are on the bottom of the keyboard

        // Scale the position
        const pos = (x / toneWidth) - 0.5;
        const totalDrawn = width / toneWidth;

        // Find the note to the left of the one we think we played
        let left = 0;
        for (let i = Math.floor(pos); i >= 0; i--) {
            if (scale[i % toneCount] === 0) {
                left = i;
                break;
            }
        }

        // Find the note to the right of the one we think we played
        let right = Infinity;
        for (let i = Math.ceil(pos); i <= totalDrawn; i++) {
            if (scale[i % toneCount] === 0) {
                right = i;
                break;
            }
        }

        // Find the closest
        const closest = pos - left < right - pos
              ? left
              : right;
        return frequency(closest, scale);
    } else {
        return null;
    }
}
