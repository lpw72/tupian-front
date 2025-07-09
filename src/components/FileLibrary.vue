<template>
  <div>
    <h2>文件库</h2>
    <a-table :columns="columns" :data-source="files" row-key="id">
      <!-- 将slot替换为v-slot语法 -->
      <template #bodyCell="{ record }">
        <a-button type="link" @click="viewFile(record)">查看</a-button>
        <a-button type="link" @click="downloadFile(record.id)">下载</a-button>
      </template>
    </a-table>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
// Assuming you have an API endpoint for fetching files
// import apiService from '../services/api';

export default {
  setup() {
    const files = ref([]);
    const columns = [
      {
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
      },
      {
        title: '文件名',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '类型',
        dataIndex: 'type',
        key: 'type',
      },
      {
        title: '操作',
        key: 'action',
        // 删除以下slots配置
        // slots: { customRender: 'action' },
      },
    ];

    const fetchFiles = async () => {
      try {
        // const response = await apiService.getFiles();
        // files.value = response.data;
        files.value = [
          { id: 1, name: 'file1.pdf', type: 'PDF' },
          { id: 2, name: 'image1.jpg', type: 'Image' },
        ];
      } catch (error) {
        console.error('Failed to fetch files:', error);
      }
    };

    const viewFile = (record) => {
      // Implement file viewing logic
      alert(`正在查看文件: ${record.name}`);
    };
    const downloadFile = (id) => {
      // Implement file downloading logic
      alert(`正在下载文件 ID: ${id}`);
    };

    onMounted(() => {
      fetchFiles();
    });

    return {
      files,
      columns,
      viewFile,
      downloadFile,
    };
  },
};
</script>