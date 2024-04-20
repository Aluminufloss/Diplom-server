const nodemailer = require("nodemailer");

class MailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendActivationMail(to, link) {
    await this.transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject: "Активация аккаунта на " + process.env.API_URL,
      text: "",
      html: `
                    <divs>
                        <h1>Для активации вашего аккаунта в ManageryApp перейдите по следующей ссылке</h1>
                        <a href="${link}">${link}</a>
                    </divs>
                `,
    });
  }

  async sendChangePasswordMail(to, link) {
    await this.transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject: "Смена пароля на " + process.env.API_URL,
      text: "",
      html: `
                    <divs>
                        <h1>Для смены пароля перейдите по следующей ссылке</h1>
                        <a href="${link}">${link}</a>
                    </divs>
                `,
    });
  }
}

module.exports = new MailService();
