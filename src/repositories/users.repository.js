import { UsersDAO } from "../dao/mongo/users.dao.js";

export class UsersRepository {
  constructor(dao = new UsersDAO()) {
    this.dao = dao;
  }

  async getById(id) {
    return this.dao.getById(id);
  }

  async getByEmail(email) {
    return this.dao.getByEmail(email);
  }

  async getByResetTokenHash(tokenHash) {
    return this.dao.getByResetTokenHash(tokenHash);
  }

  async create(data) {
    return this.dao.create(data);
  }

  async updateById(id, patch, options) {
    return this.dao.updateById(id, patch, options);
  }

  async deleteById(id) {
    return this.dao.deleteById(id);
  }

  async getAll() {
    return this.dao.getAll();
  }
}

