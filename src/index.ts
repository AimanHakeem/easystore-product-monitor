import mongoose, { ConnectOptions } from 'mongoose';
import Monitor from './classes/Monitor';
import Seller from './models/SellerModel';
import Discord from './classes/Discord';
import { globalConfig } from './global';
import { StoreConfig } from './classes/types';
import Log from './classes/Log';

const uri = 'mongodb+srv://keemdev:a3215987A.@discord-monitor.oos3lbq.mongodb.net/?retryWrites=true&w=majority';

async function run() {
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3500,
    } );

    // Use deleteMany without a callback; it returns a promise
    await Seller.deleteMany({});

    const options = { ordered: false };
    await Seller.insertMany(globalConfig.stores, options);

    const tasksQuery = await Seller.find({}) as StoreConfig[];

    const monitorPromises: Promise<void>[] = [];

    for (let i = 0; i < tasksQuery.length; i++) {
      if (tasksQuery[i]) {
        monitorPromises.push(
          (async () => {
            try {
              await new Monitor(tasksQuery[i]!).start();
            } catch (error) {
              console.error(`Error starting monitor for store ${tasksQuery[i]}:`, error);
            }
          })()
        );

        // Use a slightly longer delay between starting monitors
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    Log.Info(`First run completed. ${monitorPromises.length} monitors started.`);
  } catch (err) {
    console.error('An error occurred:', err);
  } finally {
    Log.Info('Closing mongoose connection...');
  }
}

run();
