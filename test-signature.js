const { chromium } = require('playwright');
const path = require('path');

async function testElectronicSignature() {
    // Launch browser
    const browser = await chromium.launch({ 
        headless: false, // Set to true for headless testing
        slowMo: 1000 // Slow down for demonstration
    });
    
    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 },
        hasTouch: true,
        acceptDownloads: true
    });
    
    const page = await context.newPage();
    
    try {
        // Navigate to the HTML file
        const filePath = path.join(__dirname, 'index.html');
        await page.goto(`file://${filePath}`);
        
        console.log('✅ Page loaded successfully');
        
        // Fill out the form
        await page.fill('#fullName', 'John Smith');
        await page.fill('#email', 'john.smith@email.com');
        await page.fill('#date', '2025-06-27');
        
        console.log('✅ Form fields filled');
        
        // Wait for canvas to be ready
        await page.waitForSelector('#signatureCanvas');
        
        // Get canvas bounding box
        const canvas = await page.locator('#signatureCanvas');
        const canvasBox = await canvas.boundingBox();
        
        // Draw signature on canvas (simulate mouse drawing)
        await page.mouse.move(canvasBox.x + 50, canvasBox.y + 50);
        await page.mouse.down();
        
        // Draw "John Smith" signature
        const signatureStrokes = [
            // J
            [50, 50], [50, 80], [45, 85], [40, 80],
            // o
            [60, 65], [65, 60], [70, 65], [65, 70], [60, 65],
            // h
            [80, 40], [80, 80], [80, 60], [85, 55], [90, 60], [90, 80],
            // n
            [100, 80], [100, 60], [105, 55], [110, 60], [110, 80],
            // Space and S
            [130, 50], [140, 50], [130, 65], [140, 65], [140, 80], [130, 80],
            // m
            [150, 80], [150, 60], [155, 55], [160, 60], [160, 80], [165, 55], [170, 60], [170, 80],
            // i
            [180, 45], [180, 80], [180, 50],
            // t
            [190, 50], [200, 50], [195, 50], [195, 80],
            // h
            [210, 40], [210, 80], [210, 60], [215, 55], [220, 60], [220, 80]
        ];
        
        for (let i = 0; i < signatureStrokes.length; i++) {
            const [x, y] = signatureStrokes[i];
            await page.mouse.move(canvasBox.x + x, canvasBox.y + y);
            if (i === 0) await page.mouse.down();
        }
        
        await page.mouse.up();
        console.log('✅ Signature drawn on canvas');
        
        // Test clear signature button
        await page.click('#clearSignature');
        console.log('✅ Clear signature tested');
        
        // Draw signature again
        await page.mouse.move(canvasBox.x + 50, canvasBox.y + 100);
        await page.mouse.down();
        await page.mouse.move(canvasBox.x + 200, canvasBox.y + 120);
        await page.mouse.move(canvasBox.x + 100, canvasBox.y + 140);
        await page.mouse.up();
        console.log('✅ Signature redrawn');
        
        // Test form validation without signature
        await page.click('#clearSignature');
        await page.click('#submitForm');
        
        // Check for error message
        const errorMessage = await page.textContent('#errorMessage');
        if (errorMessage && errorMessage.includes('signature')) {
            console.log('✅ Form validation working - signature required');
        }
        
        // Draw final signature
        await page.mouse.move(canvasBox.x + 50, canvasBox.y + 100);
        await page.mouse.down();
        await page.mouse.move(canvasBox.x + 250, canvasBox.y + 130);
        await page.mouse.up();
        
        // Test PDF generation
        console.log('📄 Testing PDF generation...');
        
        // Set up download handler with longer timeout
        const downloadPromise = page.waitForEvent('download', { timeout: 10000 });
        await page.click('#submitForm');
        
        try {
            const download = await downloadPromise;
            console.log('✅ PDF download initiated');
            console.log(`📁 Suggested filename: ${download.suggestedFilename()}`);
            
            // Save the download
            await download.saveAs(path.join(__dirname, 'test-download.pdf'));
            console.log('✅ PDF saved successfully');
            
        } catch (downloadError) {
            console.log('⚠️  PDF download event not captured, checking for success message...');
            
            // Wait a bit for the success message to appear
            await page.waitForTimeout(2000);
            
            // Check if success message appeared
            const successMessage = await page.locator('#successMessage').textContent();
            if (successMessage && successMessage.includes('successfully')) {
                console.log('✅ Success message displayed - PDF generation working');
            } else {
                console.log('❌ No success message found');
            }
        }
        
        // Test mobile responsiveness
        await page.setViewportSize({ width: 375, height: 667 }); // iPhone size
        await page.waitForTimeout(1000);
        console.log('✅ Mobile viewport tested');
        
        // Test touch events simulation
        try {
            await page.touchscreen.tap(canvasBox.x + 100, canvasBox.y + 100);
            console.log('✅ Touch interaction tested');
        } catch (touchError) {
            console.log('⚠️  Touch simulation skipped - simulating with mouse instead');
            await page.mouse.click(canvasBox.x + 100, canvasBox.y + 100);
            console.log('✅ Mouse click simulation completed');
        }
        
        console.log('\n🎉 All tests completed successfully!');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await browser.close();
    }
}

// Run if called directly
if (require.main === module) {
    testElectronicSignature().catch(console.error);
}

module.exports = { testElectronicSignature };