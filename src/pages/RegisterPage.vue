<template>
  <div style="display: flex; justify-content: center; align-items: center; height: 100vh;">
    <a-form :model="formState" @finish="onFinish">
      <a-form-item label="用户名" name="username" :rules="[{ required: true, message: '请输入用户名!' }]">
        <a-input v-model:value="formState.username" />
      </a-form-item>
      <a-form-item label="邮箱" name="email" :rules="[{ required: true, message: '请输入邮箱!' }, { type: 'email', message: '邮箱格式不正确!' }]">
        <a-input v-model:value="formState.email" />
      </a-form-item>
      <a-form-item label="密码" name="password" :rules="[{ required: true, message: '请输入密码!' }]">
        <a-input-password v-model:value="formState.password" />
      </a-form-item>
      <a-form-item label="手机号" name="phone_number" :rules="[{ required: true, message: '请输入手机号!' }]">
        <a-input v-model:value="formState.phone_number" />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit">
          注册
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
import { reactive } from 'vue';
import authService from '../services/auth';

export default {
  setup() {
    const formState = reactive({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone_number: '',
    });

    const onFinish = async (values) => {
      // 只传递后端需要的字段
      const payload = {
        username: values.username,
        email: values.email,
        password: values.password,
        phone_number: values.phone_number,
      };
      try {
        await authService.register(payload);
        alert('注册成功！');
        window.location.href = '/login';
      } catch (error) {
        console.error('Registration failed:', error);
        alert('注册失败: ' + (error.response?.data ? JSON.stringify(error.response.data) : '请重试。'));
      }
    };

    return {
      formState,
      onFinish,
    };
  },
};
</script>