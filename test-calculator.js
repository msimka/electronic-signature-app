// Test the pixel offset calculations for signature canvas

// Example canvas setup
const canvasDisplayWidth = 700;  // CSS width
const canvasDisplayHeight = 200; // CSS height
const devicePixelRatio = 2; // Typical retina display

// Calculate canvas internal dimensions
const canvasInternalWidth = canvasDisplayWidth * devicePixelRatio;
const canvasInternalHeight = canvasDisplayHeight * devicePixelRatio;

console.log('🧮 Canvas Dimension Calculator Test');
console.log('=====================================');
console.log(`Display size: ${canvasDisplayWidth} x ${canvasDisplayHeight}`);
console.log(`Device pixel ratio: ${devicePixelRatio}`);
console.log(`Internal size: ${canvasInternalWidth} x ${canvasInternalHeight}`);

// Example mouse event coordinates
const mouseX = 350; // Client X (center of canvas)
const mouseY = 100; // Client Y (center of canvas)

// Simulate bounding rectangle
const boundingRect = {
    left: 50,
    top: 150,
    width: canvasDisplayWidth,
    height: canvasDisplayHeight
};

// Calculate relative position
const relativeX = mouseX - boundingRect.left;
const relativeY = mouseY - boundingRect.top;

// Calculate scaling factors
const scaleX = canvasInternalWidth / boundingRect.width;
const scaleY = canvasInternalHeight / boundingRect.height;

// Apply scaling
const scaledX = relativeX * scaleX;
const scaledY = relativeY * scaleY;

console.log('');
console.log('🎯 Coordinate Conversion Test');
console.log('=============================');
console.log(`Mouse position: (${mouseX}, ${mouseY})`);
console.log(`Bounding rect: left=${boundingRect.left}, top=${boundingRect.top}`);
console.log(`Relative position: (${relativeX}, ${relativeY})`);
console.log(`Scale factors: x=${scaleX}, y=${scaleY}`);
console.log(`Canvas coordinates: (${scaledX}, ${scaledY})`);

// Verification - reverse calculation
const verifyX = (scaledX / scaleX) + boundingRect.left;
const verifyY = (scaledY / scaleY) + boundingRect.top;

console.log('');
console.log('✅ Verification');
console.log('===============');
console.log(`Original mouse: (${mouseX}, ${mouseY})`);
console.log(`Calculated back: (${verifyX}, ${verifyY})`);
console.log(`Match: ${Math.abs(verifyX - mouseX) < 0.01 && Math.abs(verifyY - mouseY) < 0.01}`);

module.exports = {
    canvasDisplayWidth,
    canvasDisplayHeight,
    devicePixelRatio,
    canvasInternalWidth,
    canvasInternalHeight,
    scaleX,
    scaleY,
    calculateCanvasCoordinates: function(clientX, clientY, rect) {
        const relX = clientX - rect.left;
        const relY = clientY - rect.top;
        return {
            x: relX * (this.canvasInternalWidth / rect.width),
            y: relY * (this.canvasInternalHeight / rect.height)
        };
    }
};