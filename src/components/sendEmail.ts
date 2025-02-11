// sendEmail.ts
import nodemailer from "nodemailer";
export { sendEmail, generateSixDigitCode };

/**
 * 发送邮件的异步函数
 * @param {string} email - 收件人的邮箱地址
 * @param {string} message - 邮件的内容，通常是验证码
 */
async function sendEmail(email: string, message: string) {
    // 配置邮件服务器
    let transporter = nodemailer.createTransport({
        host: "smtp.163.com", // 网易邮箱的 SMTP 服务器地址
        port: 465, // 使用 SSL 加密的端口号
        secure: true, // 使用 SSL 加密
        auth: {
            user: 'redstone_xiaotong@163.com', // 你的网易邮箱账号
            pass: 'HHpM5333LaKgW9Jw', // 你在上一步获取的授权码
        },
    });

    // 邮件内容
    let mailOptions = {
        from: '"Redstone Circuit Communication" redstone_xiaotong@163.com', // 发件人信息
        to: email, // 收件人邮箱
        subject: 'Redstone Circuit Communication', // 邮件主题
        text: `这是你的验证码：${message}`, // 邮件正文（纯文本）
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h1 style="color: #007BFF;">Redstone Circuit Communication</h1>
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
                <h2 style="color: #333;">验证码</h2>
                <p style="font-size: 18px; color: #007BFF;">你的验证码是：<strong>${message}</strong></p>
                <p style="color: #666;">请确保在输入验证码时不要包含空格。</p>
                <p style="color: #666;">如果你没有请求验证码，请忽略此邮件。</p>
            </div>
        `
    };

    // 发送邮件
    try {
        let info = await transporter.sendMail(mailOptions);
        console.log('邮件发送成功:', info.messageId);
    } catch (error) {
        console.error('邮件发送失败:', error);
    }
}

/**
 * 生成一个六位数的随机验证码
 * @returns {string} 生成的六位数验证码
 */
function generateSixDigitCode(): string {
    const min = 100000; // 最小6位数
    const max = 999999; // 最大6位数
    return String(Math.floor(Math.random() * (max - min + 1)) + min);
}