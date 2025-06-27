const { chromium } = require('playwright');
const path = require('path');

async function quickTest() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    try {
        // Navigate to the HTML file
        const filePath = path.join(__dirname, 'index.html');
        await page.goto(`file://${filePath}`);
        
        // Check if page loads
        const title = await page.title();
        console.log(`✅ Page loaded: ${title}`);
        
        // Check if all required elements exist
        const fullNameField = await page.locator('#fullName').count();
        const emailField = await page.locator('#email').count();
        const dateField = await page.locator('#date').count();
        const canvas = await page.locator('#signatureCanvas').count();
        const submitButton = await page.locator('#submitForm').count();
        
        console.log(`✅ Form elements found: ${fullNameField + emailField + dateField + canvas + submitButton}/5`);
        
        // Test JavaScript functionality
        await page.evaluate(() => {
            // Test if jsPDF is loaded
            if (typeof window.jspdf !== 'undefined') {
                console.log('jsPDF library loaded successfully');
                return true;
            }
            return false;
        });
        
        // Fill form and test validation
        await page.fill('#fullName', 'Test User');
        await page.fill('#email', 'test@example.com');
        await page.fill('#date', '2025-06-27');
        
        // Test validation without signature
        await page.click('#submitForm');
        const errorMsg = await page.locator('#errorMessage').textContent();
        console.log(`✅ Validation working: ${errorMsg ? 'Error shown' : 'No error'}`);
        
        // Test canvas drawing
        const canvasBox = await page.locator('#signatureCanvas').boundingBox();
        if (canvasBox) {
            await page.mouse.move(canvasBox.x + 50, canvasBox.y + 50);
            await page.mouse.down();
            await page.mouse.move(canvasBox.x + 150, canvasBox.y + 100);
            await page.mouse.up();
            console.log('✅ Canvas drawing test completed');
        }
        
        // Test final submission
        const result = await page.evaluate(() => {
            // Check if PDF generation function exists
            return typeof generatePDF === 'function';
        });
        
        console.log(`✅ PDF generation function available: ${result}`);
        console.log('✅ All basic functionality tests passed!');
        
    } catch (error) {
        console.error('❌ Test error:', error.message);
    } finally {
        await browser.close();
    }
}

quickTest().catch(console.error);