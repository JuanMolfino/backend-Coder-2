import { CartsDAO } from "../dao/mongo/carts.dao.js";
import { ProductsRepository } from "./products.repository.js";

export class CartsRepository {
  constructor({ cartsDAO = new CartsDAO(), productsRepository = new ProductsRepository() } = {}) {
    this.cartsDAO = cartsDAO;
    this.productsRepository = productsRepository;
  }

  async getById(cid, { populateProducts = true } = {}) {
    const cart = await this.cartsDAO.getById(cid, { populateProducts });
    if (!cart) throw new Error(`El carrito ${cid} no existe!`);
    return cart;
  }

  async create() {
    return this.cartsDAO.create({ products: [] });
  }

  async addProduct(cid, pid) {
    await this.productsRepository.getById(pid);
    const cart = await this.getById(cid, { populateProducts: false });

    let index = null;
    const existing = cart.products.filter((item, i) => {
      if (item.product.toString() === pid) index = i;
      return item.product.toString() === pid;
    });

    if (existing.length > 0) {
      cart.products[index].quantity += 1;
    } else {
      cart.products.push({ product: pid, quantity: 1 });
    }

    await this.cartsDAO.updateById(cid, { products: cart.products });
    return this.getById(cid, { populateProducts: true });
  }

  async removeProduct(cid, pid) {
    await this.productsRepository.getById(pid);
    const cart = await this.getById(cid, { populateProducts: false });
    const newProducts = cart.products.filter((item) => item.product.toString() !== pid);
    await this.cartsDAO.updateById(cid, { products: newProducts });
    return this.getById(cid, { populateProducts: true });
  }

  async updateAllProducts(cid, products) {
    for (const item of products) {
      await this.productsRepository.getById(item.product);
    }
    await this.cartsDAO.updateById(cid, { products });
    return this.getById(cid, { populateProducts: true });
  }

  async updateProductQty(cid, pid, quantity) {
    if (!quantity || isNaN(parseInt(quantity)))
      throw new Error(`La cantidad ingresada no es válida!`);

    await this.productsRepository.getById(pid);
    const cart = await this.getById(cid, { populateProducts: false });

    let index = null;
    const existing = cart.products.filter((item, i) => {
      if (item.product.toString() === pid) index = i;
      return item.product.toString() === pid;
    });

    if (existing.length === 0)
      throw new Error(`El producto ${pid} no existe en el carrito ${cid}!`);

    cart.products[index].quantity = parseInt(quantity);
    await this.cartsDAO.updateById(cid, { products: cart.products });
    return this.getById(cid, { populateProducts: true });
  }

  async clear(cid) {
    await this.cartsDAO.updateById(cid, { products: [] });
    return this.getById(cid, { populateProducts: true });
  }
}

