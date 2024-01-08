import mongoose from 'mongoose';

const SellerSchema = new mongoose.Schema({
    url: String,
    products: [{}],
});

const Seller = mongoose.model('Seller', SellerSchema);

export default Seller;