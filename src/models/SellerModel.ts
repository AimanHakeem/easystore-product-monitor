import mongoose, { Document, Schema } from 'mongoose';
import { ProductModel } from '../classes/types';

export interface SellerModel extends Document {
  url: string;
  products: ProductModel[];
}

const productSchema = new mongoose.Schema({
  id: Number,
  name: String,
  price: Number,
  handle: String,
  title: String,
  sellerUrl: String,
  images: String,
  variants: [
    {
      id: Number,
      title: String,
      price: Number,
      available: Boolean,
      inventory_quantity: Number,
    },
  ],
  available: Boolean,
});

const SellerSchema = new mongoose.Schema({
  url: String,
  products: [productSchema],
});

const Seller = mongoose.model<SellerModel>('Seller', SellerSchema);

export default Seller;
