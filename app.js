const synth = new Tone.Synth().toDestination();

let canvas, scale;

const currentScale = 19;
const toneMaxWidth = 50;

const scales = {
    12: [ 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0 ],
    19: [ 0, 1, 2, 0, 1, 2, 0, 3, 0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 3 ],
    24: [ 0, 2, 1, 3, 0, 2, 1, 3, 0, 2, 0, 2, 1, 3, 0, 2, 1, 3, 0, 2, 1, 3, 0, 2 ],
};

const colors = [ 'white', 'black', 'lightgreen', 'brown' ];

function setup() {
    const container = select('#container');
    const controls = select('#controls');

    canvas = createCanvas(windowWidth, 300);
    canvas.parent(container);
}

function windowResized() {
    resizeCanvas(windowWidth, height);
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
    whiteNotes[whiteNotes.length - 1][1] = width;

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

function mousePressed() {
    const scale = scales[currentScale];
    const toneCount = scale.length;
    const toneWidth = Math.min(toneMaxWidth, width / (toneCount + 1));

    const n = Math.floor(mouseX / toneWidth);
    const freq = 440 / 2 * Math.pow(2, (n + 3) / toneCount);
    synth.triggerAttack(freq);
}

function mouseReleased() {
    synth.triggerRelease();
}
