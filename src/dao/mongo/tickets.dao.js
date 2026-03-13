import ticketModel from "../models/ticketModel.js";

export class TicketsDAO {
  async create(data) {
    return ticketModel.create(data);
  }
}

