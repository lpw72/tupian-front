// 在文件顶部添加 axios 导入
import axios from 'axios';
import apiService from './api';
import { API_URL } from './api';

const authService = {
  register: async (data) => {
    const response = await apiService.register(data);
    return response.data;
  },
  login: async (data) => {
    try {
      const response = await apiService.login(data);
      
      // 关键修复：直接访问 response.access 而非 response.data.access
      if (!response || !response.access) {
        throw new Error('登录响应格式不正确，缺少 access token');
      }
      
      const access = response.access; // 修复数据访问路径
      const userRes = await axios.get(`${API_URL}users/me/`, {
        headers: { Authorization: `Bearer ${access}` }
      });
      
      // 验证权限信息是否存在
      if (userRes.data.permission_count === undefined) {
        console.warn('用户权限信息不存在，可能是后端API未返回');
        // 确保permission_count字段存在，避免显示undefined
        userRes.data.permission_count = 0;
      }
      
      return { ...response, userInfo: userRes.data };
    } catch (e) {
      throw new Error(`认证失败: ${e.message}`);
    }
  }
};

export default authService;