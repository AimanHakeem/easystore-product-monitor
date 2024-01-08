import axios from "axios";
import { HttpsProxyAgent } from "https-proxy-agent";
// import Discord from './Discord';
import Seller from '../models/Seller';
import Product from './Product';
import { ProductData } from "./types";
import Log from "./Log";
import fs from "fs";
import path from "path";
import * as cheerio from "cheerio";

interface Store {
  name: string;
  url: string;
  proxy: {
    enabled: boolean;
    proxyListPath: string;
  };
}

interface Config {
  stores: Store[];
  pollingInterval: number;
}

interface Proxy {
  url: string;
  unbanTime: number;
  banCount: number;
}

class Monitor {
  sellerUrl: string;
  firstRun: boolean;
  sellerId: string;
  proxiesList: Proxy[];
  proxyCount: number;
  currentProxy: Proxy;
  store: Store;
  monitor!: NodeJS.Timeout;

  constructor(store: Store) {
    this.sellerUrl = store.url;
    this.firstRun = true;
    this.sellerId = store.name;
    this.store = store;

    this.proxiesList = [{ url: "", unbanTime: 0, banCount: 0.5 }];
    this.proxyCount = 0;
    if (store.proxy.enabled) {
      const proxyListPath = path.resolve(__dirname, store.proxy.proxyListPath);
      const proxies = fs
        .readFileSync(proxyListPath, "utf-8")
        .split("\n")
        .filter(Boolean);
      this.proxiesList = this.proxiesList.concat(
        proxies.map((x) => ({ url: x, unbanTime: 0, banCount: 0.5 }))
      );
    }
    this.currentProxy = { url: "", unbanTime: 0, banCount: 0.5 };
  }

  start = async (): Promise<void> => {
    this.monitor = setInterval(async () => {
      try {
        var config = {};

        do {
          this.currentProxy = this.proxiesList[this.proxyCount] as Proxy;

          if (
            this.currentProxy.unbanTime > 0 &&
            this.currentProxy.unbanTime < Date.now()
          ) {
            this.currentProxy.unbanTime = 0;
          }
          this.proxyCount++;

          if (this.proxyCount >= this.proxiesList.length) {
            this.proxyCount = 0;
          }
        } while (this.currentProxy && this.currentProxy.unbanTime > Date.now());

        if (this.currentProxy.url !== "" && this.store.proxy.enabled === true) {
          Log.Info(`Using proxy ${this.currentProxy.url}`);
          const agent = new HttpsProxyAgent(this.currentProxy.url);
          config = {
            method: "get",
            httpsAgent: agent,
          };
        }

        let url: string = "";
        switch (this.sellerUrl) {
            case "https://peakkl.com":
                url = "https://peakkl.com/collections/new-collection";
                break;
            case "https://byclairvoyant.com":
                url = "https://byclairvoyant.com/collections/feature-on-homepage";
                break;
            default:
                // Handle other cases
                break;
        }

        const response = await axios.get(url, config);

        this.currentProxy.banCount = 0.5;

        const $ = cheerio.load(response.data);

        let collectionData: { products: ProductData[] } = { products: [] };
        const collectionDataElement = $("#CollectionDataStorage");
        if(collectionDataElement.length > 0) {
            const collectionDataString = collectionDataElement.attr('data-collection');
            collectionData = JSON.parse(collectionDataString as string);
            return collectionData;
        } else {
            Log.Error("Entry point not found");
        }

        var products = collectionData.products;

        if (this.firstRun) {
            let newProducts: Product[] = [];
        
            products.forEach(x => {
                let product = new Product(x.id, this.sellerUrl);
                product.updateInformation(x);
        
                newProducts = [...newProducts, product];
            });
        
            await Seller.updateOne({ _id: this.sellerId }, {
                products: newProducts
            });
        
            this.firstRun = false;
        
            Log.Info(`Connection done with ${this.sellerUrl}`);
        }


      } catch (error) {
        // Handle errors
      }
    }, config.pollingInterval);
  };
}

// Read the config file
const configPath = path.resolve(__dirname, "config.json");
const config: Config = JSON.parse(fs.readFileSync(configPath, "utf-8"));

// Create a Monitor for each store
config.stores.forEach((store) => {
  const monitor = new Monitor(store);
  monitor.start();
});
