/*
  CHELAS Y CÓDIGO CREATIVO · EJERCICIO 2
  Letras construidas con formas.
  Modifica los valores de la sección 01 y guarda (Cmd + S).
*/

// ── 01. PERSONALIZA AQUÍ ─────────────────────────────────────
const TEXTO = "Ro";                // Texto 
const TAMANO_TEXTO = 320;           // Tamaño objetivo del texto, en píxeles.
const TRACKING = 8;                 // Espacio EXTRA entre letras, en píxeles.
const FUENTE = "assets/Zapfino.ttf";
// Para cambiar la tipografía:
// 1) copia otro archivo .otf o .ttf dentro de la carpeta assets/
// 2) cambia aquí el nombre del archivo.

const FONDO = "#0004ff";            // Cambia por cualquier color HEX.
const COLOR_FORMA = "#151516";      // Color de las formas.
const FORMA = "svg";            // "circulo", "cuadrado", "triangulo" o "svg".
const ARCHIVO_SVG = "assets/fav.svg"; // Para usarlo: guarda el SVG en assets/ y escribe FORMA = "svg".           

// Formas y separación
const SEPARACION = 10;               // Distancia entre centros de las formas.
const TAMANO_FORMA = 34;            // Tamaño de cada forma.
const CALIDAD_SVG = 6;             // Resolución del SVG.
const SVG_ESCALA_HOVER = 1.2;         // Tamaño al pasar el mouse: 2 = doble, 3 = triple.
const RADIO_REPULSION = 120;        // Distancia a la que el mouse afecta las formas.
const FUERZA_REPULSION = 400;       // Desplazamiento máximo, en píxeles.
const SUAVIDAD_REPULSION = 0.12;    // Entre 0 y 1: mayor valor = movimiento más rápido.

//-----------------------------------------
const SVG_ESCALA = 1.2;
let fuenteCargada = null;
let svgCargado = null; 
let puntos = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(4);
  noStroke();

  if (FORMA === "svg") cargarSVG();


  loadFont(
    FUENTE,
    (font) => {
      fuenteCargada = font;
      construirLetras();
    },
    () => {
      console.warn("No se encontró la fuente. Usando sans-serif temporalmente. Copia el .otf en assets/.");
      construirLetras();
    }
  );

  construirLetras();
}

function draw() {
  background(FONDO);
  fill(COLOR_FORMA);
  drawingContext.imageSmoothingEnabled = true;
  drawingContext.imageSmoothingQuality = "high";

  for (const punto of puntos) {
    const dx = punto.origenX - mouseX;
    const dy = punto.origenY - mouseY;
    const distancia = Math.hypot(dx, dy);
    const mouseDentro = mouseX >= 0 && mouseX < width && mouseY >= 0 && mouseY < height;
    let destinoX = punto.origenX;
    let destinoY = punto.origenY;

    if (mouseDentro && distancia < RADIO_REPULSION) {
      const fuerza = (1 - distancia / RADIO_REPULSION) * FUERZA_REPULSION;
      const direccionX = distancia > 0 ? dx / distancia : 1;
      const direccionY = distancia > 0 ? dy / distancia : 0;
      destinoX += direccionX * fuerza;
      destinoY += direccionY * fuerza;
    }

    // Suaviza la separación y el regreso a la silueta original.
    const paso = 1 - Math.pow(1 - SUAVIDAD_REPULSION, Math.min(deltaTime, 50) / (1000 / 60));
    punto.x += (destinoX - punto.x) * paso;
    punto.y += (destinoY - punto.y) * paso;
    dibujarForma(punto.x, punto.y, punto.origenX, punto.origenY);
  }
}

// ── 03. DIBUJA UNA FORMA POR CADA PUNTO ───────────────────────
function dibujarForma(x, y, origenX = x, origenY = y) {
  if (FORMA === "svg") {
    if (svgCargado) {
      const tamBase = TAMANO_FORMA * SVG_ESCALA;
      const encima = mouseX >= 0 && mouseX < width && mouseY >= 0 && mouseY < height
        && Math.abs(mouseX - origenX) <= tamBase / 2
        && Math.abs(mouseY - origenY) <= tamBase / 2;
      const tam = tamBase * (encima ? SVG_ESCALA_HOVER : 1);
      // Dibujamos un canvas de alta resolución reducido a su tamaño final.
      drawingContext.drawImage(svgCargado, x - tam / 2, y - tam / 2, tam, tam);
    }
  } else if (FORMA === "cuadrado") {
    rectMode(CENTER);
    rect(x, y, TAMANO_FORMA, TAMANO_FORMA);
  } else if (FORMA === "triangulo") {
    const r = TAMANO_FORMA / 2;
    triangle(x, y - r, x - r, y + r, x + r, y + r);
  } else {
    circle(x, y, TAMANO_FORMA);
  }
}

// ── 04. CONSTRUYE EL TEXTO COMO UNA MÁSCARA ───────────────────
function construirLetras() {
  puntos = [];

  const mascara = createGraphics(width, height);
  mascara.pixelDensity(1);
  mascara.clear();
  mascara.noStroke();
  mascara.fill(255);
  mascara.textFont(fuenteCargada || "sans-serif");

  // Conserva 220 px siempre que la palabra quepa en la pantalla.
  // En pantallas pequeñas reduce el tamaño automáticamente.
  let tam = TAMANO_TEXTO;
  mascara.textSize(tam);
  let ancho = anchoPalabra(mascara, TEXTO, TRACKING);

  const margen = 40;
  if (ancho > width - margen * 2) {
    tam *= (width - margen * 2) / ancho;
    mascara.textSize(tam);
    ancho = anchoPalabra(mascara, TEXTO, TRACKING);
  }

  // Escribe cada carácter por separado para controlar el tracking.
  mascara.textAlign(LEFT, BASELINE);
  const ascent = mascara.textAscent();
  const descent = mascara.textDescent();
  let x = (width - ancho) / 2;
  const y = height / 2 + (ascent - descent) / 2;

  for (const letra of TEXTO) {
    mascara.text(letra, x, y);
    x += mascara.textWidth(letra) + TRACKING;
  }

  // Coloca puntos solo dentro de la silueta del texto.
  mascara.loadPixels();
  for (let py = SEPARACION / 2; py < height; py += SEPARACION) {
    for (let px = SEPARACION / 2; px < width; px += SEPARACION) {
      const ix = Math.floor(px);
      const iy = Math.floor(py);
      const index = 4 * (iy * width + ix) + 3;
      const alpha = mascara.pixels[index];
      if (alpha > 127) {
        puntos.push({ x: px, y: py, origenX: px, origenY: py });
      }
    }
  }

  mascara.remove();
}

function anchoPalabra(g, palabra, tracking) {
  return [...palabra].reduce((total, letra) => total + g.textWidth(letra), 0)
    + Math.max(0, [...palabra].length - 1) * tracking;
}

// ── 05. CARGA UN SVG DE LA CARPETA ASSETS ────────────────────
// El navegador normalmente convierte el SVG a píxeles al dibujarlo.
// Por eso creamos una copia rasterizada a una resolución MUCHO MAYOR
// que su tamaño en pantalla. El SVG original sigue siendo vectorial.
function cargarSVG() {
  const svgOriginal = new Image();
  svgOriginal.onload = () => {
    const tamFinal = TAMANO_FORMA * SVG_ESCALA * SVG_ESCALA_HOVER;
    const resolucion = Math.max(1, Math.ceil(tamFinal * CALIDAD_SVG * (window.devicePixelRatio || 1)));
    const buffer = document.createElement("canvas");
    buffer.width = resolucion;
    buffer.height = resolucion;
    const contexto = buffer.getContext("2d");
    contexto.imageSmoothingEnabled = true;
    contexto.imageSmoothingQuality = "high";
    contexto.drawImage(svgOriginal, 0, 0, resolucion, resolucion);
    svgCargado = buffer;
  };
  svgOriginal.onerror = () => {
    console.error("No se pudo cargar el SVG:", ARCHIVO_SVG,
      "Comprueba el nombre del archivo y que esté dentro de assets/.");
  };
  svgOriginal.src = ARCHIVO_SVG;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  construirLetras();
}
