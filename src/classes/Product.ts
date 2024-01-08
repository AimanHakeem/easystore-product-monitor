import { ProductInfo } from "./types";

class Product {
  id: number;
  name: string;
  url: string;
  sellerUrl: string;
  price: number;
  available: boolean;
  title: string;
  image: string;
  variants: string[];
  lastUpdate: string;

  constructor(
    id: number,
    sellerUrl: string,
    name?: string,
    url?: string,
    price?: number,
    available?: boolean,
    title?: string,
    image?: string,
    variants?: string[],
    lastUpdate?: string
  ) {
    this.id = id;
    this.name = name || "";
    this.url = url || "";
    this.sellerUrl = sellerUrl;
    this.available = available || false;
    this.price = price || 0;
    this.title = title || "";
    this.image = image || "";
    this.variants = variants || [];
    this.lastUpdate = lastUpdate || "";
  }

  updateInformation = (productInfo: ProductInfo): void => {
    this.id = productInfo.id;
    this.name = productInfo.name;
    this.url = `https://${this.sellerUrl}/products/${productInfo.id}`; // use productInfo.id here
    this.price = productInfo.price;
    this.title = productInfo.title;
    this.image = productInfo.images?.[0]?.src || "";
    this.variants = productInfo.variants;
    this.lastUpdate = productInfo.updated_at;
  };
}

export default Product;