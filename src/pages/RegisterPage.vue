<template>
  <div class="register-container">
    <div class="register-card">
      <div class="brand-section">
        <div class="logo"></div>
        <h1>媒体资源管理系统</h1>
        <p>创建账户，开始您的媒体管理之旅</p>
      </div>
      <a-form
        :model="formState"
        @finish="onFinish"
        class="register-form"
        :validateMessages="validateMessages"
      >
        <a-form-item
          label="用户名"
          name="username"
          :rules="[{ required: true, message: '请输入用户名' }]"
        >
          <a-input
            v-model:value="formState.username"
            placeholder="请输入用户名"
          >
            <template #prefix><UserOutlined /></template>
          </a-input>
        </a-form-item>

        <a-form-item
          label="邮箱"
          name="email"
          :rules="[
            { required: true, message: '请输入邮箱' },
            { type: 'email', message: '请输入有效的邮箱地址' }
          ]"
        >
          <a-input
            v-model:value="formState.email"
            placeholder="请输入邮箱"
          >
            <template #prefix><MailOutlined /></template>
          </a-input>
        </a-form-item>

        <a-form-item
          label="密码"
          name="password"
          :rules="[
            { required: true, message: '请输入密码' },
            { min: 6, message: '密码长度不能少于6位' }
          ]"
        >
          <a-input-password
            v-model:value="formState.password"
            placeholder="请输入密码"
          >
            <template #prefix><LockOutlined /></template>
          </a-input-password>
        </a-form-item>

        <a-form-item
          label="确认密码"
          name="confirmPassword"
          :rules="[
            { required: true, message: '请确认密码' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('两次输入的密码不一致'));
              },
            })
          ]"
        >
          <a-input-password
            v-model:value="formState.confirmPassword"
            placeholder="请确认密码"
          >
            <template #prefix><LockOutlined /></template>
          </a-input-password>
        </a-form-item>

        <a-form-item
          label="手机号"
          name="phone_number"
          :rules="[
            { required: true, message: '请输入手机号' },
            { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' }
          ]"
        >
          <a-input
            v-model:value="formState.phone_number"
            placeholder="请输入手机号"
          >
            <template #prefix><PhoneOutlined /></template>
          </a-input>
        </a-form-item>
        <a-form-item v-if="errorMessage" class="error-message">
          <a-alert
            message="注册失败"
            description="{{ errorMessage }}"
            type="error"
            showIcon
          />
        </a-form-item>

        <a-form-item>
          <a-button
            type="primary"
            html-type="submit"
            class="register-button"
            :loading="isLoading"
            block
          >
            注册
          </a-button>
        </a-form-item>

        <div class="login-link">
          已有账号？
          <a @click="goToLogin">去登录</a>
        </div>
      </a-form>
    </div>
  </div>
</template>

<script>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { UserOutlined, MailOutlined, LockOutlined, PhoneOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import authService from '../services/auth';

// 移除错误的样式导入
// import 'ant-design-vue/es/message/style/css';

export default {
  components: {
    UserOutlined,
    MailOutlined,
    LockOutlined,
    PhoneOutlined
  },
  setup() {
    const router = useRouter();
    const formState = reactive({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone_number: ''
    });
    const isLoading = ref(false);
    const errorMessage = ref('');

    const goToLogin = () => {
      router.push('/login');
    };

    const onFinish = async (values) => {
      isLoading.value = true;
      errorMessage.value = '';

      try {
        const payload = {
          username: values.username,
          email: values.email,
          password: values.password,
          phone_number: values.phone_number
        };

        await authService.register(payload);
        message.success('注册成功！即将跳转到登录页面');
        setTimeout(() => {
          router.push('/login');
        }, 1500);
      } catch (error) {
        console.error('Registration failed:', error);
        errorMessage.value = error.response?.data?.message || '注册失败，请稍后重试';
      } finally {
        isLoading.value = false;
      }
    };

    const validateMessages = {
      required: '${label}不能为空!',
      types: {
        email: '${label}格式不正确!'
      }
    };

    return {
      formState,
      onFinish,
      isLoading,
      errorMessage,
      goToLogin,
      validateMessages,
      UserOutlined,
      MailOutlined,
      LockOutlined,
      PhoneOutlined
    };
  }
};
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  /* background: linear-gradient(135deg, #42a5f5 0%, #478ed1 50%, #0d47a1 100%); */
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.register-card {
  width: 100%;
  max-width: 450px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.brand-section {
  padding: 30px 24px;
  text-align: center;
  background: #f5f7fa;
  border-bottom: 1px solid #e8e8e8;
}

.logo {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  background: url('../assets/logo.png') no-repeat center center;
  background-size: contain;
}

.brand-section h1 {
  margin: 0 0 8px;
  color: #1890ff;
  font-size: 24px;
}

.brand-section p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.register-form {
  padding: 24px;
}

.error-message {
  margin-bottom: 16px;
}

.register-button {
  height: 48px;
  font-size: 16px;
}

.login-link {
  text-align: center;
  margin-top: 16px;
  color: #666;
  font-size: 14px;
}

.login-link a {
  color: #1890ff;
  margin-left: 4px;
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}
</style>
