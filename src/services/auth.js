import axios from 'axios'; // 导入axios库，用于HTTP请求
import apiService from './api'; // 导入自定义的api服务模块
import { API_URL } from './api'; // 导入API的基本URL

const authService = {
  register: async (data) => {
    const response = await apiService.register(data); // 调用apiService的register方法进行注册
    return response.data; // 返回响应数据
  },
  login: async (data) => {
    try {
      const response = await apiService.login(data); // 调用apiService的login方法进行登录
      
      if (!response || !response.access) {
        throw new Error('登录响应格式不正确，缺少 access token'); // 如果响应中缺少access token，则抛出错误
      }
      
      const access = response.access; // 获取access token
      const userRes = await axios.get(`${API_URL}users/me/`, {
        headers: { Authorization: `Bearer ${access}` } // 发送GET请求获取用户信息，携带access token作为授权头
      });
      
      // 移除旧的 permission_count 检查，直接使用新的 permissions 数组
      return { ...response, userInfo: userRes.data }; // 返回包含原始响应和用户信息的对象
    } catch (e) {
      throw new Error(`认证失败: ${e.message}`); // 捕获并抛出认证失败的错误
    }
  }
};

export default authService; // 导出自定义的authService对象


// 这段代码定义了一个认证服务模块，包含用户注册和登录的功能。通过调用apiService中的方法与后端API进行交互，并处理响应数据。
// 在登录过程中，获取用户信息并返回包含用户信息的完整响应对象。错误处理机制确保在认证失败时抛出明确的错误信息，便于调试和用户反馈。 