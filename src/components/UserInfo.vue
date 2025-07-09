<template>
  <div class="user-list-container">
    <h2>用户列表</h2>
    <a-table
      :columns="columns"
      :data-source="users"
      :loading="loading"
      row-key="id"
      pagination
    >
      <!-- 直接针对 action 列定义插槽，无需 column 判断 -->
      <template #bodyCell(action)="{ record }">
        <a-button type="primary" size="small" style="margin-right: 8px" @click="handleEdit(record)">编辑</a-button>
        <a-button danger size="small" @click="handleDelete(record)">删除</a-button>
      </template>
    </a-table>

    <!-- 编辑角色模态框 - 确保所有标签正确闭合 -->
    <a-modal
      v-model:open="isModalVisible"
      title="编辑角色"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <a-select
        v-model:value="currentUser.role"
        :options="roles"
        placeholder="选择角色"
        style="width: 100%"
        :disabled="!roles.length"
      />
    </a-modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { message, Modal } from 'ant-design-vue';
import { API_URL } from '../services/api';

const users = ref([]);
const loading = ref(false);
const isModalVisible = ref(false);
const currentUser = ref({});
const roles = ref([]);

// 表格列定义
const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id' },
  { title: '用户名', dataIndex: 'username', key: 'username' },
  { title: '邮箱', dataIndex: 'email', key: 'email' },
  { title: '手机号', dataIndex: 'phone_number', key: 'phone_number' },
  { title: '角色', dataIndex: 'role', key: 'role' },
  { title: '操作', key: 'action' }
];

// 获取用户列表数据
const fetchUsers = async () => {
  try {
    loading.value = true;
    const response = await axios.get(`${API_URL}users`);
    users.value = response.data;
  } catch (error) {
    console.error('获取用户列表失败:', error);
    message.error(`获取用户列表失败: ${error.response?.data?.message || error.message}`);
  } finally {
    loading.value = false;
  }
};

// 获取角色列表
const fetchRoles = async () => {
  try {
    const response = await axios.get(`${API_URL}roles/`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    });

    roles.value = response.data.map(role => ({
      label: role.name,
      value: role.name
    }));

    console.log('获取角色列表成功:', roles.value);
  } catch (error) {
    console.error('获取角色列表失败:', error);
    message.error('获取角色列表失败，请刷新页面重试');
  }
};

// 打开编辑模态框
const handleEdit = (record) => {
  currentUser.value = { ...record };
  isModalVisible.value = true;
};

// 关闭模态框
const handleCancel = () => {
  isModalVisible.value = false;
};

// 提交角色修改
const handleOk = async () => {
  if (!currentUser.value.id) {
    message.error('用户ID不存在，无法更新角色');
    return;
  }

  const isValidRole = roles.value.some(role => role.value === currentUser.value.role);
  if (!isValidRole) {
    message.error('所选角色无效，请从列表中选择');
    return;
  }

  try {
    await axios.put(
      `${API_URL}users/${currentUser.value.id}/`,
      { role: currentUser.value.role },
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json'
        }
      }
    );

    message.success('角色修改成功');
    isModalVisible.value = false;
    fetchUsers();
  } catch (error) {
    console.error('修改角色失败详情:', error);
    message.error(`修改角色失败: ${error.response?.data?.message || error.message}`);
  }
};

// 删除用户 - 使用回调函数重构确认逻辑
const handleDelete = (record) => {
  // 显示确认对话框
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除用户 ${record.username} 吗？此操作不可撤销。`,
    okText: '确认',
    cancelText: '取消',
    type: 'warning',
    // 只有点击确认按钮才会执行onOk回调
    async onOk() {
      try {
        await axios.delete(`${API_URL}users/${record.id}/`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json'
          }
        });
        message.success('用户删除成功');
        fetchUsers(); // 刷新用户列表
      } catch (error) {
        console.error('删除用户失败:', error);
        message.error(`删除用户失败: ${error.response?.data?.message || error.message}`);
      }
    },
    // 点击取消按钮或关闭对话框执行onCancel回调
    onCancel() {
      // 用户取消，不执行任何操作
      console.log('用户取消删除操作');
    }
  });
};

// 组件挂载时获取数据
onMounted(() => {
  fetchUsers();
  fetchRoles();
});
</script>

<style scoped>
.user-list-container {
  padding: 20px;
}
</style>