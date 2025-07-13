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
    const files = ref([]); // 存储所有文件的数据
    const previewVisible = ref(false); // 控制图片预览弹窗是否可见
    const previewUrl = ref(''); // 预览图片的URL
    const modalVisible = ref(false); // 控制添加/编辑文件模态框是否可见
    const modalTitle = ref('新增文件'); // 模态框标题
    const formData = ref({ description: '', category: '' }); // 表单数据
    const formRef = ref(null); // 表单引用
    const isAddModal = ref(true); // 是否为添加模式
    const searchKeyword = ref(''); // 搜索关键词
    const categories = ref([]); // 分类列表
    const selectedFile = ref(null); // 当前选中的文件

    // 添加表单验证规则
    const formRules = ref({
      description: [
        { required: true, message: '请输入文件描述', trigger: 'blur' }
      ],
      category: [
        { required: true, message: '请选择文件分类', trigger: 'change' }
      ]
    });

    // 组件挂载时获取分类和文件数据
    onMounted(async () => {
      await fetchCategories();
      await fetchFiles();
    });

    // 获取分类数据
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
        // 将分类value设置为ID，同时保存名称用于查找
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

    // 定义表格列
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

    // 获取文件数据
    const fetchFiles = async (keyword = '') => {
      try {
        const token = getToken();
        if (!token) {
          console.error('未找到认证token，请先登录');
          return;
        }

        let url = 'http://localhost:8000/api/files/';
        const params = new URLSearchParams();
        // 添加管理员参数，确保获取所有文件
        params.append('admin', 'true');
        if (keyword) {
          params.append('search', encodeURIComponent(keyword));
        }
        url += `?${params.toString()}`;

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
            // 添加错误提示给用户
            ElMessage.error('登录已过期，请重新登录');
          }
          throw new Error(`请求失败: ${response.status}`);
        }

        // 处理数据并更新文件列表
        const data = await response.json();
        files.value = data.results || data; // 兼容不同的后端返回格式
        if (files.value.length === 0) {
          ElMessage.info('没有找到文件数据');
        }
      } catch (error) {
        console.error('获取文件列表失败:', error);
        ElMessage.error('获取文件列表失败，请稍后重试');
      }
    };

    // 查看文件
    const viewFile = (record) => {
      window.open(record.url, '_blank');
    };

    // 删除文件
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

        fetchFiles(); // 刷新文件列表
      } catch (error) {
        console.error('删除文件失败:', error);
      }
    };

    // 编辑文件
    const editFile = (record) => {
      isAddModal.value = false;
      modalTitle.value = '编辑文件';
      formData.value = { description: record.description, category: record.category };
      // 设置selectedFile为当前编辑的记录
      selectedFile.value = record;
      modalVisible.value = true;
    };

    // 上传文件到七牛云
    const uploadToQiniu = async (file) => {
      try {
        const filename = file.name;
        // 使用category_name而非category
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
    
        // 移除所有headers配置
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

    // 保存文件信息到数据库
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

        fetchFiles(); // 刷新文件列表
      } catch (error) {
        console.error('保存文件信息失败:', error);
        ElMessage.error('保存文件信息失败: ' + error.message); // 添加用户可见错误提示
      }
    };

    // 更新文件信息
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

        fetchFiles(); // 刷新文件列表
      } catch (error) {
        ElMessage.error('更新文件信息失败: ' + error.message);
        console.error('更新文件信息失败:', error);
      }
    };

    // 处理模态框确认事件
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
          fetchFiles(); // 刷新文件列表
        } catch (error) {
          console.error('表单验证失败:', error);
        }
      }
    };

    // 处理模态框取消事件
    const handleModalCancel = () => {
      modalVisible.value = false;
      if (formRef.value) {
        formRef.value.resetFields();
      }
      selectedFile.value = null;
    };

    // 预览图片
    const previewImage = (url) => {
      previewUrl.value = url;
      previewVisible.value = true;
    };

    // 上传前处理文件
    const beforeUpload = (file) => {
      selectedFile.value = file;  // 取消注释并添加file参数
      return false; // 阻止自动上传
    };

    // 文件变更处理函数
    const handleFileChange = (info) => {
      if (info.file.status === 'done') {
        selectedFile.value = info.file.originFileObj;
        ElMessage.success('文件选择成功');
      } else if (info.file.status === 'error') {
        ElMessage.error('文件选择失败');
      }
    };

    // 搜索文件
    const handleSearch = () => {
      fetchFiles(searchKeyword.value);
    };

    // 显示添加文件模态框
    const showAddModal = () => {
      isAddModal.value = true;
      modalTitle.value = '添加文件';
      formData.value = { description: '', category: '' };
      modalVisible.value = true;
    };

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



