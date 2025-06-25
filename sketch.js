/* Final project Visual creativity informatics 2025
   Author: Nina Stefekova 498509
   Description: Tool to draw round mosaics/mandalas
   Features:
            Adjust symmetry
            Pick bacground color
            Pick line color
            Use Square brush
            Use filled Square brush
            Use multicolor brush
            Save the picture
            Adjust opacity of brush and fill

  The core of functionality is based on code from Daniel Shifman (coding train):
            https://editor.p5js.org/codingtrain/sketches/JbWCVPX5a
*/

let bgPicker;
let strokePicker;
let slider;
let strokeSlider;
let slider_opacity;
let saveBtn;
let clearBtn;
let aboutBtn;
let symmetry = 6;
let angle;
let strokew = 3;
let pg;
let xoff = 0;
let hu = 100;
let tileSlider;
let tileExportBtn;

let sliderLabel;
let strokeSliderLabel;
let slider_opacityLabel;

function setup() {
  // Basic setup
  textFont('sans-serif');
  angleMode(DEGREES);
  document.body.style.backgroundColor = "black";
  createCanvas(windowWidth / 2, windowWidth / 2);

  // Create drawing layer
  pg = createGraphics(width, height);
  pg.angleMode(DEGREES);
  pg.translate(0, 0);
  pg.colorMode(HSB,255);

  // Save button
  saveBtn = createButton('Save Image');
  saveBtn.position(width + 10, 310);
  saveBtn.style('font-family', 'sans-serif');
  saveBtn.mousePressed(saveDrawing);

  // Clear button
  clearBtn = createButton('Clear Canvas');
  clearBtn.position(width + 10, 410);
  clearBtn.style('font-family', 'sans-serif');
  clearBtn.mousePressed(() => {
    pg.clear();
    xoff = 0;
    hue = 0;
  });

  // Stroke color button
  randomBtn = createButton('Random Stroke Color');
  randomBtn.position(width + 400, 120);
  randomBtn.mousePressed(setRandomStrokeColor);

  // About
  aboutBtn = createButton('About');
  aboutBtn.position(width + 300, 410);
  aboutBtn.style('font-family', 'sans-serif');
  aboutBtn.mousePressed(showAbout);
  
  aboutBox = createDiv(
    `<strong>About This Application</strong><br><br>
    Author: Nina Stefekova (498509)<br>
    Course: PV097 - Visual Creativity Informatics<br>
    Semester: Spring 2025<br><br>
    This application was created as a final project and allows users to create radial mandala-like drawings with customizable brushes, colors, and export functionality.`
  );
  
  aboutBox.position(width + 300, 500);
  aboutBox.style('font-family', 'sans-serif');
  aboutBox.style('background-color', '#eee');
  aboutBox.style('padding', '10px');
  aboutBox.style('border', '1px solid #ccc');
  aboutBox.style('width', '300px');
  aboutBox.hide();

  // File saving
  filenameLabel = createSpan('File Name:');
  filenameLabel.position(width + 10, 270);
  filenameLabel.style('font-family', 'sans-serif');

  filenameInput = createInput('Picture');
  filenameInput.position(width + 90, 270);
  filenameInput.size(120);
  filenameInput.style('font-family', 'sans-serif');


  // Stroke checkboxes
  checkbox_shape = createCheckbox('Square Brush', false).style('font-family', 'sans-serif');;
  checkbox_shape.position(width + 170, 220);

  checkbox_shape_fill = createCheckbox('Square Brush Fill', false).style('font-family', 'sans-serif');;
  checkbox_shape_fill.position(width + 170, 250);

  checkbox_multicolor = createCheckbox('Multi colors', false).style('font-family', 'sans-serif');;
  checkbox_multicolor.position(width + 170, 190);
 
  showGuides = createCheckbox('Show Symmetry Lines', true).style('font-family', 'sans-serif');
  showGuides.position(width + 10, 380);


  // Background Color Picker with label
  createSpan('Background Color:').position(width + 10, 120).style('font-family', 'sans-serif');
  bgPicker = createColorPicker('black');
  bgPicker.position(width + 170, 120);


  // Stroke Color Picker with label
  createSpan('Stroke Color:').position(width + 10, 150).style('font-family', 'sans-serif');
  strokePicker = createColorPicker('white');
  strokePicker.position(width + 170, 150);

  // Fill Color Picker with label
  createSpan('Fill Color:').position(width + 300, 150).style('font-family', 'sans-serif');
  fillPicker = createColorPicker('white');
  fillPicker.position(width + 400, 150);

  // Symmetry slider and label
  sliderLabel = createSpan('Symmetry: ' + symmetry);
  sliderLabel.position(width + 10, 10).style('font-family', 'sans-serif');
  slider = createSlider(1, 10, symmetry);
  slider.position(width + 170, 10);
  slider.size(100);

  // Stroke weight slider and label
  strokeSliderLabel = createSpan('Stroke Weight: ' + strokew);
  strokeSliderLabel.position(width + 10, 40).style('font-family', 'sans-serif');
  strokeSlider = createSlider(1, 100, strokew);
  strokeSlider.position(width + 170, 40);
  strokeSlider.size(100);

  // Stroke opacity slider and label
  slider_opacityLabel = createSpan('Stroke Opacity: ' + slider_opacity?.value());
  slider_opacityLabel.position(width + 10, 70).style('font-family', 'sans-serif');
  slider_opacity = createSlider(1, 255, 255); // Added default value
  slider_opacity.position(width + 170, 70);
  slider_opacity.size(100);

  // Fill opacity slider and label
  fill_opacityLabel = createSpan('Fill Opacity: 255');
  fill_opacityLabel.position(width + 300, 70);
  fill_opacityLabel.style('font-family', 'sans-serif');

  fill_opacity = createSlider(0, 255, 255);
  fill_opacity.position(width + 450, 70);
  fill_opacity.size(100);
  background(bgPicker.color());

  // Make the UI more appealing
  let allSpans = selectAll('span');
  for (let s of allSpans) {
    s.style('color', 'white');
  }


  // Export as Tiles button
  tileSlider = createSlider(1, 10, 1);
  tileSlider.position(width + 100, 470);
  tileSlider.size(100);
  tileSliderLabel = createSpan('Tile Count: ' + tileSlider.value()).position(width + 10, 470).style('font-family', 'sans-serif').style('color', 'white');

  tileExportBtn = createButton('Export Tiled Image');
  tileExportBtn.position(width + 10, 500);
  tileExportBtn.style('font-family', 'sans-serif');
  tileExportBtn.mousePressed(exportTiledImage);

}

// Export drawing as tiles
function exportTiledImage() {
  let tiles = tileSlider.value();
  let tileSize = width;
  let totalSize = tileSize * tiles;
  let tileCanvas = createGraphics(totalSize, totalSize);

  tileCanvas.background(bgPicker.color());
  tileCanvas.colorMode(HSB, 255);

  for (let i = 0; i < tiles; i++) {
    for (let j = 0; j < tiles; j++) {
      tileCanvas.image(pg, i * tileSize, j * tileSize, tileSize, tileSize);
    }
  }

  let name = filenameInput.value().trim() || 'TiledPicture';
  save(tileCanvas, name + '_Tiled.jpg');
}


// Picks random color for stroke
function setRandomStrokeColor() {
  colorMode(RGB);
  strokePicker.value((color(random(255), random(255), random(255))).toString('#rrggbb')); 
}

// Save and export drawing
function saveDrawing() {
  let tempCanvas = createGraphics(width, height);
  let name = filenameInput.value().trim() || 'Picture';
  tempCanvas.background(bgPicker.color());
  tempCanvas.image(pg, 0, 0);
  save(tempCanvas, name + '.jpg');
}

function showAbout() {
  if (aboutBox.style('display') === 'none') {
    aboutBox.show();
  } else {
    aboutBox.hide();
  }
}

function showSymetry(sym){
  push();
  translate(width / 2, height / 2);
  stroke(255, 30);
  strokeWeight(2);
  for (let i = 0; i < sym; i++) {
    rotate(angle);
    line(0, 0, 0, height / 2);
  }
  pop();
}


function draw() {
  // Update UI values
  symmetry = slider.value();
  strokew = strokeSlider.value();
  sliderLabel.html('Symmetry: ' + symmetry);
  strokeSliderLabel.html('Stroke Weight: ' + strokew);
  slider_opacityLabel.html('Stroke Opacity: ' + slider_opacity.value());
  fill_opacityLabel.html('Fill Opacity: ' + fill_opacity.value());
  tileSliderLabel.html('Tile Count: ' +tileSlider.value());
  angle = 360 / symmetry;

  // Set visible background
  background(bgPicker.color());

  // Draw the persistent drawing layer
  image(pg, 0, 0);
  if (showGuides.checked()) {
      showSymetry(symmetry);
  }

  // Only draw if mouse is pressed and inside canvas
  if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height && mouseIsPressed) {
    let x = mouseX - width / 2;
    let y = mouseY - height / 2;
    let px = pmouseX - width / 2;
    let py = pmouseY - height / 2;

    pg.push();
    pg.translate(width / 2, height / 2);
    // Setting rainbow stroke
    if (checkbox_multicolor.checked()){
      hu = (hu + 1) % 255;
      xoff += 0.02;
      pg.stroke(hu,255,255,100);
    }
    // Setting single color stroke
    else{
      c = strokePicker.color();
      c.setAlpha(slider_opacity.value());
      pg.stroke(c);
    }
    
    pg.strokeWeight(strokew);

    // Main drawing algorithm
    for (let i = 0; i < symmetry; i++) {
      // Square brush
      if (checkbox_shape.checked()) {
        pg.push();
        pg.rotate(i * angle);
        stroke(c);
        // Square brush paramters setting
        if (!checkbox_shape_fill.checked()){
          pg.noFill();
        }
        else {
          let f = fillPicker.color();
          f.setAlpha(fill_opacity.value());
          pg.fill(f);
        }  
        let spacing = 10; 
        let size = constrain(dist(x, y, px, py), 5, width / 6);
        pg.square(x + spacing * cos(i * angle), y + spacing * sin(i * angle), size);
        pg.scale(1, -1);
        pg.pop();
      }
      //Normal brush
      else{
        pg.push();
        pg.rotate(i * angle);
        pg.line(x, y, px, py);
        pg.scale(1, -1);
        pg.line(x, y, px, py);
        pg.pop();
      }
  }
    pg.pop();
  }
}
