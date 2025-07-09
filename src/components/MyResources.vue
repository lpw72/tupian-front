<template>
  <div>
    <h2>我的资源</h2>
    <a-table :columns="columns" :data-source="resources" row-key="id">
      <template #action="{ record }">
        <a-button type="link" @click="viewResource(record)">查看</a-button>
        <a-button type="link" @click="deleteResource(record.id)">删除</a-button>
      </template>
    </a-table>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
// Assuming you have an API endpoint for fetching resources
// import apiService from '../services/api';

export default {
  setup() {
    const resources = ref([]);
    const columns = [
      {
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
      },
      {
        title: '资源名',
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
        // Remove deprecated slots configuration
        // slots: { customRender: 'action' },
      },
    ];

    const fetchResources = async () => {
      try {
        // const response = await apiService.getResources();
        // resources.value = response.data;
        resources.value = [
          { id: 1, name: 'resource1.docx', type: 'Document' },
          { id: 2, name: 'resource2.xlsx', type: 'Spreadsheet' },
        ];
      } catch (error) {
        console.error('Failed to fetch resources:', error);
      }
    };

    const viewResource = (record) => {
      // Implement resource viewing logic
      alert(`正在查看资源: ${record.name}`);
    };
    const deleteResource = (id) => {
      // Implement resource deletion logic
      alert(`正在删除资源 ID: ${id}`);
    };

    onMounted(() => {
      fetchResources();
    });

    return {
      resources,
      columns,
      viewResource,
      deleteResource,
    };
  },
};
</script>