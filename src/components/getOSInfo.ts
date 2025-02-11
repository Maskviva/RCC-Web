// getOSInfo.ts
import os from 'os';

export {
    getOSInfo,
}

/**
 * 获取操作系统信息的异步函数
 * @returns {Promise<{ allRAM: number, usedRAM: number, usedCpu: Promise<any> | unknown }>} 返回一个Promise，包含总内存、已使用内存和CPU使用率
 */
function getOSInfo(): Promise<{ allRAM: number, usedRAM: number, usedCpu: Promise<any> | unknown }> {
    return new Promise(async (resolve, reject) => {
        try {
            // 获取操作系统信息
            const osInfo = {
                // 总内存（以MB为单位）
                allRAM: Math.round(os.totalmem() / 1024 / 1024),
                // 已使用内存（以MB为单位）
                usedRAM: Math.round(os.freemem() / 1024 / 1024),
                // CPU使用率
                usedCpu: await getCPUUsage(),
            };
            // 成功时返回操作系统信息
            resolve(osInfo);
        } catch (error) {
            // 失败时返回错误信息
            reject(error);
        }
    });
}

/**
 * 获取CPU使用率的异步函数
 * @returns {Promise<number>} 返回一个Promise，包含CPU使用率
 */
function getCPUUsage() {
    // 获取当前CPU信息
    const start = os.cpus();
    // 计算当前CPU空闲时间总和
    const startIdle = start.reduce((acc, cpu) => acc + cpu.times.idle, 0);
    // 计算当前CPU总时间总和
    const startTotal = start.reduce((acc, cpu) => acc + Object.values(cpu.times).reduce((a, b) => a + b), 0);

    return new Promise(resolve => {
        // 等待1秒来计算差异
        setTimeout(() => {
            // 获取1秒后的CPU信息
            const end = os.cpus();
            // 计算1秒后CPU空闲时间总和
            const endIdle = end.reduce((acc, cpu) => acc + cpu.times.idle, 0);
            // 计算1秒后CPU总时间总和
            const endTotal = end.reduce((acc, cpu) => acc + Object.values(cpu.times).reduce((a, b) => a + b), 0);

            // 计算CPU空闲时间差异
            const idleDifference = endIdle - startIdle;
            // 计算CPU总时间差异
            const totalDifference = endTotal - startTotal;

            // 计算CPU使用率
            const usage = (1 - idleDifference / totalDifference) * 100;
            // 返回CPU使用率
            resolve(usage);
        }, 1000);
    });
}