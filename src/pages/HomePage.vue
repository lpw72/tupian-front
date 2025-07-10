<template>
  <div class="home-container">
    <!-- 未登录状态 -->
    <div v-if="!isAuthenticated" class="auth-buttons">
      <h1>欢迎使用文件权限管理系统</h1>
      <p>请登录或注册以继续使用</p>
      <div class="button-group">
        <router-link to="/login">
          <a-button type="primary" style="margin: 0 10px;">登录</a-button>
        </router-link>
        <router-link to="/register">
          <a-button type="default">注册</a-button>
        </router-link>
      </div>
    </div>

    <!-- 已登录状态 -->
    <div v-else class="dashboard">
      <h1>欢迎回来，{{ user?.username }}！</h1>
      <a-card class="user-summary" title="用户信息摘要">
        <a-descriptions :column="1">
          <a-descriptions-item label="用户名">{{ user?.username }}</a-descriptions-item>
          <a-descriptions-item label="邮箱">{{ user?.email }}</a-descriptions-item>
          <a-descriptions-item label="角色">{{ user?.role || '普通用户' }}</a-descriptions-item>
          <a-descriptions-item label="权限数量">{{ user?.permission_count || 0 }}</a-descriptions-item>
        </a-descriptions>
        <a-button type="primary" @click="handleLogout" style="margin-top: 16px;">退出登录</a-button>
      </a-card>

      <div class="quick-links">
        <h2>快速访问</h2>
        <a-row :gutter="[16, 16]">
          <a-col :span="8">
            <a-card @click="goTo('/file-library')" class="link-card">
              <FileOutlined />
              <p>文件库</p>
            </a-card>
          </a-col>
          <a-col :span="8">
            <a-card @click="goTo('/my-resources')" class="link-card">
              <CloudUploadOutlined />
              <p>我的资源</p>
            </a-card>
          </a-col>
          <a-col :span="8">
            <a-card @click="goTo('/profile')" class="link-card">
              <UserOutlined />
              <p>个人信息</p>
            </a-card>
          </a-col>
        </a-row>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
// 修改导入部分
import { Card, Row, Col, Descriptions, Button } from 'ant-design-vue';
import { FileOutlined, CloudUploadOutlined, UserOutlined } from '@ant-design/icons-vue';

export default {
  components: {
    ACard: Card,
    ARow: Row,
    ACol: Col,
    ADescriptions: Descriptions,
    ADescriptionsItem: Descriptions.Item,
    AButton: Button,
    FileOutlined, CloudUploadOutlined, UserOutlined
  },
  setup() {
    const store = useStore();
    const router = useRouter();

    // 从Vuex获取用户状态
    const isAuthenticated = computed(() => store.getters.isAuthenticated);
    const user = computed(() => store.state.user);

    // 处理登出
    const handleLogout = () => {
      store.dispatch('logout');
      router.push('/login');
    };

    // 跳转到指定页面
    const goTo = (path) => {
      router.push(path);
    };

    return {
      isAuthenticated,
      user,
      handleLogout,
      goTo
    };
  }
};
</script>

<style scoped>
.home-container {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.auth-buttons {
  text-align: center;
  margin-top: 100px;
}

.button-group {
  margin-top: 24px;
}

.dashboard {
  margin-top: 24px;
}

.user-summary {
  margin-bottom: 32px;
}

.quick-links {
  margin-top: 32px;
}

.link-card {
  cursor: pointer;
  text-align: center;
  padding: 24px 0;
  transition: all 0.3s;
}

.link-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.link-card .anticon {
  font-size: 32px;
  margin-bottom: 16px;
  color: #1890ff;
}
</style>