<template>
  <div class="file-list-container">
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
    <a-table :columns="columns" :data-source="files" row-key="id">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'action'">
          <span>
            <a-button type="link" @click="viewFile(record)">查看</a-button>
            <a-button type="link" @click="editFile(record)">编辑</a-button>
            <a-button type="link" @click="deleteFile(record.id)">删除</a-button>
          </span>
        </template>
        <template v-else-if="column.key === 'url'">
          <a :href="record.url" target="_blank">{{ record.url }}</a>
        </template>
      </template>
    </a-table>

    <!-- 新增/编辑模态框 -->
    <a-modal
      v-model:open="modalVisible"
      :title="modalTitle"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
    >
      <!-- 添加:rules="formRules"绑定 -->
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
import { ref, onMounted } from 'vue';
import { getToken } from '../utils/auth';
import { UploadOutlined } from '@ant-design/icons-vue';
import { ElMessage } from 'element-plus';

export default {
  components: {
    UploadOutlined
  },
  setup() {
    const files = ref([]);
    const previewVisible = ref(false);
    const previewUrl = ref('');
    const modalVisible = ref(false);
    const modalTitle = ref('新增文件');
    const formData = ref({ description: '', category: '' });
    const formRef = ref(null);
    const isAddModal = ref(true);
    const searchKeyword = ref('');
    const categories = ref([]);
    const selectedFile = ref(null);

    // 添加表单验证规则
    const formRules = ref({
      description: [
        { required: true, message: '请输入文件描述', trigger: 'blur' }
      ],
      category: [
        { required: true, message: '请选择文件分类', trigger: 'change' }
      ]
    });

    // 添加以下onMounted钩子
    onMounted(async () => {
      await fetchCategories();
      await fetchFiles();
    });

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
        // 修复：将分类value设置为ID，同时保存名称用于查找
        categories.value = data.map(item => ({
          id: item.id,       // 保存分类ID
          name: item.name,   // 保存分类名称
          value: item.id,    // 使用ID作为提交值
          label: item.name   // 显示名称给用户
        }));
      } catch (error) {
        console.error('获取分类失败:', error);
      }
    };


    const columns = [
      {
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
      },
      {
        title: '用户名',
        dataIndex: 'username',
        key: 'username',
      },
      {
        title: '文件描述',
        dataIndex: 'description',
        key: 'description',
      },
      {
        title: '分类',
        dataIndex: 'category_name',
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

    const fetchFiles = async (keyword = '') => {
      try {
        const token = getToken();
        if (!token) {
          console.error('未找到认证token，请先登录');
          return;
        }

        let url = 'http://localhost:8000/api/files/';
        if (keyword) {
          url += `?search=${encodeURIComponent(keyword)}`;
        }

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            console.error('token无效或已过期，请重新登录');
          }
          throw new Error(`请求失败: ${response.status}`);
        }

        const data = await response.json();
        if (Array.isArray(data)) {
          files.value = data.map(file => ({
            ...file,
            username: file.user || '未知用户',
            category_name: file.category_name || '无分类',
            url: file.url.trim().replace(/[`\s]/g, '') // 增强正则表达式，同时移除反引号和空格
          }));
        } else {
          console.error('后端返回数据格式不正确，期望数组');
          files.value = [];
        }
      } catch (error) {
        console.error('获取文件列表失败:', error);
        files.value = [];
      }
    };

    const viewFile = (record) => {
      window.open(record.url, '_blank');
    };

    const deleteFile = async (id) => {
      try {
        const token = getToken();
        const response = await fetch(`http://localhost:8000/api/files/${id}/`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`删除文件失败: ${response.status}`);
        }

        fetchFiles();
      } catch (error) {
        console.error('删除文件失败:', error);
      }
    };

    const editFile = (record) => {
      isAddModal.value = false;
      modalTitle.value = '编辑文件';
      formData.value = { description: record.description, category: record.category };
      // 修复：设置selectedFile为当前编辑的记录
      selectedFile.value = record;
      modalVisible.value = true;
    };

    const uploadToQiniu = async (file) => {
      try {
        const filename = file.name;
        // 修复：使用category_name而非category
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
    
        // 关键修复：移除所有headers配置
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
            url: `http://syr2tubvx.hn-bkt.clouddn.com/${key}` // 添加URL字段
          })
        });

        if (!response.ok) throw new Error('保存文件信息失败');

        fetchFiles();
      } catch (error) {
        console.error('保存文件信息失败:', error);
        ElMessage.error('保存文件信息失败: ' + error.message); // 添加用户可见错误提示
      }
    };

    const updateFileInfo = async () => {
      try {
        if (!selectedFile.value || !selectedFile.value.id) {
          ElMessage.error('未选择要编辑的文件');
          return;
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
            url: selectedFile.value.url // 添加URL字段
          })
        });

        if (!response.ok) throw new Error('更新文件信息失败');

        fetchFiles();
      } catch (error) {
        ElMessage.error('更新文件信息失败: ' + error.message);
        console.error('更新文件信息失败:', error);
      }
    };

    const handleModalOk = async () => {
      if (formRef.value) {
        try {
          await formRef.value.validate();
          // 添加分类检查
          if (!formData.value.category) {
            throw new Error('请选择文件分类');
          }
          if (isAddModal.value && selectedFile.value) {
            const uploadResult = await uploadToQiniu(selectedFile.value);
            // 添加null检查
            if (!uploadResult) {
              ElMessage.error('文件上传失败，请重试');
              return;
            }
            const { hash, key } = uploadResult;
            if (hash && key) {
              await saveFileInfo(hash, key);
            }
          } else {
            await updateFileInfo();
          }
          modalVisible.value = false;
          fetchFiles();
        } catch (error) {
          console.error('表单验证失败:', error);
        }
      }
    };

    const handleModalCancel = () => {
      modalVisible.value = false;
      if (formRef.value) {
        formRef.value.resetFields();
      }
      selectedFile.value = null;
    };

    const previewImage = (url) => {
      previewUrl.value = url;
      previewVisible.value = true;
    };

    const beforeUpload = (file) => {
      selectedFile.value = file;  // 修复：取消注释并添加file参数
      return false; // 阻止自动上传
    };

    // 添加文件变更处理函数
    const handleFileChange = (info) => {
      if (info.file.status === 'done') {
        selectedFile.value = info.file.originFileObj;
        ElMessage.success('文件选择成功');
      } else if (info.file.status === 'error') {
        ElMessage.error('文件选择失败');
      }
    };

    const handleSearch = () => {
      fetchFiles(searchKeyword.value);
    };

    // 添加 showAddModal 函数
    const showAddModal = () => {
      isAddModal.value = true;
      modalTitle.value = '添加文件';
      formData.value = { description: '', category: '' };
      modalVisible.value = true;
    };

    onMounted(() => {
      fetchCategories().then(() => {
        fetchFiles();
      });
    });

    return {
      files,
      previewVisible,
      previewUrl,
      modalVisible,
      modalTitle,
      formData,
      formRef,
      isAddModal,
      searchKeyword,
      categories,
      selectedFile,
      columns,
      fetchFiles,
      viewFile,
      deleteFile,
      editFile,
      handleModalOk,
      handleModalCancel,
      showAddModal,
      handleSearch,
      previewImage,
      beforeUpload,
      handleFileChange,
      formRules
    };
  }
};
</script>

<style scoped>
/* 浏览器兼容性修复 */
/* appearance属性兼容 */
input, select, button {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}

/* text-size-adjust属性兼容 */
body {
  -webkit-text-size-adjust: 100%;
  -ms-text-size-adjust: 100%;
  text-size-adjust: 100%;
}

/* user-select属性兼容 */
.no-select {
  -webkit-user-select: none;
  user-select: none;
}

/* 确保表格内容正确显示 */
.ant-table-cell {
  word-break: break-all;
}
</style>



