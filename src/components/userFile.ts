// useFile.ts
import fs from 'fs';
import path from 'path';

export {
    readUsersFile,
    writeUsersFile,
    addUserFile,
    isEmailRegistered,
    updateUserFile
};

const filePath = path.join(__dirname, '../Data', 'userData.json');

/**
 * 读取用户文件并返回解析后的 JSON 对象。
 * 
 * @returns { { [key: string]: { email: string; password: string; cookie: string; data: any[] } } | {} } - 解析后的 JSON 对象，如果文件不存在或为空，则返回一个空对象。
 */
function readUsersFile(): { [key: string]: { email: string; password: string; cookie: string; data: any[] } } {
    try {
        // 如果文件不存在或为空，返回一个空对象
        if (!fs.existsSync(filePath) || fs.readFileSync(filePath, 'utf8').trim() === '') {
            return {};
        }

        // 读取并解析 JSON 文件
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('读取用户文件时出错:', error);
        return {};
    }
}

/**
 * 将用户数据写入文件。
 * 
 * @param { { [key: string]: { email: string; password: string; cookie: string; data: any[] } } } data - 要写入的用户数据对象。
 * @returns {void} - 此函数不返回任何值。
 */
function writeUsersFile(data: { [key: string]: { email: string; password: string; cookie: string; data: any[] } }): void {
    try {
        // 将用户数据写入文件
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('写入用户文件时出错:', error);
    }
}

/**
 * 添加新用户到用户文件。
 * 
 * @param {string} email - 用户的电子邮件地址。
 * @param {string} username - 用户的用户名。
 * @param {string} password - 用户的密码。
 * @param {string} [cookie=''] - 用户的会话 Cookie（可选，默认为空字符串）。
 * @returns {{ code: number; message: string }} - 操作结果的状态码和消息。
 */
function addUserFile(email: string, username: string, password: string, cookie: string = ''): { code: number; message: string } {
    const users = readUsersFile();

    // 检查用户名是否已存在
    if (users[username]) {
        return { code: 400, message: '用户名已存在' };
    }

    // 添加新用户
    users[username] = { email, password, cookie, data: [] };
    writeUsersFile(users);

    return { code: 200, message: '注册成功' };
}

/**
 * 检查给定的电子邮件是否已注册。
 * 
 * @param {string} email - 要检查的电子邮件地址。
 * @returns {boolean} - 如果电子邮件已注册，则返回 true，否则返回 false。
 */
function isEmailRegistered(email: string): boolean {
    const users = readUsersFile();
    return Object.values(users).some(user => user.email === email);
}

/**
 * 更新用户文件中的用户信息。
 * 
 * @param {string} username - 用户名。
 * @param {string} email - 用户的电子邮件地址。
 * @param {string} password - 用户的密码。
 * @param {string} cookie - 用户的会话 Cookie。
 * @returns {{ code: number; message: string }} - 操作结果的状态码和消息。
 */
function updateUserFile(username: string, email: string, password: string, cookie: string): { code: number; message: string } {
    const users = readUsersFile();

    // 检查用户是否存在
    if (!users[username]) {
        return { code: 404, message: '用户未找到' };
    }

    // 更新用户信息
    users[username] = { email, password, cookie, data: users[username].data };
    writeUsersFile(users);

    return { code: 200, message: '用户信息更新成功' };
}