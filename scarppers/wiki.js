const puppeteer = require('puppeteer');
// const options = {
//     executablePath:
//         '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
//     headless: false,
//     defaultViewport: null,
//     args: ['--window-size=1920,1080'],
//     }
exports.WikiScrapper = async (entity) => {
    console.log("wiki.js called with entity : " + entity); 
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.setDefaultNavigationTimeout(0)
    await page.goto(`https://en.wikipedia.org/wiki/${entity}`)
    // rest of code goes below
    // const heading1 = await page.$eval("#mw-content-text .mw-parser-output p", el => el.textContent);
    // console.log(heading1)
    const services = await page.evaluate(() => 
    Array.from(
            document.querySelectorAll('#mw-content-text .mw-parser-output p'),
            (element) => { 
                const el = element.textContent;
                return el
            }
        )
    );
    
    for(var i=0 ; i<services.length ; i++){
        if(!isNullOrWhiteSpace(services[i]) && services[i].length > 100) {
            console.log(i);
            var answer = services[i];
            break;
        }
    }
    await browser.close()
    return answer;
}

function isNullOrWhiteSpace(str) {
    return (!str || str.length === 0 || /^\s*$/.test(str))
}