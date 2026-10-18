let miTipografia;

function preload() {
    miTipografia = loadFont('ABCCameraTrial-RegularItalic.otf');
}

function setup (){ 
    createCanvas(windowWidth, windowHeight);
    textFont(miTipografia);
    background('#757575');
}
function draw(){
    // Mueve el mouse hacia la derecha para aumentar el tamaño del texto.
    let tamano = map(mouseX, 0, width, 30, 400, true);
    textSize(tamano);
    blendMode(ADD);
    // Los dos últimos dígitos HEX controlan la opacidad: 00 transparente, FF opaco.
    fill('#00f7ff20');
    stroke('#ff00c8FF');
    strokeWeight(2);
    textAlign(CENTER, CENTER);
    text('AB', mouseX, mouseY);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    blendMode(BLEND);
    background('#757575');
}

function touchMoved() {
    // Evita que el navegador desplace la página mientras dibujas con el dedo.
    return false;
}
