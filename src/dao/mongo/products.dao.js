import productModel from "../models/productModel.js";

export class ProductsDAO {
  async paginate(filter = {}, options = {}) {
    return productModel.paginate(filter, options);
  }

  async getById(id) {
    return productModel.findById(id);
  }

  async create(data) {
    return productModel.create(data);
  }

  async updateById(id, patch) {
    return productModel.updateOne({ _id: id }, patch);
  }

  async updateStockIfEnough(id, quantity) {
    return productModel.updateOne(
      { _id: id, stock: { $gte: quantity } },
      { $inc: { stock: -quantity } }
    );
  }

  async deleteById(id) {
    return productModel.deleteOne({ _id: id });
  }
}

