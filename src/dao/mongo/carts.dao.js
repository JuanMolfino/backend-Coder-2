import { cartModel } from "../models/cartModel.js";

export class CartsDAO {
  async getById(id, { populateProducts = false } = {}) {
    const query = cartModel.findById(id);
    if (populateProducts) query.populate("products.product");
    return query;
  }

  async create(data) {
    return cartModel.create(data);
  }

  async updateById(id, patch) {
    return cartModel.updateOne({ _id: id }, patch);
  }
}

