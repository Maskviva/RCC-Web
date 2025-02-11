// main.ts
import express, { Request, Response } from "express";
import path from "path";
import bodyParser from "body-parser";
import rateLimit from "express-rate-limit";
import { spawn } from "child_process";
import cookieParser from 'cookie-parser';
import cors from 'cors'; // 导入 cors 模块
import bcrypt from 'bcryptjs';

import {
    readUsersFile,
    addUserFile,
    isEmailRegistered,
    updateUserFile,
} from "./src/components/userFile";
import { sendEmail, generateSixDigitCode } from "./src/components/sendEmail";
import { getOSInfo } from "./src/components/getOSInfo";

const PORT = 3000; // 设置端口号
const app = express();

// 速率限制
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 分钟
    max: 180, // 每分钟最多 180 次请求
    message: "别整天攻击这攻击那的 有意思吗？你浮木没教好你还是你没有?"
});

app.use(limiter); // 应用速率限制
app.use(express.static(path.join(__dirname, "public"))); // 设置静态文件目录
app.use(express.urlencoded({ limit: '1mb', extended: true })); // 解析请求体
app.use(express.json({ limit: '1mb' })); // 解析请求体
app.use(cookieParser()); // 解析 cookies
app.use(cors({
    origin: 'http://127.0.0.1:3000', // 允许的源
    credentials: true // 允许携带 cookies
})); // 允许跨域请求

// // 生成会话 ID
const getSessionId = () => Math.random().toString(36).substring(2, 11);

// 验证码发送接口
const emailVerification = new Map<string, string>();

/**
 *  清除过期验证码
 *  5分钟后清除验证码
 * @param email 邮箱
 */
function clearEmailVerification(email: string) {
    setTimeout(() => {
        emailVerification.delete(email);
    }, 5 * 60 * 1000);
}

// 获取系统信息接口
app.post("/info", async (req: Request, res: Response) => {
    try {
        const { allRAM, usedRAM, usedCpu } = await getOSInfo();
        res.json({
            allRAM,
            usedRAM,
            usedCpu,
            serverTime: new Date().toISOString()
        });
    } catch (error) {
        res.json({ success: false, message: "获取系统信息失败" });
    }
});

// 同步系统时间接口
app.post("/syncTime", (req: Request, res: Response) => {
    const pythonProcess = spawn("python", [path.join(__dirname, "../time.py")]);
    let output = "";
    let error = "";

    pythonProcess.stdout.on("data", (data) => {
        output += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
        error += data.toString();
    });

    pythonProcess.on("close", (code) => {
        if (code === 0) {
            res.json({ success: true, message: output });
        } else {
            res.json({ success: false, message: error });
        }
    });
});

app.post("/send", (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) {
        res.json({ success: false, message: "请提供邮箱地址" });
        return;
    }

    const code = generateSixDigitCode();
    emailVerification.delete(email);
    emailVerification.set(email, code);
    sendEmail(email, code);
    clearEmailVerification(email);

    res.json({ success: true, message: "验证码已发送" });
});

// 登录接口
app.post("/login", (req: Request, res: Response) => {
    const { username, password } = req.body;
    const users = readUsersFile();

    if (!users || !users[username]) {
        res.json({ success: false, message: "用户名" });
        return;
    }

    if (!bcrypt.compareSync(password, users[username].password)) {
        res.json({ success: false, message: "密码错误" });
        return;
    }

    const sessionId = getSessionId();
    updateUserFile(username, users[username].email, users[username].password, bcrypt.hashSync(sessionId, 10));

    res.cookie(`${username}`, sessionId, {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30天有效期
        path: '/',                         // 整个域名下有效
        httpOnly: true,                    // 禁止 JavaScript 访问
        sameSite: 'lax'                    // 跨站请求时的行为
    });

    res.json({ success: true, message: "登录成功" });
});

// 注册接口
app.post("/register", (req: Request, res: Response) => {
    const { username, email, captcha, password } = req.body;

    // 验证验证码
    if (emailVerification.get(email) !== captcha) {
        res.json({ success: false, message: "验证码错误" });
        return;
    }

    if (isEmailRegistered(email)) {
        res.json({ success: false, message: "该邮箱已被注册" });
        return;
    }

    if (readUsersFile()?.[username]) {
        res.json({ success: false, message: "该用户名已被注册" });
        return;
    }

    addUserFile(email, username, bcrypt.hashSync(password, 10));
    res.json({ success: true, message: "注册成功" });
});

// 获取用户信息接口
app.post("/userInfo", (req: Request, res: Response) => {
    const users = readUsersFile() || {};
    const cookieInfo = req.cookies;

    for (const key in cookieInfo) {
        if (users[key] && bcrypt.compareSync(cookieInfo[key], users[key].cookie)) {
            res.json({ success: true, data: { [key]: { email: users[key].email, data: users[key].data } } });
            return; // 发送响应后立即返回，避免继续循环
        }
    }

    res.json({ success: false, message: "无效的会话" });
});

// 登出接口
app.post("/logout", (req: Request, res: Response) => {
    Object.keys(req.cookies).forEach((key: string) => {
        res.clearCookie(key);
        res.json({ success: true, message: "登出成功" });
    });
});

app.get('/', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.get('/login', (req: Request, res: Response) => {
    const users = readUsersFile() || {};
    const cookieInfo = req.cookies;

    for (const key in cookieInfo) {
        if (users[key] && bcrypt.compareSync(cookieInfo[key], users[key].cookie)) {
            return; // 发送响应后立即返回，避免继续循环
        }
    }
    res.sendFile(path.join(__dirname, 'public/child/login.html'));
});

app.get('/register', (req: Request, res: Response) => {
    const users = readUsersFile() || {};
    const cookieInfo = req.cookies;

    for (const key in cookieInfo) {
        if (users[key] && bcrypt.compareSync(cookieInfo[key], users[key].cookie)) {
            return; // 发送响应后立即返回，避免继续循环
        }
    }
    res.sendFile(path.join(__dirname, 'public/child/register.html'));
})

app.get('/forget', (req: Request, res: Response) => {
    const users = readUsersFile() || {};
    const cookieInfo = req.cookies;

    for (const key in cookieInfo) {
        if (users[key] && bcrypt.compareSync(cookieInfo[key], users[key].cookie)) {
            return; // 发送响应后立即返回，避免继续循环
        }
    }
    res.sendFile(path.join(__dirname, 'public/child/forget.html'));
});

app.get('/mine', (req: Request, res: Response) => {
    const users = readUsersFile() || {};
    const cookieInfo = req.cookies;

    for (const key in cookieInfo) {
        if (users[key] && bcrypt.compareSync(cookieInfo[key], users[key].cookie)) {
            res.sendFile(path.join(__dirname, 'public/child/mine.html'));
            return; // 发送响应后立即返回，避免继续循环
        }
    }
});

app.get('/currentstatus', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'public/child/currentstatus.html'));
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`服务器已启动，正在运行于 http://127.0.0.1:${PORT}`);
});