import { ProductData } from "./types";
import Log from "./Log";

class Product {
  id: number;
  name: string;
  url: string;
  handle: string;
  sellerUrl: string;
  price: number;
  available: boolean;
  title: string;
  image: string;
  images: { src: string }[];
  variants: Array<{
    id: number;
    title: string;
    price: number;
    available: boolean;
    inventory_quantity: number;
  }>;
  lastUpdate: string;
  updated_at?: string | undefined;

  constructor(
    id: number,
    sellerUrl: string,
    name?: string,
    url?: string,
    handle?: string,
    price?: number,
    available?: boolean,
    title?: string,
    image?: string,
    lastUpdate?: string,
    variants?: Array<{
      id: number;
      title: string;
      price: number;
      available: boolean;
      inventory_quantity: number;
    }>,
    images?: { src: string }[],
    updated_at?: string | undefined,

) {
    this.id = id;
    this.name = name || "";
    this.url = url || "";
    this.handle = handle || "";
    this.sellerUrl = sellerUrl;
    this.available = available || false;
    this.price = price || 0;
    this.title = title || "";
    this.image = image || "";
    this.images = images || [];
    this.variants = variants || [];
    this.lastUpdate = lastUpdate || "";
    this.updated_at = updated_at;
}

  updateInformation = (productData: ProductData): void => {
    this.id = productData.id;
    this.name = productData.name;
    this.handle = productData.handle;
    this.url = `https://${this.sellerUrl}/products/${this.handle}`;
    this.price = productData.price;
    this.title = productData.title;
    this.image = productData.images?.[0]?.src || "";
    this.variants = (productData.variants || []).map(x => ({
      id: x.id,
      title: x.title,
      price: x.price,
      available: x.available,
      inventory_quantity: x.inventory_quantity,
    }));
    this.available = productData.available;
  };

  needToNotifyUpdate = (product: ProductData) => {
    var needToNotify =
      this.id != product.id ||
      this.sellerUrl != product.sellerUrl ||
      this.handle != product.handle ||
      this.title != product.title ||
      this.variants.length != product.variants.length ||
      this.available != product.available;

    if (needToNotify) {
      return true;
    }

    for (let i = 0; i < this.variants.length; i++) {
      var oldV = this.variants[i] as {
        id: number;
        title: string;
        price: number;
        available: boolean;
        inventory_quantity: number;
      };
      var newV = (product.variants[i] ?? {}) as {
        id: number;
        title: string;
        price: number;
        available: boolean;
        inventory_quantity: number;
      };

      if (
        oldV.id !== newV.id ||
        oldV.title !== newV.title ||
        oldV.price !== newV.price ||
        oldV.available !== newV.available ||
        oldV.inventory_quantity !== newV.inventory_quantity
      ) {
        needToNotify = true;
        Log.Info(`Mismatch in variants at index ${i}:`);
        Log.Info(`oldV: ${JSON.stringify(oldV)}`);
        Log.Info(`newV: ${JSON.stringify(newV)}`);
        break;
      }
    }
    return needToNotify;
  };
}

export default Product;
