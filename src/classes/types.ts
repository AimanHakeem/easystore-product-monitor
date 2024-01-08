export interface ProductData {
  id: number;
  name: string;
  price: number;
  title: string;
  images: { src: string }[];
  variants: string[];
  updated_at: string;
}

export interface ProductInfo extends ProductData {
  // takde apa dah kot nk tmbah?
}