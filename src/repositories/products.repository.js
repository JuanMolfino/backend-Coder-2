import { ProductsDAO } from "../dao/mongo/products.dao.js";

export class ProductsRepository {
  constructor(dao = new ProductsDAO()) {
    this.dao = dao;
  }

  async paginate(params = {}) {
    const paginate = {
      page: params.page ? parseInt(params.page) : 1,
      limit: params.limit ? parseInt(params.limit) : 10,
    };

    if (params.sort && (params.sort === "asc" || params.sort === "desc")) {
      paginate.sort = { price: params.sort };
    }

    const products = await this.dao.paginate({}, paginate);

    
    products.prevLink = products.hasPrevPage
      ? `http://localhost:8080/products?page=${products.prevPage}`
      : null;
    products.nextLink = products.hasNextPage
      ? `http://localhost:8080/products?page=${products.nextPage}`
      : null;

    if (products.prevLink && paginate.limit !== 10)
      products.prevLink += `&limit=${paginate.limit}`;
    if (products.nextLink && paginate.limit !== 10)
      products.nextLink += `&limit=${paginate.limit}`;

    if (products.prevLink && paginate.sort)
      products.prevLink += `&sort=${params.sort}`;
    if (products.nextLink && paginate.sort)
      products.nextLink += `&sort=${params.sort}`;

    return products;
  }

  async getById(pid) {
    const product = await this.dao.getById(pid);
    if (!product) throw new Error(`El producto ${pid} no existe!`);
    return product;
  }

  async create(product) {
    const { title, description, code, price, stock, category, thumbnails } =
      product;
    if (!title || !description || !code || !price || !stock || !category) {
      throw new Error("Error al crear el producto");
    }

    return this.dao.create({
      title,
      description,
      code,
      price,
      stock,
      category,
      thumbnails,
    });
  }

  async update(pid, patch) {
    return this.dao.updateById(pid, patch);
  }

  async delete(pid) {
    const result = await this.dao.deleteById(pid);
    if (result.deletedCount === 0)
      throw new Error(`El producto ${pid} no existe!`);
    return result;
  }

  async decreaseStockIfEnough(pid, quantity) {
    const result = await this.dao.updateStockIfEnough(pid, quantity);
    return result;
  }
}

