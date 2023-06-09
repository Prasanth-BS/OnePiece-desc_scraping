import puppeteer from "puppeteer";
import fs from "fs";

const seasonURLs = [
  "https://en.wikipedia.org/wiki/One_Piece_(season_1)",
  "https://en.wikipedia.org/wiki/One_Piece_(season_2)",
  "https://en.wikipedia.org/wiki/One_Piece_(season_3)",
  "https://en.wikipedia.org/wiki/One_Piece_(season_3)",
  "https://en.wikipedia.org/wiki/One_Piece_(season_4)",
  'https://en.wikipedia.org/wiki/One_Piece_(season_5)',
  'https://en.wikipedia.org/wiki/One_Piece_(season_6)',
  'https://en.wikipedia.org/wiki/One_Piece_(season_7)',
  'https://en.wikipedia.org/wiki/One_Piece_(season_8)',
  'https://en.wikipedia.org/wiki/One_Piece_(season_9)',
  'https://en.wikipedia.org/wiki/One_Piece_(season_10)',
  'https://en.wikipedia.org/wiki/One_Piece_(season_11)',
  'https://en.wikipedia.org/wiki/One_Piece_(season_12)',
  'https://en.wikipedia.org/wiki/One_Piece_(season_13)',
  'https://en.wikipedia.org/wiki/One_Piece_(season_14)',
  'https://en.wikipedia.org/wiki/One_Piece_(season_15)',
  'https://en.wikipedia.org/wiki/One_Piece_(season_16)',
  'https://en.wikipedia.org/wiki/One_Piece_(season_17)',
  'https://en.wikipedia.org/wiki/One_Piece_(season_18)',
  'https://en.wikipedia.org/wiki/One_Piece_(season_19)'
  // 'https://en.wikipedia.org/wiki/One_Piece_(season_20)'
];

async function scrapeEpisodes(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(url);

  let episodes = await page.evaluate(() => {
    const episodeElements = Array.from(
      document.querySelectorAll("table.wikitable tbody tr.vevent")
    );

    // ...

    return episodeElements.map((episodeElement) => {
      const episodeNumberElement = episodeElement.querySelector("th");
      const episodeTitleEngElement = episodeElement.querySelector("td.summary b");
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

async function scrapeAllSeasons() {
  let allEpisodes = [];

  for (const seasonURL of seasonURLs) {
    console.log('At ' + seasonURL);
    allEpisodes = allEpisodes.concat(await scrapeEpisodes(seasonURL));
    // allEpisodes.push(...episodes);
  }

  return allEpisodes;
}

scrapeAllSeasons().then((episodes) => {
  const jsonContent = JSON.stringify(episodes, null, 2);
  fs.writeFile("episodes.json", jsonContent, "utf8", (err) => {
    if (err) {
      console.error("Error appending JSON data:", err);
    } else {
      console.log("JSON data has been appended to episodes.json successfully.");
    }
  });
});
