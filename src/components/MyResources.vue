<template>
  <div class="my-resources-container">
    <!-- 未登录状态 -->
    <div v-if="!user" class="login-prompt">
      <h2>请先登录以查看您的资源</h2>
      <a-button type="primary" @click="goToLogin">前往登录</a-button>
    </div>

    <!-- 已登录但无资源状态 -->
    <div v-else-if="resources.length === 0" class="empty-prompt">
      <div class="empty-icon"><UploadOutlined /></div>
      <h3>您还没有上传任何资源</h3>
      <p>上传您的第一个文件，开始管理您的资源库</p>
      <a-button type="primary" @click="showAddModal">去上传文件</a-button>
    </div>

    <!-- 已登录且有资源状态 -->
    <div v-else>
      <!-- 新增按钮和搜索框 -->
      <div style="display: flex; margin-bottom: 16px; gap: 8px;">
        <a-button type="primary" @click="showAddModal">
          新增文件
        </a-button>
        <a-input
          v-model:value="searchKeyword"
          placeholder="请输入关键字搜索"
          style="width: 300px;"
          @press-enter="handleSearch"
        />
        <a-button @click="handleSearch">搜索</a-button>
      </div>

      <!-- 文件列表表格 -->
      <a-table :columns="columns" :data-source="resources" row-key="id">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <span>
              <a-button type="link" @click="viewResource(record)">查看</a-button>
              <a-button type="link" @click="editResource(record)">编辑</a-button>
              <a-button type="link" @click="deleteResource(record.id)">删除</a-button>
            </span>
          </template>
          <template v-else-if="column.key === 'url'">
            <a :href="record.url" target="_blank">{{ record.url }}</a>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 新增/编辑模态框 -->
    <a-modal
      v-model:open="modalVisible"
      :title="modalTitle"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
    >
      <a-form :model="formData" :rules="formRules" ref="formRef">
        <a-form-item name="description" label="文件描述">
          <a-input v-model:value="formData.description" />
        </a-form-item>
        <a-form-item name="category" label="文件分类">
          <a-select v-model:value="formData.category" placeholder="请选择分类">
            <a-select-option v-for="item in categories" :key="item.value" :value="item.value">
              {{ item.label }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item name="file" label="文件上传" v-if="isAddModal">
          <a-upload
            name="file"
            :show-upload-list="false"
            :before-upload="beforeUpload"
            @change="handleFileChange"
          >
            <a-button> <UploadOutlined /> 选择文件 </a-button>
          </a-upload>
          <p v-if="selectedFile">{{ selectedFile.name }}</p>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 图片预览模态框 -->
    <a-modal v-model:open="previewVisible" title="图片预览" footer=null>
      <img alt="example" style="width: 100%" :src="previewUrl" />
    </a-modal>
  </div>
</template>

<script>
import { ref, watch } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { UploadOutlined } from '@ant-design/icons-vue';
import { getToken } from '../utils/auth';
import { ElMessage } from 'element-plus';


export default {
  components: {
    UploadOutlined
  },
  setup() {
    const store = useStore();
    const router = useRouter();
    const resources = ref([]);
    const user = ref(store.state.user);
    const searchKeyword = ref('');
    const categories = ref([]);
    const selectedFile = ref(null);
    const modalVisible = ref(false);
    const modalTitle = ref('新增文件');
    const formData = ref({ description: '', category: '' });
    const formRef = ref(null);
    const isAddModal = ref(true);
    const previewVisible = ref(false);
    const previewUrl = ref('');

    // 添加表单验证规则
    const formRules = ref({
      description: [
        { required: true, message: '请输入文件描述', trigger: 'blur' }
      ],
      category: [
        { required: true, message: '请选择文件分类', trigger: 'change' }
      ]
    });

    const columns = [
      {
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
      },
      {
        title: '文件描述',
        dataIndex: 'description',
        key: 'description',
      },
      {
        title: '分类',
        dataIndex: 'category', // 将 'category_name' 修改为 'category'
        key: 'category',
      },
      {
        title: '文件URL',
        dataIndex: 'url',
        key: 'url',
      },
      {
        title: '操作',
        key: 'action',
      },
    ];

    // 获取分类列表
    const fetchCategories = async () => {
      try {
        const token = getToken();
        const response = await fetch('http://localhost:8000/api/categories/', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) throw new Error('获取分类失败');
        const data = await response.json();
        categories.value = data.map(item => ({
          id: item.id,
          name: item.name,
          value: item.id,
          label: item.name
        }));
      } catch (error) {
        console.error('获取分类失败:', error);
        ElMessage.error('获取分类失败，请刷新页面重试');
      }
    };

    // 获取当前用户资源
    const fetchResources = async (keyword = '') => {
      try {
        const token = getToken();
        if (!token || !user.value || !user.value.username) {
          console.error('用户未登录或用户信息不完整');
          return;
        }

        let url = 'http://localhost:8000/api/files/';
        if (keyword) {
          url += `?search=${encodeURIComponent(keyword)}`;
        }

        console.log('请求URL:', url);
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          console.error('获取资源失败，状态码:', response.status);
          throw new Error(`获取资源失败: ${response.status}`);
        }

        const allFiles = await response.json();
        console.log('所有文件:', allFiles);
        console.log('当前用户名:', user.value.username);

        // 筛选出当前用户的文件
        const userFiles = allFiles.filter(file => {
          const fileUsername = file.username || file.user; // 处理不同可能的字段名
          console.log(`文件所属用户: ${fileUsername}, 当前登录用户: ${user.value.username}`);
          return fileUsername === user.value.username;
        });

        console.log('筛选后的用户文件:', userFiles);
        resources.value = userFiles;

        // 如果筛选后没有文件，显示提示
        if (userFiles.length === 0) {
          ElMessage.info('您没有上传任何文件');
        }
      } catch (error) {
        console.error('获取资源失败:', error);
        ElMessage.error('获取资源失败: ' + error.message);
      }
    };

    // 查看资源
    const viewResource = (record) => {
      if (record.url) {
        window.open(record.url, '_blank');
      } else {
        ElMessage.error('文件URL不存在');
      }
    };

    // 编辑资源
    const editResource = (record) => {
      isAddModal.value = false;
      modalTitle.value = '编辑文件';
      formData.value = { description: record.description, category: record.category };
      selectedFile.value = record;
      modalVisible.value = true;
    };

    // 删除资源
    const deleteResource = async (id) => {
      try {
        const token = getToken();
        const response = await fetch(`http://localhost:8000/api/files/${id}/`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) throw new Error(`删除资源失败: ${response.status}`);
        ElMessage.success('资源删除成功');
        fetchResources(searchKeyword.value); // 重新获取资源列表
      } catch (error) {
        console.error('删除资源失败:', error);
        ElMessage.error('删除资源失败: ' + error.message);
      }
    };

    // 前往登录页
    const goToLogin = () => {
      router.push('/login');
    };

    // 显示新增文件模态框
    const showAddModal = () => {
      isAddModal.value = true;
      modalTitle.value = '添加文件';
      formData.value = { description: '', category: '' };
      selectedFile.value = null;
      modalVisible.value = true;
    };

    // 搜索功能
    const handleSearch = () => {
      fetchResources(searchKeyword.value);
    };

    // 文件上传前处理
    const beforeUpload = (file) => {
      selectedFile.value = file;
      return false; // 阻止自动上传
    };

    // 文件变更处理
    const handleFileChange = (info) => {
      if (info.file.status === 'done') {
        selectedFile.value = info.file.originFileObj;
        ElMessage.success('文件选择成功');
      } else if (info.file.status === 'error') {
        ElMessage.error('文件选择失败');
      }
    };

    // 上传文件到七牛云
    const uploadToQiniu = async (file) => {
      try {
        const filename = file.name;
        const tokenResponse = await fetch(`http://localhost:8000/api/files/upload-token/?filename=${filename}&category=${formData.value.category}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${getToken()}`
          }
        });

        if (!tokenResponse.ok) {
          const errorDetails = await tokenResponse.text();
          throw new Error(`获取上传凭证失败: ${tokenResponse.status} - ${errorDetails}`);
        }

        const { upload_token, upload_url, filename: responseFilename } = await tokenResponse.json();
        const uploadFormData = new FormData();
        uploadFormData.append('token', upload_token);
        uploadFormData.append('key', responseFilename);
        uploadFormData.append('file', file);

        const uploadResponse = await fetch(upload_url, {
          method: 'POST',
          body: uploadFormData
        });

        if (!uploadResponse.ok) {
          const errorDetails = await uploadResponse.text();
          throw new Error(`上传文件到七牛云失败: ${uploadResponse.status} - ${errorDetails}`);
        }

        const result = await uploadResponse.json();
        return { hash: result.hash, key: result.key };
      } catch (error) {
        console.error('上传文件失败:', error);
        ElMessage.error('文件上传失败: ' + error.message);
        return null;
      }
    };

    // 保存文件信息
    const saveFileInfo = async (hash, key) => {
      try {
        const token = getToken();
        const response = await fetch('http://localhost:8000/api/files/save-file-info/', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            key: key,
            hash: hash,
            category: formData.value.category,
            description: formData.value.description,
            url: `http://syr2tubvx.hn-bkt.clouddn.com/${key}`
          })
        });

        if (!response.ok) throw new Error('保存文件信息失败');
        ElMessage.success('文件上传成功');
        return true;
      } catch (error) {
        console.error('保存文件信息失败:', error);
        ElMessage.error('保存文件信息失败: ' + error.message);
        return false;
      }
    };

    // 更新文件信息
    const updateFileInfo = async () => {
      try {
        if (!selectedFile.value || !selectedFile.value.id) {
          ElMessage.error('未选择要编辑的文件');
          return false;
        }
        const token = getToken();
        const response = await fetch(`http://localhost:8000/api/files/${selectedFile.value.id}/`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            description: formData.value.description,
            category: formData.value.category,
            url: selectedFile.value.url
          })
        });

        if (!response.ok) throw new Error('更新文件信息失败');
        ElMessage.success('文件更新成功');
        return true;
      } catch (error) {
        ElMessage.error('更新文件信息失败: ' + error.message);
        console.error('更新文件信息失败:', error);
        return false;
      }
    };

    // 模态框确定按钮处理
    const handleModalOk = async () => {
      if (formRef.value) {
        try {
          await formRef.value.validate();
          if (!formData.value.category) {
            throw new Error('请选择文件分类');
          }
          if (isAddModal.value && selectedFile.value) {
            const uploadResult = await uploadToQiniu(selectedFile.value);
            if (!uploadResult) {
              return;
            }
            const { hash, key } = uploadResult;
            if (hash && key) {
              const success = await saveFileInfo(hash, key);
              if (success) {
                modalVisible.value = false;
                fetchResources(searchKeyword.value);
              }
            }
          } else {
            const success = await updateFileInfo();
            if (success) {
              modalVisible.value = false;
              fetchResources(searchKeyword.value);
            }
          }
        } catch (error) {
          console.error('表单验证失败:', error);
          ElMessage.error(error.message || '表单验证失败');
        }
      }
    };

    // 模态框取消按钮处理
    const handleModalCancel = () => {
      modalVisible.value = false;
      if (formRef.value) {
        formRef.value.resetFields();
      }
      selectedFile.value = null;
    };

    // 监听用户状态变化
    watch(
      () => store.state.user,
      (newUser) => {
        console.log('用户状态变化:', newUser);
        user.value = newUser;
        if (newUser && newUser.username) {
          fetchCategories().then(() => {
            fetchResources();
          });
        }
      },
      { immediate: true }
    );

    return {
      resources,
      columns,
      user,
      searchKeyword,
      categories,
      selectedFile,
      modalVisible,
      modalTitle,
      formData,
      formRef,
      isAddModal,
      previewVisible,
      previewUrl,
      formRules,
      viewResource,
      editResource,
      deleteResource,
      goToLogin,
      showAddModal,
      handleSearch,
      beforeUpload,
      handleFileChange,
      handleModalOk,
      handleModalCancel
    };
  },
};
</script>

<style scoped>
.my-resources-container {
  padding: 20px;
  min-height: calc(100vh - 64px);
}

.login-prompt,
.empty-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  text-align: center;
  background: #f5f5f5;
  border-radius: 8px;
}

.empty-icon {
  font-size: 48px;
  color: #1890ff;
  margin-bottom: 16px;
}

h3 {
  margin-bottom: 8px;
  font-size: 20px;
}

p {
  color: #666;
  margin-bottom: 24px;
}
</style>