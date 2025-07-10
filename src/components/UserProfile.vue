<template>
  <div class="user-profile">
    <a-card class="user-info-card" title="个人信息">
      <a-descriptions :column="1">
        <a-descriptions-item label="用户名">{{ user?.username || '未登录' }}</a-descriptions-item>
        <a-descriptions-item label="邮箱">{{ user?.email || '-' }}</a-descriptions-item>
        <a-descriptions-item label="手机号">{{ user?.phone_number || '-' }}</a-descriptions-item>
        <a-descriptions-item label="角色">{{ user?.role || '普通用户' }}</a-descriptions-item>
        <a-descriptions-item label="权限数量">{{ user?.permission_count || 0 }}</a-descriptions-item>
      </a-descriptions>
      <div class="action-buttons">
        <!-- 添加编辑信息按钮 -->
        <a-button type="primary" @click="showEditModal = true" style="margin-right: 16px;">编辑信息</a-button>
        <a-button type="primary" @click="showModal = true" style="margin-right: 16px;">修改密码</a-button>
        <a-button danger @click="handleLogout">退出登录</a-button>
      </div>
    </a-card>

    <!-- 编辑信息模态框 -->
    <a-modal v-model:open="showEditModal" title="编辑个人信息" @ok="handleSaveInfo" @cancel="handleEditCancel">
      <a-form :model="infoForm" :rules="infoRules" ref="infoFormRef">
        <a-form-item label="用户名" name="username">
          <a-input v-model:value="infoForm.username" />
        </a-form-item>
        <a-form-item label="邮箱" name="email">
          <a-input v-model:value="infoForm.email" />
        </a-form-item>
        <a-form-item label="手机号" name="phone_number">
          <a-input v-model:value="infoForm.phone_number" />
        </a-form-item>
      </a-form>
    </a-modal>

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
import { ref, computed, onMounted, getCurrentInstance } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

// 添加API_URL导入
import { API_URL } from '../services/api';

export default {
  setup() {
    const store = useStore();
    const router = useRouter();
    const { proxy } = getCurrentInstance();
    const showModal = ref(false);
    const showEditModal = ref(false); // 编辑模态框开关
    const passwordForm = ref({
      old_password: '',
      new_password: '',
      confirm_password: '',
    });
    // 编辑信息表单数据
    const infoForm = ref({
      username: '',
      email: '',
      phone_number: ''
    });
    // 编辑表单引用
    const infoFormRef = ref(null);

    // 从Vuex获取用户信息
    const user = computed(() => store.state.user);

    // 编辑表单验证规则
    const infoRules = ref({
      username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
      ],
      email: [
        { required: true, message: '请输入邮箱', trigger: 'blur' },
        { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
      ],
      phone_number: [
        { required: true, message: '请输入手机号', trigger: 'blur' },
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
      ]
    });

    // 打开编辑模态框并初始化数据
    const openEditModal = () => {
      showEditModal.value = true;
      // 从用户信息初始化表单
      infoForm.value = {
        username: user.value.username || '',
        email: user.value.email || '',
        phone_number: user.value.phone_number || ''
      };
    };

    // 关闭编辑模态框
    const handleEditCancel = () => {
      showEditModal.value = false;
    };

    // 保存编辑信息
    const handleSaveInfo = async () => {
      if (!infoFormRef.value) return;
      try {
        // 表单验证
        await infoFormRef.value.validate();
        const token = localStorage.getItem('access');
        const res = await fetch(`${API_URL}users/me/`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(infoForm.value)
        });
    
        if (res.ok) {
          // 先更新本地状态
          const updatedUser = await res.json();
          store.commit('setUser', updatedUser);
          // 重新获取完整用户信息以确保数据完整性
          await store.dispatch('initUser');
          proxy.$message.success('个人信息更新成功');
          showEditModal.value = false;
        } else {
          const data = await res.json();
          proxy.$message.error(`更新失败: ${data.detail || JSON.stringify(data)}`);
        }
      } catch (error) {
        console.error('更新信息失败:', error);
        proxy.$message.error('更新信息失败，请重试');
      }
    };

    const handleCancel = () => {
      showModal.value = false;
      passwordForm.value = {
        old_password: '',
        new_password: '',
        confirm_password: '',
      };
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
            confirm_new_password: passwordForm.value.confirm_password // 添加确认密码字段
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

    const handleLogout = () => {
      store.dispatch('logout');
      router.push('/login');
    };

    onMounted(() => {
      if (localStorage.getItem('access')) {
        store.dispatch('initUser');
      }
    });

    return {
      user,
      showModal,
      showEditModal,
      passwordForm,
      infoForm,
      infoFormRef,
      infoRules,
      handleChangePassword,
      handleCancel,
      handleLogout,
      openEditModal,
      handleEditCancel,
      handleSaveInfo
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