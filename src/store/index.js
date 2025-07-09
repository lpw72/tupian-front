import { createStore } from 'vuex';
import authService from '../services/auth';
import axios from 'axios';
import { API_URL } from '../services/api';

export default createStore({
  state: {
    token: localStorage.getItem('token') || '',
    user: null,
  },
  mutations: {
    SET_TOKEN(state, token) {
      state.token = token;
      localStorage.setItem('token', token);
    },
    CLEAR_TOKEN(state) {
      state.token = '';
      localStorage.removeItem('token');
    },
    SET_USER(state, user) {
      state.user = user;
    },
  },
  getters: {
    isAuthenticated(state) {
      // 当token存在且用户信息已加载时视为已登录
      return !!state.token && !!state.user;
    }
  },
  actions: {
    async login({ commit }, credentials) {
      const response = await authService.login(credentials);
      commit('SET_TOKEN', response.access);
      // 添加用户信息存储
      if (response.userInfo) {
        commit('SET_USER', response.userInfo);
      }
    },
    logout({ commit }) {
      commit('CLEAR_TOKEN');
      commit('SET_USER', null);
    },
    // 添加初始化用户信息的action
    async initUser({ commit }) {
      // Fix: Use 'token' key instead of 'access' to match mutation
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get(`${API_URL}users/me/`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          commit('SET_USER', response.data);
        } catch (error) {
          console.error('初始化用户信息失败:', error);
          localStorage.removeItem('access');
          localStorage.removeItem('refresh');
          commit('CLEAR_TOKEN');
        }
      }
    }
  },
});