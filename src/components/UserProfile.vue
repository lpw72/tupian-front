<template>
  <div class="user-profile">
    <a-card class="user-info-card" title="个人信息">
      <a-descriptions :column="1">
        <a-descriptions-item label="用户名">{{ user?.username || '未登录' }}</a-descriptions-item>
        <a-descriptions-item label="邮箱">{{ user?.email || '-' }}</a-descriptions-item>
        <a-descriptions-item label="手机号">{{ user?.phone_number || '-' }}</a-descriptions-item>
        <a-descriptions-item label="角色">{{ user?.role || '普通用户' }}</a-descriptions-item>
        <a-descriptions-item label="权限数量">{{ user?.permissions?.length || 0 }}</a-descriptions-item>
      </a-descriptions>
      <div class="action-buttons">
        <a-button type="primary" @click="showModal = true" style="margin-right: 16px;">修改密码</a-button>
        <a-button danger @click="handleLogout">退出登录</a-button>
      </div>
    </a-card>

    <!-- 修改密码弹窗 -->
    <a-modal v-model:open="showModal" title="修改密码" @ok="handleChangePassword" @cancel="handleCancel">
      <a-form :model="passwordForm">
        <a-form-item label="原密码" name="old_password" :rules="[{ required: true, message: '请输入原密码!' }]">
          <a-input-password v-model:value="passwordForm.old_password" autocomplete="current-password" />
        </a-form-item>
        <a-form-item label="新密码" name="new_password" :rules="[{ required: true, message: '请输入新密码!' }]">
          <a-input-password v-model:value="passwordForm.new_password" autocomplete="new-password" />
        </a-form-item>
        <a-form-item label="确认新密码" name="confirm_password" :rules="[{ required: true, message: '请确认新密码!' }]">
          <a-input-password v-model:value="passwordForm.confirm_password" autocomplete="new-password" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script>
// 添加onMounted导入
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

export default {
  setup() {
    const store = useStore();
    const router = useRouter();
    const showModal = ref(false);
    const passwordForm = ref({
      old_password: '',
      new_password: '',
      confirm_password: '',
    });

    // 从Vuex获取用户信息，与HomePage保持一致
    const user = computed(() => store.state.user);

    const handleCancel = () => {
      showModal.value = false;
      passwordForm.value.old_password = '';
      passwordForm.value.new_password = '';
      passwordForm.value.confirm_password = '';
    };

    const handleChangePassword = async () => {
      if (!passwordForm.value.old_password || !passwordForm.value.new_password || !passwordForm.value.confirm_password) {
        alert('请填写所有字段');
        return;
      }
      if (passwordForm.value.new_password !== passwordForm.value.confirm_password) {
        alert('两次输入的新密码不一致');
        return;
      }
      try {
        const token = localStorage.getItem('access');
        const res = await fetch('http://localhost:8000/api/users/change-password/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            old_password: passwordForm.value.old_password,
            new_password: passwordForm.value.new_password,
          }),
        });
        if (res.ok) {
          alert('密码修改成功，请重新登录');
          showModal.value = false;
          // 可选：清除token并跳转到登录页
          localStorage.removeItem('access');
          localStorage.removeItem('refresh');
          window.location.href = '/login';
        } else {
          const data = await res.json();
          alert('修改失败: ' + (data.detail || JSON.stringify(data)));
        }
      } catch (e) {
        alert('请求失败，请重试');
      }
    };

    // 添加退出登录功能
    const handleLogout = () => {
      store.dispatch('logout');
      router.push('/login');
    };

    // 组件挂载时获取最新用户信息
    onMounted(() => {
      // 确保用户已登录才获取信息
      if (localStorage.getItem('access')) {
        store.dispatch('initUser');
      }
    });

    return {
      user,
      showModal,
      passwordForm,
      handleChangePassword,
      handleCancel,
      handleLogout
    };
  },
};
</script>

<style scoped>
.user-profile {
  padding: 24px;
}

.user-info-card {
  max-width: 600px;
}

.action-buttons {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}
</style>