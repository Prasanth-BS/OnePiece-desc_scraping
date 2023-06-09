import puppeteer from "puppeteer";
import fs from "fs";
// const url = 'https://en.wikipedia.org/wiki/One_Piece_(season_20)';
async function scrapeEpisodes(url) {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
  
    await page.goto(url);
  
    await page.waitForSelector('table.wikitable tbody tr.vevent');
    let episodes = await page.evaluate(() => {
      const episodeElements = Array.from(
        document.querySelectorAll("table.wikitable tbody tr.vevent")
      );
  
      // ...
  
      return episodeElements.map((episodeElement) => {
        const episodeNumberElement = episodeElement.querySelector("th");
        const episodeTitleEngElement = episodeElement.querySelector("td.summary");
          if (!episodeTitleEngElement) {
            console.log("Episode title (English) element not found:", episodeElement.innerHTML);
          }
        const episodeTitleJapElement = episodeElement.querySelector(
          'td.summary span[lang="ja"]'
        );
        const episodeDescriptionElement =
          episodeElement.nextElementSibling.querySelector("td.description");
  
        const episodeNumber = episodeNumberElement
          ? episodeNumberElement.textContent.trim()
          : "";
        let episodeTitleEng = episodeTitleEngElement
          ? episodeTitleEngElement.textContent.trim()
          : "";
        const episodeTitleJap = episodeTitleJapElement
          ? episodeTitleJapElement.textContent.trim()
          : "";
        const episodeDescription = episodeDescriptionElement
          ? episodeDescriptionElement.textContent.trim()
          : "";
  
        // If <b> tag is not present, retrieve the first text content before <br> child
        if (!episodeTitleEng && episodeTitleJapElement) {
          const episodeTitleElement = episodeElement.querySelector("td.summary");
          const textContent = episodeTitleElement
            ? episodeTitleElement.textContent.trim()
            : "";
          episodeTitleEng = textContent.split("\n")[0].trim();
        }
  
        return {
          episodeNumber,
          episodeTitleEng,
          episodeTitleJap,
          episodeDescription,
        };
      });
  
      // ...
    });
  
    await browser.close();
  
    return episodes;
  }

  scrapeEpisodes(`https://en.wikipedia.org/wiki/One_Piece_(season_20)`).then((episodes) => {
    const jsonContent = JSON.stringify(episodes, null, 2);
    fs.writeFile("testepisodes.json", jsonContent, "utf8", (err) => {
      if (err) {
        console.error("Error appending JSON data:", err);
      } else {
        console.log("JSON data has been appended to episodes.json successfully.");
      }
    });
  });