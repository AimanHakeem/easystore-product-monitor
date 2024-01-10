import axios from "axios";
import { HttpsProxyAgent } from "https-proxy-agent";
import Discord from "./Discord";
import Seller, { SellerModel } from "../models/SellerModel";
import Product from "./Product";
import { Config, StoreConfig, ProductData } from "./types";
import Log from "./Log";
import fs from "fs";
import path from "path";
import * as cheerio from "cheerio";

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
  store: StoreConfig;
  monitor!: NodeJS.Timeout;

  constructor(store: StoreConfig) {
    this.sellerUrl = store.url;
    this.firstRun = true;
    this.sellerId = store._id;
    this.store = store;
    Log.Info(`Creating Monitor for ${this.sellerUrl}`);
    this.proxiesList = [{ url: "", unbanTime: 0, banCount: 0.5 }];
    this.proxyCount = 0;
    if (store.proxy && store.proxy.enabled) {
      Log.Info(`Proxy is enabled for ${this.sellerUrl}`);
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
    Log.Info(`Starting Monitor for ${this.sellerUrl}`);
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
            Log.Error("Site not supported");
            break;
        }

        const response = await axios.get(url, config);

        Log.Info(`Crawling site: ${this.sellerUrl}`);

        this.currentProxy.banCount = 0.5;

        const $ = cheerio.load(response.data);
        let collectionData: { products: ProductData[] } = { products: [] };

        const collectionDataElement = $("#CollectionDataStorage");
        if (collectionDataElement.length > 0) {
          const collectionDataString =
            collectionDataElement.attr("data-collection");
          collectionData = JSON.parse(collectionDataString as string);
        } else {
          Log.Error("Entry point not found");
        }

        var products = collectionData.products;

        Log.Info(`Found ${products.length} products from ${this.sellerUrl}`);
        if (this.firstRun) {
          let newProducts: Product[] = [];

          products.forEach((x) => {
            let product = new Product(x.id, this.sellerUrl);
            product.updateInformation(x);

            newProducts = [...newProducts, product];
          });

          await Seller.updateOne(
            { _id: this.sellerId },
            {
              products: newProducts,
            }
          );

          this.firstRun = false;

          Log.Info(`First cycle for, ${this.sellerUrl}`);
        } else {
          try {
            const sellerQuery = await Seller.findOne({
              _id: this.sellerId,
            }).exec();
            if (!sellerQuery || !sellerQuery.products) {
              Log.Warning(`Product not found from ${this.sellerUrl}`);
            } else {
              var oldProducts = sellerQuery.products;
              var newProducts: Product[] = [];

              for (const product of products) {
                var found = oldProducts.find((x) => x.id === product.id);
                if (found) {
                  if (found.variants === product.variants) {
                    return;
                  }
                  var oldPr = new Product(
                    found.id,
                    found.sellerUrl,
                    found.name,
                    found.url,
                    found.handle,
                    found.price,
                    found.available,
                    found.title,
                    found.image,
                    found.lastUpdate,
                    found.variants,
                    found.images
                  );

                  var newPr = new Product(product.id, this.sellerUrl);
                  newPr.updateInformation(product);

                  if (oldPr.needToNotifyUpdate(newPr)) {
                    await Seller.updateOne(
                      { _id: this.sellerId, "products.id": newPr.id },
                      { $set: { "products.$": newPr } }
                    );
                  } else {
                    await Seller.updateOne(
                      { _id: this.sellerId, "products.id": product.id },
                      { $set: { "products.$.variants": product.variants } }
                    );
                    Log.Info(
                      `Monitored ${newPr.title} from ${this.sellerUrl} `
                    );
                  }
                } else {
                  var newPr = new Product(product.id, this.sellerUrl);
                  newPr.updateInformation(product);
                  newProducts = [...newProducts, newPr];
                  Log.Success(
                    `New product found for ${this.sellerUrl}, ${newPr.title}, ${newPr.variants}`
                  );
                  Discord.notifyProduct(newPr);
                }
              }
            }
          } catch (error) {
            Log.Error(`Error in Monitor for ${this.sellerUrl}:${error}`);
          }
        }
      } catch (error) {
        Log.Error(`Error in Monitor for ${this.sellerUrl}:${error}`);
      }
    }, config.pollingInterval);
  };
}

// Config path
const configPath = path.resolve(__dirname, "..", "config.json");
const config: Config = JSON.parse(fs.readFileSync(configPath, "utf-8"));

// Create a Monitor for each store
config.stores.forEach((store) => {
  const monitor = new Monitor(store);
  monitor.start();
});

export default Monitor;
