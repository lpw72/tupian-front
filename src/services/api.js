import axios from 'axios';

const API_URL = 'http://localhost:8000/api/';

// 添加 axios 请求拦截器，自动加 token
axios.interceptors.request.use(config => {
  // 排除登录和注册请求
  if (!config.url.includes('login') && !config.url.includes('register')) {
    const token = localStorage.getItem('access');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

const apiService = {
  register: (data) => axios.post(`${API_URL}users/register/`, data),
  login: async (data) => {
    try {
      const res = await axios.post(`${API_URL}users/login/`, data);
      // 验证响应数据结构
      if (!res.data || !res.data.access) {
        throw new Error('登录响应缺少必要字段');
      }
      return res.data;
    } catch (error) {
      // 捕获并格式化错误信息
      const errorMsg = error.response?.data?.detail || 
                      error.response?.data?.message || 
                      '登录请求失败，请检查用户名密码或服务器连接';
      throw new Error(errorMsg);
    }
  },
  getUsers: () => axios.get(`${API_URL}users/`),
  getUser: (id) => axios.get(`${API_URL}users/${id}/`),
  updateUser: (id, data) => axios.put(`${API_URL}users/${id}/`, data),
  deleteUser: (id) => axios.delete(`${API_URL}users/${id}/`),
  getCategories: () => axios.get(`${API_URL}categories/`),
  createCategory: (data) => axios.post(`${API_URL}categories/`, data),
  updateCategory: (id, data) => axios.put(`${API_URL}categories/${id}/`, data),
  deleteCategory: (id) => axios.delete(`${API_URL}categories/${id}/`),
  getRoles: () => axios.get(`${API_URL}roles/`),
  createRole: (data) => axios.post(`${API_URL}roles/`, data),
  updateRole: (id, data) => axios.put(`${API_URL}roles/${id}/`, data),
  deleteRole: (id) => axios.delete(`${API_URL}roles/${id}/`),
  getPermissions: () => axios.get(`${API_URL}permissions/`),
  createPermission: (data) => axios.post(`${API_URL}permissions/`, data),
  updatePermission: (id, data) => axios.put(`${API_URL}permissions/${id}/`, data),
  deletePermission: (id) => axios.delete(`${API_URL}permissions/${id}/`),
  getFiles: () => axios.get(`${API_URL}files/`),
  uploadFile: (data) => axios.post(`${API_URL}files/`, data),
  getFile: (id) => axios.get(`${API_URL}files/${id}/`),
  updateFile: (id, data) => axios.put(`${API_URL}files/${id}/`, data),
  deleteFile: (id) => axios.delete(`${API_URL}files/${id}/`),
};

// Add this export statement at the bottom
export { API_URL };
export default apiService;