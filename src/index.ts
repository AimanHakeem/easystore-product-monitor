import {MongoClient, ServerApiVersion } from 'mongodb';
import Monitor from './classes/Monitor';
import Seller from './models/SellerModel';
import Discord from './classes/Discord';
import { globalConfig } from './global';
import { StoreConfig } from './classes/types';

const uri = 'mongodb+srv://keemdev:a3215987A.@discord-monitor.oos3lbq.mongodb.net/?retryWrites=true&w=majority';

async function run() {
  try {

    const client = new MongoClient(uri, { serverApi:{
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
        }});

    await client.connect();
    
    // Use deleteMany without a callback, it returns a promise
    await Seller.deleteMany({});

    const options = { ordered: false };
    await Seller.insertMany(globalConfig.stores, options);

    const tasksQuery = await Seller.find({}) as StoreConfig[];

    for (let i = 0; i < tasksQuery.length; i++) {
      setTimeout(() => {
        if (tasksQuery[i]) {
          const { name, url, proxy } = tasksQuery[i]!;
          new Monitor({ name, url, proxy }).start();
        }
      }, 4000 * i);
    }

    Discord.info('Monitor successfully started!');
  } catch (err) {
    console.error(err);
  } 
}

run();
