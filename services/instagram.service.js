const puppeteer = require('puppeteer');
const fs = require('fs');

// Inspired from: https://github.com/adimango/insights-for-instagram-scraper/blob/master/Scrapy.js
// Not perfect, don't be mad.

class InstagramService {
  constructor(path) {
    this.path = path;
    this.host = `https://instagram.com/`;
  }

  get url() {
    return `${this.host}${this.path}`;
  }

  async start() {
    this.browser = await puppeteer.launch({
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-infobars',
        '--window-position=0,0',
        '--ignore-certifcate-errors',
        '--ignore-certifcate-errors-spki-list',
        '--user-agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3312.0 Safari/537.36"',
      ],
    });

    this.page = await this.browser.newPage();

    await this.page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US',
    });

    await this.page.goto(this.url, {
      waitUntil: `networkidle0`,
    });

    try {
      this.items = await this.load(3);
      this.close();
      return this.items.slice(0, 3);
    } catch (error) {
      console.log('Error', error);
      process.exit();
    }
  }

  async close() {
    await this.page.close();
    await this.browser.close();
  }

  async load(maxItemsSize) {
    this.maxItemsSize = maxItemsSize;
    var page = this.page;
    let previousHeight;
    var media = [];
    var index = `.`;

    while (maxItemsSize == null || media.length < maxItemsSize) {
      try {
        previousHeight = await page.evaluate(`document.body.scrollHeight`);
        await page.evaluate(`window.scrollTo(0, document.body.scrollHeight)`);
        await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`);
        await page.waitFor(1000);

        const nodes = await page.evaluate(() => {
          const images = document.querySelectorAll(`a > div > div.KL4Bh > img`);
          return [].map.call(images, img => img.src);
        });

        nodes.forEach(element => {
          if (media.length < maxItemsSize) {
            media.push(element);
          }
        });

        index = index + `.`;
      } catch (error) {
        console.error(error);
        break;
      }
    }
    return media;
  }
}

const instagramService = new InstagramService('visitstockholm');

module.exports = instagramService;
