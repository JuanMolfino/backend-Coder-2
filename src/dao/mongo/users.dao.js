import userModel from "../models/userModel.js";

export class UsersDAO {
  async getById(id) {
    return userModel.findById(id);
  }

  async getByEmail(email) {
    return userModel.findOne({ email });
  }

  async getByResetTokenHash(tokenHash) {
    return userModel.findOne({ resetPasswordToken: tokenHash });
  }

  async create(data) {
    return userModel.create(data);
  }

  async updateById(id, patch, options = { new: true }) {
    return userModel.findByIdAndUpdate(id, patch, options);
  }

  async deleteById(id) {
    return userModel.findByIdAndDelete(id);
  }

  async getAll() {
    return userModel.find();
  }
}

