import axios from 'axios';
import cheerio from 'cheerio';
import fs from 'fs/promises';

const baseUrl = 'https://onepiece.fandom.com/wiki/Episode_';

(async () => {
  try {
    const summaries = [];

    for (let episode = 1; episode <= 1065; episode++) {
      const episodeUrl = baseUrl + episode;
      const response = await axios.get(episodeUrl);
      const $ = cheerio.load(response.data);
      
      //Extractinf title
      const title = $('aside.pi-layout-default > h2[data-source="Translation"]').text().trim();

      //Extracting images
      const imageElement = $('aside.pi-layout-default > figure.pi-image > a.image-thumbnail > img');
      const image_src = imageElement.attr('src');
      const image_srcset = imageElement.attr('srcset');

      // Extracting Japanese information
      const japaneseInfoElement = $('section.pi-group').eq(1);
      const kanjiElement = japaneseInfoElement.find('div.pi-data[data-source="Kanji"] > div.pi-data-value').text().trim();
      const romajiElement = japaneseInfoElement.find('div.pi-data[data-source="Romaji"] > div.pi-data-value').text().trim();
      const airdateElement = japaneseInfoElement.find('div.pi-data[data-source="Airdate"] > div.pi-data-value').text().trim();

      // Extracting the short summary
      const shortSummaryElement = $('h2 > span#Short_Summary').parent().next('p');
      const shortSummary = shortSummaryElement.text().trim();

      // Extracting the long summary
      const longSummaryElement = $('h2 > span#Long_Summary').parent().nextUntil('h2').filter('p');
      const longSummary = longSummaryElement.text().trim();

      // Extracting the anime notes
      let animeNotesElement = $('h2 > span#Anime_Notes').parent().next('figure').next('ul');
      if (!animeNotesElement.length) {
        animeNotesElement = $('h2 > span#Anime_Notes').parent().next('ul');
      }

      const animeNotes = [];

      // Extracting each anime note
      animeNotesElement.find('li').each((index, element) => {
        const animeNote = $(element).text().trim();
        animeNotes.push(animeNote);
      });

      summaries.push({
        episode: episode,
        title: title,
        image_src: image_src,
        image_srcset: image_srcset,
        kanji: kanjiElement,
        romaji: romajiElement,
        airdate: airdateElement,
        short_summary: shortSummary,
        long_summary: longSummary,
        anime_notes: animeNotes,
      });

      console.log(`Scraped episode ${episode}`);
    }

    const data = {
      episodes: summaries,
    };

    await fs.writeFile('all_summaries.json', JSON.stringify(data));

    console.log('All data scraped and saved successfully.');
  } catch (error) {
    console.error('An error occurred:', error);
  }
})();
