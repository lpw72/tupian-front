<template>
  <div class="login-container">
    <!-- 背景装饰 -->
    <div class="bg-decoration"></div>
    
    <!-- 登录卡片 -->
    <div class="login-card">
      <!-- 品牌区域 -->
      <div class="brand-section">
        <img src="../assets/logo.png" alt="Logo" class="logo">
        <h1 class="system-title">媒体资源管理系统</h1>
        <p class="system-subtitle">专业的图片与视频管理平台</p>
      </div>
      
      <!-- 登录表单 -->
      <a-form :model="formState" @finish="onFinish" class="login-form">
        <a-form-item label="用户名" name="username" :rules="[{ required: true, message: '请输入用户名!' }]">
          <a-input v-model:value="formState.username" placeholder="请输入用户名">
            <template #prefix><UserOutlined class="prefix-icon" /></template>
          </a-input>
        </a-form-item>
        
        <a-form-item label="密码" name="password" :rules="[{ required: true, message: '请输入密码!' }]">
          <a-input-password v-model:value="formState.password" placeholder="请输入密码">
            <template #prefix><LockOutlined class="prefix-icon" /></template>
          </a-input-password>
        </a-form-item>
        
        <!-- 错误提示 -->
        <a-form-item v-if="loginError" class="error-message">
          <p class="error-text"><ExclamationCircleOutlined /> {{ loginError }}</p>
        </a-form-item>
        
        <a-form-item class="form-actions">
          <a-button type="primary" html-type="submit" class="login-button" :loading="loading">
            登录
          </a-button>
          <a-button type="link" class="register-link" @click="goToRegister">
            还没有账号？去注册
          </a-button>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<script>
import { reactive, ref } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { UserOutlined, LockOutlined, ExclamationCircleOutlined } from '@ant-design/icons-vue';
import authService from '../services/auth';

export default {
  components: {
    UserOutlined,
    LockOutlined,
    ExclamationCircleOutlined
  },
  setup() {
    const formState = reactive({
      username: '',
      password: '',
    });
    const store = useStore();
    const router = useRouter();
    const loading = ref(false);
    const loginError = ref('');

    const goToRegister = () => {
      router.push('/register');
    };

    const onFinish = async (values) => {
      try {
        loading.value = true;
        loginError.value = '';
        const result = await authService.login(values);

        if (!result || !result.access) {
          throw new Error('登录结果不完整');
        }
        
        localStorage.setItem('access', result.access);
        localStorage.setItem('refresh', result.refresh);
        store.commit('SET_TOKEN', result.access);
        
        if (result.userInfo) {
          store.commit('SET_USER', result.userInfo);
        }
        
        router.push('/');
      } catch (error) {
        console.error('登录失败详情:', error);
        loginError.value = error.message || '登录失败，请检查用户名和密码';
      } finally {
        loading.value = false;
      }
    };

    return {
      formState,
      onFinish,
      goToRegister,
      loading,
      loginError
    };
  },
};
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f5f7fa;
  position: relative;
  overflow: hidden;
}

/* 背景装饰效果 */
.bg-decoration {
  position: absolute;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  background: linear-gradient(135deg, #42b983 0%, #35495e 100%);
  filter: blur(100px);
  opacity: 0.2;
  z-index: 0;
}

.login-card {
  width: 420px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  padding: 32px;
  position: relative;
  z-index: 1;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.login-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
}

.brand-section {
  text-align: center;
  margin-bottom: 28px;
}

.logo {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  object-fit: contain;
}

.system-title {
  font-size: 24px;
  font-weight: 600;
  color: #1d2129;
  margin: 0 0 8px;
}

.system-subtitle {
  font-size: 14px;
  color: #86909c;
  margin: 0;
}

.login-form {
  width: 100%;
}

.prefix-icon {
  color: #86909c;
  font-size: 16px;
}

.form-actions {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.login-button {
  width: 100%;
  height: 44px;
  font-size: 16px;
}

.register-link {
  align-self: center;
  font-size: 14px;
  color: #42b983;
  padding: 0;
}

.error-message {
  margin-bottom: 0;
}

.error-text {
  color: #f5222d;
  font-size: 14px;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 响应式调整 */
@media (max-width: 576px) {
  .login-card {
    width: 90%;
    padding: 24px;
  }
}
</style>