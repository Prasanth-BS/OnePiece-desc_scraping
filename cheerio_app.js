import axios from "axios";
import cheerio from "cheerio";
import fs from "fs";

async function scrapeSeason(url) {
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    const episodes = [];

    $("table.wikitable tbody tr.vevent").each((index, element) => {
      const $episodeElement = $(element);
      const episodeNumber = $episodeElement.find("th").text().trim();
      const episodeTitleEng = $episodeElement.find("td.summary").text().trim();
      const episodeTitleJap = $episodeElement.find('td.summary span[lang="ja"]').text().trim();
      const episodeDescription = $episodeElement.next().find("td.description").text().trim();

      episodes.push({
        episodeNumber,
        episodeTitleEng,
        episodeTitleJap,
        episodeDescription,
      });
    });

    return episodes;
  } catch (error) {
    console.error("Error scraping data:", error);
    return [];
  }
}

async function scrapeAllSeasons() {
  const baseSeasonUrl = "https://en.wikipedia.org/wiki/One_Piece_(season_";
  const seasons = [];

  for (let i = 1; i <= 20; i++) {
    const seasonUrl = baseSeasonUrl + i + ")";
    const episodes = await scrapeSeason(seasonUrl);

    seasons.push(...episodes);
  }

  return seasons;
}

(async () => {
  const rawData = await scrapeAllSeasons();
  
  const processedData = rawData.map(data => {
    const titleSplits = data.episodeTitleEng.split("\"");
    if(titleSplits.length === 5) {
      data.episodeTitleEng = titleSplits[1];
      }
      else {
        data.episodeTitleEng = titleSplits[3];
      }
      return data;
      
    });
    
  
  const processedJson = JSON.stringify(rawData, null, 2);

  fs.writeFile("./OnePiece_data/cheerio_raw.json", processedJson, "utf8", (err) => {
    if (err) {
      console.error("Error writing JSON data:", err);
    } else {
      console.log("JSON data has been written to one_piece_seasons.json successfully.");
    }
  });
}) ();
