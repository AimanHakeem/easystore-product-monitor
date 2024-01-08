import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs';

interface CollectionData {
  products: any[]; // Adjust the type according to the actual structure of your data
}

async function fetchData(url: string): Promise<CollectionData | null> {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    // Access the element with id 'CollectionDataStorage'
    const collectionDataElement = $('#CollectionDataStorage');
    if (collectionDataElement.length > 0) {
      // Extract and parse the JSON data from the 'data-collection' attribute
      const collectionDataString = collectionDataElement.attr('data-collection');
      const collectionData: CollectionData = JSON.parse(collectionDataString as string);

      return collectionData;
    } else {
      console.error('Element with id "CollectionDataStorage" not found.');
    }
  } catch (error: any) {
    console.error('Error fetching data:', error.message);
  }

  return null;
}

// Example usage for Clairvoyant
(async () => {
  const clairvoyantUrl = 'https://byclairvoyant.com/collections/feature-on-homepage';
  const clairvoyantData = await fetchData(clairvoyantUrl);
  if (clairvoyantData) {
    // Save Clairvoyant data to a JSON file
    fs.writeFileSync('clairvoyant-data.json', JSON.stringify(clairvoyantData.products, null, 2));
    console.log('Clairvoyant Data saved to clairvoyant-data.json');
  }

  // Example usage for PeakKL
  const peakKLUrl = 'https://www.peakkl.com/collections/new-collection';
  const peakKLData = await fetchData(peakKLUrl);
  if (peakKLData) {
    // Save PeakKL data to a JSON file
    fs.writeFileSync('peakkl-data.json', JSON.stringify(peakKLData.products, null, 2));
    console.log('PeakKL Data saved to peakkl-data.json');
  }
})();
