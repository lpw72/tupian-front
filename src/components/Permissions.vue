<template>
  <div>
    <h2>权限表</h2>
    <div style="margin-bottom: 16px;">
      <a-button type="primary" @click="showAddModal">
        添加权限
      </a-button>
    </div>
    <a-table :columns="columns" :data-source="permissions" row-key="id">
      <!-- Replace the old slot syntax with v-slot:bodyCell -->
      <template v-slot:bodyCell="{ column, record }">
        <template v-if="column.key === 'action'">
          <a-button type="link" @click="editPermission(record)">编辑</a-button>
          <a-button type="link" @click="deletePermission(record.id)">删除</a-button>
        </template>
      </template>
    </a-table>

    <!-- 添加权限模态框 -->
    <a-modal v-model:open="addModalVisible" title="添加权限" @ok="handleAddOk" @cancel="handleAddCancel">
      <a-form :model="addFormState" layout="vertical" ref="addFormRef">
        <a-form-item label="名称" name="name" :rules="[{ required: true, message: '请输入权限名称!' }]">
          <a-input v-model:value="addFormState.name" />
        </a-form-item>
        <a-form-item label="代码" name="code" :rules="[{ required: true, message: '请输入权限代码!' }]">
          <a-input v-model:value="addFormState.code" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 编辑权限模态框 -->
    <a-modal v-model:open="editModalVisible" title="编辑权限" @ok="handleEditOk" @cancel="handleEditCancel">
      <a-form :model="editFormState" layout="vertical" ref="editFormRef">
        <a-form-item label="名称" name="name" :rules="[{ required: true, message: '请输入权限名称!' }]">
          <a-input v-model:value="editFormState.name" />
        </a-form-item>
        <a-form-item label="代码" name="code" :rules="[{ required: true, message: '请输入权限代码!' }]">
          <a-input v-model:value="editFormState.code" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script>
import { ref, onMounted, reactive } from 'vue';
import apiService from '../services/api';

export default {
  name: 'PermissionTable',
  setup() {
    const permissions = ref([]);
    // 添加表单状态
    const addFormState = reactive({
      name: '',
      code: '',
    });
    // 编辑表单状态
    const editFormState = reactive({
      id: null,
      name: '',
      code: '',
    });
    // 模态框显示状态
    const addModalVisible = ref(false);
    const editModalVisible = ref(false);
    // 表单引用
    const addFormRef = ref(null);
    const editFormRef = ref(null);

    const columns = [
      {
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
      },
      {
        title: '名称',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '代码',
        dataIndex: 'code',
        key: 'code',
      },
      {
        title: '操作',
        key: 'action',
        // Remove the deprecated slots property
        // slots: { customRender: 'action' }
      },
    ];

    const fetchPermissions = async () => {
      try {
        const response = await apiService.getPermissions();
        permissions.value = response.data;
      } catch (error) {
        console.error('Failed to fetch permissions:', error);
      }
    };

    // 显示添加模态框
    const showAddModal = () => {
      addModalVisible.value = true;
      // 重置表单
      if (addFormRef.value) {
        addFormRef.value.resetFields();
      }
    };

    // 处理添加提交
    const handleAddOk = async () => {
      if (addFormRef.value) {
        try {
          await addFormRef.value.validate();
          await apiService.createPermission(addFormState);
          fetchPermissions();
          addModalVisible.value = false;
          addFormState.name = '';
          addFormState.code = '';
        } catch (error) {
          console.error('Failed to create permission:', error);
        }
      }
    };

    // 取消添加
    const handleAddCancel = () => {
      addModalVisible.value = false;
      if (addFormRef.value) {
        addFormRef.value.resetFields();
      }
    };

    const editPermission = (record) => {
      editFormState.id = record.id;
      editFormState.name = record.name;
      editFormState.code = record.code;
      editModalVisible.value = true;
    };

    const handleEditOk = async () => {
      if (editFormRef.value) {
        try {
          await editFormRef.value.validate();
          await apiService.updatePermission(editFormState.id, editFormState);
          fetchPermissions();
          editModalVisible.value = false;
        } catch (error) {
          console.error('Failed to update permission:', error);
        }
      }
    };

    const handleEditCancel = () => {
      editModalVisible.value = false;
    };

    const deletePermission = async (id) => {
      try {
        await apiService.deletePermission(id);
        fetchPermissions();
      } catch (error) {
        console.error('Failed to delete permission:', error);
      }
    };

    onMounted(() => {
      fetchPermissions();
    });

    return {
      permissions,
      addFormState,
      editFormState,
      addModalVisible,
      editModalVisible,
      addFormRef,
      editFormRef,
      columns,
      showAddModal,
      handleAddOk,
      handleAddCancel,
      editPermission,
      handleEditOk,
      handleEditCancel,
      deletePermission,
    };
  },
};
</script>