const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require('path');

let idols = ["Henry Ford", "Stephen Hawking", "Nikola Tesla", "Jeff Bezos", "Warren Buffett", "Socrates", "William Shakespeare", "Dale Carnegie", "Albert Einstein"];
let quotes = [];

const maxI = 2; // number of times you want to make post.
const random = Math.floor(Math.random() * idols.length);


function wait(ms) {
    return new Promise(function(resolve,reject) {
        setTimeout(resolve,ms);
    });
}


async function makePosts(posts, i, browser){
    let tab = await browser.newPage();

    await tab.goto(posts[i]);

    await wait(2000);
    
    await tab.waitForSelector(".uY5lhA", {visible: true});
    let tf = await tab.$$(".uY5lhA");

    await tf[0].click();
    await tf[0].click();
    await tab.keyboard.down("Control");
    await tab.keyboard.press("A");
    await tab.keyboard.up("Control");
    await tab.keyboard.press("Backspace");

    await tab.keyboard.type(quotes[i]);

    await tf[1].click();
    await tf[1].click();

    await tab.keyboard.down("Control");
    await tab.keyboard.press("A");
    await tab.keyboard.up("Control");
    await tab.keyboard.press("Backspace");
    await tab.keyboard.type("~ " + idols[random]);
    await tab.keyboard.down("Control");
    await tab.keyboard.press("A");
    await tab.keyboard.up("Control");

    await tab.waitForSelector('button[aria-label="Bold"]');
    await tab.click('button[aria-label="Bold"]');

    return tab;
}

async function autoScroll(page){
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if(totalHeight >= scrollHeight){
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}

async function getLinkFromWebsite(browser){
    
    let tab = await browser.newPage();
    await tab.goto("https://www.benignbeast.com", {waitUntil: "networkidle2"});

    await wait(2000);

    await autoScroll(tab);

    await wait(1000);

    await tab.waitForSelector("h2.post-title a", {visible: true});
    let blogs = await tab.$$("h2.post-title a");

    // fetches the latest blog link from my website.
    let link = tab.evaluate(function(ele){    
        return ele.getAttribute("href");
    }, blogs[0]);

    return link;
}

async function uploadImage(tab, i){

    await tab.waitForSelector('input[type=file]');
    await wait(2000);

    const inputUploadHandle = await tab.$('input[type=file]');

    // prepare file to upload, I'm using "new post.png" file on same directory as this script
    let fileToUpload = 'new post' + i + '.png';

    // Sets the value of the file input to fileToUpload
    inputUploadHandle.uploadFile(fileToUpload);

}

async function post1(tab, s1, s2, i){

    await tab.waitForSelector(s1, {visible: true});
    await tab.click(s1);

    await tab.keyboard.type(quotes[i]);
    await tab.keyboard.press("Enter");
    await tab.keyboard.type("~ " + idols[random]);
    await tab.keyboard.press("Enter");
    await tab.keyboard.type("#benignbeast ");

    await wait(2000);

    await tab.waitForSelector(s2, {visible: true});
    await tab.click(s2);

}

async function post2(tab, s2, link){

    await tab.keyboard.type("Hey guys!");
    await tab.keyboard.press("Enter");
    await tab.keyboard.type("Check out my new blog on my website - " + link);
    await tab.keyboard.press("Enter");
    await tab.keyboard.type("#benignbeast ");

    await wait(2000);

    await tab.waitForSelector(s2, {visible: true});
    await tab.click(s2);

}

async function facebookPost(browser, link, i){
    
    let loginId = "Facebook id";
    let password = "Facebook Password";

    if(i==0){
        
        let tab = await browser.newPage();

        await tab.goto("https://www.facebook.com/login", {waitUntil: "networkidle2"});
        
        await tab.type("#email", loginId);
        await tab.type("#pass", password);

        await tab.keyboard.press("Enter");
    
        await wait(2000);

        await tab.waitForSelector('a[aria-label="Facebook"]', {visible: true});
        await tab.click('a[aria-label="Facebook"]');
    
    }

    let pages = await browser.pages();
    let tab = pages[pages.length-1];

    await uploadImage(tab, i);

    await wait(2000);

    let s1 = '[contenteditable="true"][tabindex="0"]';
    let s2 = '[aria-label="Post"]';

    await post1(tab, s1, s2, i);

    await wait(3000);

    if(i == maxI-1){

        await tab.waitForSelector("div.oajrlxb2.b3i9ofy5", {visible: true});
        await tab.click("div.oajrlxb2.b3i9ofy5");

    
        await tab.waitForSelector(s1, {visible: true});
        await tab.click(s1);

    
        await post2(tab, s2, link);
    }
}

async function twitterPost(browser, link, i){
    
    let loginId = "twitter id or username";
    let password = "twitter password";

    if(i==0){
        
        let tab = await browser.newPage();

        await tab.goto("https://twitter.com/login", {waitUntil: "networkidle2"});
        
        await tab.type('input[name="session[username_or_email]"]', loginId);
        await tab.type('input[name="session[password]"]', password);

        await tab.keyboard.press("Enter");

    }

    let pages = await browser.pages();
    let tab = pages[pages.length-1];

    await uploadImage(tab, i);

    await wait(2000);
    
    let s1 = '[data-testid="tweetTextarea_0"]';
    let s2 = '[data-testid="tweetButtonInline"]';

    await post1(tab, s1, s2, i);

    await wait(3000);

    if(i == maxI-1){

        await tab.waitForSelector("div.DraftEditor-root", {visible: true});
        await tab.click("div.DraftEditor-root");

    
        await post2(tab, s2, link);
    }

}

async function googleQuotes(browser){

    let [page] = await browser.pages();
    await page.goto("https://www.google.com");

    await page.waitForSelector(".pR49Ae.gsfi", {visible: true});
    let t = await page.$(".pR49Ae.gsfi");

    await t.type(idols[random] + " quotes");
    await page.keyboard.press("Enter");

    await page.waitForSelector(".Qynugf", {visible: true});
    let quotesClass = await page.$$(".Qynugf");

    for(let i=0 ; i<quotesClass.length ; i++){
        quotes[i] = await page.evaluate(el => el.textContent, quotesClass[i]);
    }

}

async function main(){

    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: false,
        args: ['--start-maximized', '--disable-notifications']
    });

    // googles idol quotes and saves it in the quotes array.
    await googleQuotes(browser);

    // here starts the main work on creating and downloading the post on canva website.
    let tab = await browser.newPage();

    let id = "canva id";
    let pass = "canva password";
    
    await tab.goto("https://www.canva.com/login");
    
    await wait(2000);
    
    await tab.waitForSelector("#__a11yId19", {visible: true});
    await tab.type("#__a11yId19", id);
    await tab.type("#__a11yId22", pass);
    await tab.waitForSelector('button[type="submit"]', {visible: true});
    await tab.click('button[type="submit"]');

    await wait(2000);

    await tab.waitForSelector(".whg_wg.OYvzTw", {visible: true});
    let instafolder = await tab.$$(".whg_wg.OYvzTw");
    instafolder[1].click();

    await tab.waitForSelector(".loCAyQ", {visible: true});
    let opt = await tab.$$(".loCAyQ");

    for(let i=0 ; i<maxI ;i++){

        await tab.waitForSelector(".loCAyQ", {visible: true});
        let opt = await tab.$$(".loCAyQ");
        await opt[0].click();

        await tab.waitForSelector(".Sbf1Gw", {visible: true});
        let makeACopy = await tab.$$(".Sbf1Gw");
        await makeACopy[0].click();

    }

    await wait(3000);

    await tab.waitForSelector('a[class="_8crsRw"]', {visible: true});
    let postsPack = await tab.$$('a[class="_8crsRw"]');
    
    let posts = [];
    
    for(let i=0 ; i<maxI ; i++){
        let post = await tab.evaluate(function(ele){
            return ele.getAttribute("href");
        }, postsPack[i]);
        posts.push(post);
    }

    for(let i=0 ; i<maxI ; i++){
        
        let downTab = await makePosts(posts, i, browser);

        await downTab._client.send('Page.setDownloadBehavior', {behavior: 'allow', downloadPath: __dirname});

        await downTab.waitForSelector('[aria-controls="__a11yId3"]', {visible: true});
        await downTab.click('[aria-controls="__a11yId3"]');

        await wait(2000);

        await downTab.waitForSelector('[aria-label="Design title"]', {visible: true});
        await downTab.click('[aria-label="Design title"]');

        await downTab.keyboard.press("Backspace");
        await downTab.keyboard.type("new post" + i);
        await downTab.keyboard.press("Enter");

        await downTab.waitForSelector('[aria-pressed="false"]', {visible: true});
        await downTab.click('[aria-pressed="false"]');

        await wait(2000);

        await downTab.waitForSelector('[type="submit"]', {visible: true});
        await downTab.click('[type="submit"]');
        
        await wait(8000);

    }

    let link = await getLinkFromWebsite(browser);

    for(let i=0 ; i<maxI ; i++){

        await facebookPost(browser, link, i);
        await wait(2000);

    }

    for(let i=0 ; i<maxI ; i++){

        await twitterPost(browser, link, i);
        await wait(2000);

    }

    await wait(10000);
    browser.close();
}

main();

