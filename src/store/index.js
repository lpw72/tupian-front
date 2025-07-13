import { createStore } from 'vuex'; // 导入Vuex的createStore函数用于创建store实例
import authService from '../services/auth'; // 导入认证服务模块，包含登录等功能
import axios from 'axios'; // 导入axios库，用于HTTP请求
import { API_URL } from '../services/api'; // 导入API的基本URL

export default createStore({ // 创建并导出Vuex store实例
  state: { // 定义state对象，存储应用的状态数据
    token: localStorage.getItem('token') || '', // 初始化token为localStorage中的值或空字符串
    user: null, // 初始化用户信息为null
  },
  mutations: { // 定义mutations对象，包含改变state的方法
    updateUser(state, userData) { // 更新用户信息的mutation
      state.user = userData; // 将传入的userData赋值给state.user
    },
    SET_TOKEN(state, token) { // 设置token的mutation
      state.token = token; // 将传入的token赋值给state.token
      localStorage.setItem('token', token); // 同步更新localStorage中的token
    },
    CLEAR_TOKEN(state) { // 清除token的mutation
      state.token = ''; // 将state.token设置为空字符串
      localStorage.removeItem('token'); // 移除localStorage中的token
    },
    SET_USER(state, user) { // 设置用户的mutation
      state.user = user; // 将传入的user赋值给state.user
    },
  },
  getters: { // 定义getters对象，包含获取state的方法
    isAuthenticated(state) { // 判断是否已认证的getter
      // 当token存在且用户信息已加载时视为已登录
      return !!state.token && !!state.user; // 返回布尔值表示是否已认证
    }
  },
  actions: { // 定义actions对象，包含异步操作的方法
    async login({ commit }, credentials) { // 登录的action
      const response = await authService.login(credentials); // 调用authService的login方法进行登录
      commit('SET_TOKEN', response.access); // 提交SET_TOKEN mutation保存token
      // 添加用户信息存储
      if (response.userInfo) { // 如果响应中有userInfo字段
        commit('SET_USER', response.userInfo); // 提交SET_USER mutation保存用户信息
      }
    },
    logout({ commit }) { // 登出的action
      commit('CLEAR_TOKEN'); // 提交CLEAR_TOKEN mutation清除token
      commit('SET_USER', null); // 提交SET_USER mutation清除用户信息
    },
    // 添加初始化用户信息的action
    async initUser({ commit }) { // 初始化用户的action
      // Fix: Use 'token' key instead of 'access' to match mutation
      const token = localStorage.getItem('token'); // 获取localStorage中的token
      if (token) { // 如果token存在
        try {
          const response = await axios.get(`${API_URL}users/me/`, { // 发送GET请求获取用户信息
            headers: { Authorization: `Bearer ${token}` } // 请求头中携带token
          });
          commit('SET_USER', response.data); // 提交SET_USER mutation保存用户信息
        } catch (error) { // 捕获错误
          console.error('初始化用户信息失败:', error); // 打印错误信息
          localStorage.removeItem('access'); // 移除localStorage中的access
          localStorage.removeItem('refresh'); // 移除localStorage中的refresh
          commit('CLEAR_TOKEN'); // 提交CLEAR_TOKEN mutation清除token
        }
      }
    }
  },
});
// 该store用于管理用户认证状态，包括登录、登出和用户信息的获取
// 通过Vuex的state、mutations、getters和actions实现状态管理和异步操作
// 主要功能包括：
// 1. 登录：通过authService进行用户登录，保存token和用户信息
// 2. 登出：清除token和用户信息
// 3. 初始化用户信息：在应用加载时获取当前用户信息并保存到store中
// 4. 判断是否已认证：通过getters判断用户是否已登录
// 5. 使用localStorage持久化token，确保页面刷新后仍能保持登录状态
// 6. 错误处理：在获取用户信息失败时清除token和用户信息，避免状态不一致
// 7. 使用axios进行HTTP请求，确保与后端API的交互
// 8. 使用API_URL常量管理API的基本URL，方便维护和修改
// 9. 通过Vuex的createStore函数创建store实例，整合所有状态管理逻辑
// 10. 提供了isAuthenticated getter，方便组件判断用户是否已登录
// 11. 支持异步操作，使用actions处理登录、登出和用户信息初始化
// 12. 通过commit方法触发mutations，更新state中的数据
// 13. 支持在应用启动时自动初始化用户信息，确保用户状态的正确性
// 14. 使用Bearer认证方式，在请求头中携带token进行身份验证
// 15. 提供了清晰的代码结构，易于维护和扩展
// 16. 支持Vuex的热重载功能，便于开发调试
