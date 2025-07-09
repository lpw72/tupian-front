<template>
  <div>
    <h2>类别列表</h2>
    <div style="margin-bottom: 16px;">
      <a-button type="primary" @click="showAddModal">
        添加类别
      </a-button>
    </div>
    <a-table :columns="columns" :data-source="categories" row-key="id">
      <!-- Replace named slot with bodyCell scoped slot -->
      <template v-slot:bodyCell="{ column, record }">
        <template v-if="column.key === 'action'">
          <a-button type="link" @click="showEditModal(record)">编辑</a-button>
          <a-button type="link" @click="deleteCategory(record.id)">删除</a-button>
        </template>
      </template>
    </a-table>

    <!-- 添加类别模态框 -->
    <a-modal v-model:open="addModalVisible" title="添加类别" @ok="handleAddOk" @cancel="handleAddCancel">
      <a-form :model="addFormState" layout="vertical" ref="addFormRef">
        <a-form-item label="名称" name="name" :rules="[{ required: true, message: '请输入类别名称!' }]">
          <a-input v-model:value="addFormState.name" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 编辑类别模态框 -->
    <a-modal v-model:open="editModalVisible" title="编辑类别" @ok="handleEditOk" @cancel="handleEditCancel">
      <a-form :model="editFormState" layout="vertical" ref="editFormRef">
        <a-form-item label="名称" name="name" :rules="[{ required: true, message: '请输入类别名称!' }]">
          <a-input v-model:value="editFormState.name" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script>
import { ref, onMounted, reactive } from 'vue';
import apiService from '../services/api';

export default {
  name: 'CategoryTable',
  setup() {
    const categories = ref([]);
    // 添加表单状态
    const addFormState = reactive({
      name: '',
    });
    // 编辑表单状态
    const editFormState = reactive({
      id: null,
      name: '',
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
        title: '操作',
        key: 'action',
        // Remove deprecated slots property
        // slots: { customRender: 'action' }
      },
    ];

    const fetchCategories = async () => {
      try {
        const response = await apiService.getCategories();
        categories.value = response.data;
      } catch (error) {
        console.error('Failed to fetch categories:', error);
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
          await apiService.createCategory(addFormState);
          fetchCategories();
          addModalVisible.value = false;
          addFormState.name = '';
        } catch (error) {
          console.error('Failed to create category:', error);
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

    // 显示编辑模态框
    const showEditModal = (record) => {
      editFormState.id = record.id;
      editFormState.name = record.name;
      editModalVisible.value = true;
    };

    // 处理编辑提交
    const handleEditOk = async () => {
      if (editFormRef.value) {
        try {
          await editFormRef.value.validate();
          await apiService.updateCategory(editFormState.id, editFormState);
          fetchCategories();
          editModalVisible.value = false;
        } catch (error) {
          console.error('Failed to update category:', error);
        }
      }
    };

    // 取消编辑
    const handleEditCancel = () => {
      editModalVisible.value = false;
    };

    const deleteCategory = async (id) => {
      try {
        await apiService.deleteCategory(id);
        fetchCategories();
      } catch (error) {
        console.error('Failed to delete category:', error);
      }
    };

    onMounted(() => {
      fetchCategories();
    });

    return {
      categories,
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
      deleteCategory,
    };
  },
};
</script>