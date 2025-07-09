<template>
  <div>
    <h2>角色表</h2>
    <div style="margin-bottom: 16px;">
      <a-button type="primary" @click="showAddModal">
        添加角色
      </a-button>
    </div>
    <a-table :columns="columns" :data-source="roles" row-key="id">
      <!-- Replace multiple named slots with single bodyCell slot -->
      <template v-slot:bodyCell="{ column, record }">
        <template v-if="column.key === 'permissions'">
          <span v-if="record.permissions && record.permissions.length">
            <a-tag v-for="perm in record.permissions" :key="perm.id" color="blue">
              {{ perm.name }}
            </a-tag>
          </span>
          <span v-else>无权限</span>
        </template>
        <template v-else-if="column.key === 'action'">
          <a-button type="link" @click="showEditModal(record)">编辑</a-button>
          <a-button type="link" @click="deleteRole(record.id)">删除</a-button>
        </template>
      </template>
    </a-table>

    <!-- 添加角色模态框 -->
    <a-modal v-model:open="addModalVisible" title="添加角色" @ok="handleAddOk" @cancel="handleAddCancel">
      <a-form :model="addFormState" layout="vertical" ref="addFormRef">
        <a-form-item label="名称" name="name" :rules="[{ required: true, message: '请输入角色名称!' }]">
          <a-input v-model:value="addFormState.name" />
        </a-form-item>
        <!-- 新增权限选择 -->
        <a-form-item label="权限" name="selectedPermissionIds" :rules="[{ required: true, message: '请选择至少一个权限!' }]">
          <a-select
            v-model:value="addFormState.selectedPermissionIds"
            mode="multiple"
            placeholder="请选择权限"
            style="width: 100%"
          >
            <a-select-option v-for="perm in allPermissions" :key="perm.id" :value="perm.id">
              {{ perm.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 编辑角色模态框 -->
    <a-modal v-model:open="editModalVisible" title="编辑角色" @ok="handleEditOk" @cancel="handleEditCancel">
      <a-form :model="editFormState" layout="vertical" ref="editFormRef">
        <a-form-item label="名称" name="name" :rules="[{ required: true, message: '请输入角色名称!' }]">
          <a-input v-model:value="editFormState.name" />
        </a-form-item>
        <!-- 新增权限选择 -->
        <!-- 编辑角色模态框中的权限选择表单项 -->
        <a-form-item label="权限" name="selectedPermissionIds" :rules="[{ required: true, message: '请选择至少一个权限!' }]">
          <a-select
            v-model:value="editFormState.selectedPermissionIds"
            mode="multiple"
            placeholder="请选择权限"
            style="width: 100%"
          >
            <a-select-option v-for="perm in allPermissions" :key="perm.id" :value="perm.id">
              {{ perm.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script>
import { ref, onMounted, reactive } from 'vue';
import apiService from '../services/api';

export default {
  name: 'RoleTable',
  setup() {
    const roles = ref([]);
    const allPermissions = ref([]); // 存储所有权限数据
    // 添加表单状态 - 新增权限选择字段
    const addFormState = reactive({
      name: '',
      selectedPermissionIds: [] // 新增权限ID数组
    });
    // 编辑表单状态 - 新增权限选择字段
    const editFormState = reactive({
      id: null,
      name: '',
      selectedPermissionIds: [] // 新增权限ID数组
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
        title: '权限',
        key: 'permissions',
        // Remove deprecated slots property
        // slots: { customRender: 'permissions' }
      },
      {
        title: '操作',
        key: 'action',
        // Remove deprecated slots property
        // slots: { customRender: 'action' }
      },
    ];

    // 获取所有权限数据
    const fetchPermissions = async () => {
      try {
        const response = await apiService.getPermissions();
        allPermissions.value = response.data;
      } catch (error) {
        console.error('Failed to fetch permissions:', error);
      }
    };

    // 获取角色数据并关联权限
    const fetchRoles = async () => {
      try {
        const response = await apiService.getRoles();
        // 修改权限字段名为permissions（根据实际API响应调整）
        const rolesWithPermissions = response.data.map(role => ({
          ...role,
          permissions: role.permissions ? allPermissions.value.filter(perm => 
            role.permissions.includes(perm.id)
          ) : []
        }));
        roles.value = rolesWithPermissions;
      } catch (error) {
        console.error('Failed to fetch roles:', error);
      }
    };

    // 显示添加模态框
    const showAddModal = () => {
      addModalVisible.value = true;
      if (addFormRef.value) {
        addFormRef.value.resetFields();
      }
    };

    // 显示编辑模态框 - 新增权限数据处理
    const showEditModal = (record) => {
      editFormState.id = record.id;
      editFormState.name = record.name;
      // 设置已选权限ID
      editFormState.selectedPermissionIds = record.permissions ? 
        record.permissions.map(perm => perm.id) : [];
      editModalVisible.value = true;
    };

    // 处理添加提交
    const handleAddOk = async () => {
      if (addFormRef.value) {
        try {
          await addFormRef.value.validate();
          // 将permission_ids改为permissions以匹配后端字段
          await apiService.createRole({
            name: addFormState.name,
            permissions: addFormState.selectedPermissionIds
          });
          fetchRoles();
          addModalVisible.value = false;
          // 重置表单
          addFormState.name = '';
          addFormState.selectedPermissionIds = [];
        } catch (error) {
          console.error('Failed to create role:', error);
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

    // 处理编辑提交
    const handleEditOk = async () => {
      if (editFormRef.value) {
        try {
          await editFormRef.value.validate();
          // 将permission_ids改为permissions以匹配后端字段
          await apiService.updateRole(editFormState.id, {
            name: editFormState.name,
            permissions: editFormState.selectedPermissionIds
          });
          fetchRoles();
          editModalVisible.value = false;
        } catch (error) {
          console.error('Failed to update role:', error);
        }
      }
    };

    // 取消编辑
    const handleEditCancel = () => {
      editModalVisible.value = false;
    };

    const deleteRole = async (id) => {
      try {
        await apiService.deleteRole(id);
        fetchRoles();
      } catch (error) {
        console.error('Failed to delete role:', error);
      }
    };

    onMounted(async () => {
      // 先获取权限数据，再获取角色数据
      await fetchPermissions();
      await fetchRoles();
    });

    return {
      roles,
      columns,
      addModalVisible,
      editModalVisible,
      addFormState,
      editFormState,
      addFormRef,
      editFormRef,
      showAddModal,
      handleAddOk,
      handleAddCancel,
      showEditModal,
      handleEditOk,
      handleEditCancel,
      deleteRole,
      allPermissions // 添加到返回值，供模板使用
    };
  },
};
</script>