import { TicketsDAO } from "../dao/mongo/tickets.dao.js";

export class TicketsRepository {
  constructor(dao = new TicketsDAO()) {
    this.dao = dao;
  }

  async create(data) {
    return this.dao.create(data);
  }
}

