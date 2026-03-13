import crypto from "crypto";
import bcrypt from "bcrypt";
import { UsersRepository } from "../repositories/users.repository.js";
import { buildTransporter } from "../config/mail.config.js";
import { env } from "../config/env.js";

function sha256(input) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export class PasswordResetService {
  constructor({ usersRepository = new UsersRepository(), transporter = buildTransporter() } = {}) {
    this.usersRepository = usersRepository;
    this.transporter = transporter;
  }

  async requestReset(email) {
    const user = await this.usersRepository.getByEmail(email);
    // Respuesta neutra para no filtrar si existe o no
    if (!user) return;

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = sha256(rawToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1h

    await this.usersRepository.updateById(user._id, {
      resetPasswordToken: tokenHash,
      resetPasswordExpiresAt: expiresAt,
    });

    if (!this.transporter) return;

    const resetLink = `${env.appBaseUrl}/api/sessions/reset-password?token=${rawToken}`;
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.5">
        <h2>Restablecer contraseña</h2>
        <p>Hacé click en el botón para restablecer tu contraseña. Este enlace expira en 1 hora.</p>
        <p>
          <a href="${resetLink}" style="display:inline-block;padding:10px 14px;background:#111827;color:#fff;text-decoration:none;border-radius:6px">
            Restablecer contraseña
          </a>
        </p>
        <p>Si no solicitaste esto, podés ignorar este correo.</p>
      </div>
    `;

    await this.transporter.sendMail({
      from: env.mail.from,
      to: user.email,
      subject: "Recuperación de contraseña",
      html,
    });
  }

  async resetPassword(rawToken, newPassword) {
    if (!rawToken || !newPassword) throw new Error("Missing fields");

    const tokenHash = sha256(rawToken);
    const user = await this.usersRepository.getByResetTokenHash(tokenHash);
    if (!user) throw new Error("Invalid or expired token");
    if (!user.resetPasswordExpiresAt || user.resetPasswordExpiresAt.getTime() < Date.now()) {
      throw new Error("Invalid or expired token");
    }

    const isSameAsCurrent = bcrypt.compareSync(newPassword, user.password);
    if (isSameAsCurrent) throw new Error("New password must be different");

    if (Array.isArray(user.passwordHistory) && user.passwordHistory.length > 0) {
      const isSameAsHistory = user.passwordHistory.some((hash) => bcrypt.compareSync(newPassword, hash));
      if (isSameAsHistory) throw new Error("New password must be different");
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    const nextHistory = Array.isArray(user.passwordHistory) ? [...user.passwordHistory] : [];
    nextHistory.push(user.password);

    await this.usersRepository.updateById(user._id, {
      password: hashedPassword,
      passwordHistory: nextHistory.slice(-5),
      resetPasswordToken: null,
      resetPasswordExpiresAt: null,
    });
  }
}

