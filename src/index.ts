import mongoose, { ConnectOptions } from 'mongoose';
import Monitor from './classes/Monitor';
import Seller from './models/SellerModel';
import Discord from './classes/Discord';
import { globalConfig } from './global';
import { StoreConfig } from './classes/types';

const uri = 'mongodb+srv://keemdev:a3215987A.@discord-monitor.oos3lbq.mongodb.net/?retryWrites=true&w=majority';

async function run() {
  try {
    await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 3500,
        useUnifiedTopology: true,
    } as ConnectOptions);

    // Use deleteMany without a callback, it returns a promise
    await Seller.deleteMany({});

    const options = { ordered: false };
    await Seller.insertMany(globalConfig.stores, options);

    const tasksQuery = await Seller.find({}) as StoreConfig[];

    for (let i = 0; i < tasksQuery.length; i++) {
        if (tasksQuery[i]) {
            setTimeout(() => {
                new Monitor(tasksQuery[i]!).start();
            }, 4000 * i);
        }
    }

    Discord.info('Monitor successfully started!');
  } catch (err) {
    console.error(err);
  } finally {
    // Close the mongoose connection when done
    mongoose.connection.close();
  }
}

run();
