<template>
  <div style="display: flex; justify-content: center; align-items: center; height: 100vh;">
    <a-form :model="formState" @finish="onFinish">
      <a-form-item label="用户名" name="username" :rules="[{ required: true, message: '请输入用户名!' }]">
        <a-input v-model:value="formState.username" />
      </a-form-item>
      <a-form-item label="密码" name="password" :rules="[{ required: true, message: '请输入密码!' }]">
        <a-input-password v-model:value="formState.password" />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit">
          登录
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
import { reactive } from 'vue';
// 添加store导入
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import authService from '../services/auth';

export default {
  setup() {
    const formState = reactive({
      username: '',
      password: '',
    });
    // 获取store实例
    const store = useStore();
    const router = useRouter();

    // 删除未使用的userInfo声明
    const onFinish = async (values) => {
      try {
        const result = await authService.login(values);
        // 验证返回结果是否有效
        if (!result || !result.access) {
          throw new Error('登录结果不完整');
        }
        
        localStorage.setItem('access', result.access);
        localStorage.setItem('refresh', result.refresh);
        
        // 添加这行来更新store中的token
        store.commit('SET_TOKEN', result.access);
        
        if (result.userInfo) {
          store.commit('SET_USER', result.userInfo);
        }
        alert('登录成功！');
        // 登录成功后跳转到首页而不是文件库
        router.push('/');
      } catch (error) {
        console.error('登录失败详情:', error);
        alert(`登录失败: ${error.message || '请检查用户名密码或服务器连接'}`);
      }
    };

    return {
      formState,
      onFinish,
    };
  },
};
</script>