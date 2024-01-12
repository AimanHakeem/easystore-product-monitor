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
  images: string;
  variants: Array<{
    id: number;
    title: string;
    price: number;
    available: boolean;
    inventory_quantity: number;
  }>;

  constructor(
    id: number,
    sellerUrl: string,
    name?: string,
    url?: string,
    handle?: string,
    price?: number,
    available?: boolean,
    title?: string,
    variants?: Array<{
      id: number;
      title: string;
      price: number;
      available: boolean;
      inventory_quantity: number;
    }>,
    images?: string,

) {
    this.id = id;
    this.name = name || "";
    this.url = url || "";
    this.handle = handle || "";
    this.sellerUrl = sellerUrl;
    this.available = available || false;
    this.price = price || 0;
    this.title = title || "";
    this.images = images || "";
    this.variants = variants || [];
}

  updateInformation = (productData: ProductData): void => {
    this.id = productData.id;
    this.name = productData.name;
    this.handle = productData.handle;
    this.url = `${this.sellerUrl}/products/${this.handle}`;
    this.price = productData.price;
    this.title = productData.title;
    const firstImage = ((productData.images as unknown as { src: string }[] || [])[0]?.src || '') as string;
    this.images = firstImage;
    
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
        Log.Info(`Product changed: ${this.name} - ${this.sellerUrl}`);
        break;
      }
    }
    return needToNotify;
  };
}

export default Product;
