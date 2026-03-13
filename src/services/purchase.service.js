import crypto from "crypto";
import { CartsRepository } from "../repositories/carts.repository.js";
import { ProductsRepository } from "../repositories/products.repository.js";
import { TicketsRepository } from "../repositories/tickets.repository.js";

function generateCode() {
  return crypto.randomBytes(8).toString("hex");
}

export class PurchaseService {
  constructor({
    cartsRepository = new CartsRepository(),
    productsRepository = new ProductsRepository(),
    ticketsRepository = new TicketsRepository(),
  } = {}) {
    this.cartsRepository = cartsRepository;
    this.productsRepository = productsRepository;
    this.ticketsRepository = ticketsRepository;
  }

  async purchaseCart({ cid, purchaserEmail }) {
    if (!cid) throw new Error("Missing cart id");
    if (!purchaserEmail) throw new Error("Missing purchaser");

    const cart = await this.cartsRepository.getById(cid, { populateProducts: true });
    const purchased = [];
    const notPurchased = [];

    let amount = 0;
    for (const item of cart.products) {
      const productDoc = item.product;
      const pid = productDoc?._id?.toString?.() ?? item.product?.toString?.();
      const qty = item.quantity;
      const price = productDoc?.price;

      const stockUpdate = await this.productsRepository.decreaseStockIfEnough(pid, qty);
      if (stockUpdate.modifiedCount === 1) {
        purchased.push({ product: pid, quantity: qty, price });
        amount += (price ?? 0) * qty;
      } else {
        notPurchased.push({ product: pid, quantity: qty });
      }
    }

    const status = notPurchased.length > 0 ? "incomplete" : "complete";

    const ticket = await this.ticketsRepository.create({
      code: generateCode(),
      purchase_datetime: new Date(),
      amount,
      purchaser: purchaserEmail,
      products: purchased,
      status,
    });

    // Dejar en el carrito sólo lo no comprado
    await this.cartsRepository.updateAllProducts(cid, notPurchased);

    return { ticket, notPurchased };
  }
}

