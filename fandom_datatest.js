import axios from 'axios';
import cheerio from 'cheerio';
import fs from 'fs/promises';

const baseUrl = 'https://onepiece.fandom.com/wiki/Episode_';

(async () => {
  try {
    const episodes = [];

    for (let episode = 1; episode <= 1; episode++) {
      const episodeUrl = baseUrl + episode;
      const response = await axios.get(episodeUrl);
      const $ = cheerio.load(response.data);

      const episodeData = {};

      // Extracting episode title
      episodeData.title = $('aside.pi-layout-default > h2[data-source="Translation"]').text().trim();

      // Extracting image source and srcset
      const imageElement = $('aside.pi-layout-default > figure.pi-image > a.image-thumbnail > img');
      episodeData.image_src = imageElement.attr('src');
      episodeData.image_srcset = imageElement.attr('srcset');

      // Extracting Japanese information
      const japaneseInfoElement = $('section.pi-group').eq(1);
      const kanjiElement = japaneseInfoElement.find('div.pi-data[data-source="Kanji"] > div.pi-data-value').text().trim();
      const romajiElement = japaneseInfoElement.find('div.pi-data[data-source="Romaji"] > div.pi-data-value').text().trim();
      const airdateElement = japaneseInfoElement.find('div.pi-data[data-source="Airdate"] > div.pi-data-value').text().trim();

      episodeData.kanji = kanjiElement;
      episodeData.romaji = romajiElement;
      episodeData.airdate = airdateElement;

      episodes.push(episodeData);

      console.log(`Scraped episode ${episode}`);
    }

    const data = {
      episodes: episodes,
    };

    await fs.writeFile('all_episode_data.json', JSON.stringify(data));

    console.log('All data scraped and saved successfully.');
  } catch (error) {
    console.error('An error occurred:', error);
  }
})();
