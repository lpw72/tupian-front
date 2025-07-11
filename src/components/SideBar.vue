<template>
  <a-layout-sider width="200" class="site-layout-background">
    <a-menu mode="inline" :selectedKeys="[selectedKey]" style="height: 100%; border-right: 0">
      <!-- 新增首页菜单 -->
      <a-menu-item key="home">
        <router-link to="/">首页</router-link>
      </a-menu-item>
      
      <!-- 保留原有菜单 -->
      <a-menu-item key="profile">
        <router-link to="/profile">个人信息</router-link>
      </a-menu-item>
      <a-menu-item key="file-library">
        <router-link to="/file-library">文件库</router-link>
      </a-menu-item>
      <a-menu-item key="my-resources">
        <router-link to="/my-resources">我的资源</router-link>
      </a-menu-item>
      
      <!-- 管理员菜单 -->
      <a-menu-item key="user-info" v-if="showAdminMenu">
        <router-link to="/user-info">用户信息</router-link>
      </a-menu-item>
      <a-menu-item key="file-list" v-if="showAdminMenu">
        <router-link to="/file-list">文件列表</router-link>
      </a-menu-item>
      <a-menu-item key="categories" v-if="showAdminMenu">
        <router-link to="/categories">类别表</router-link>
      </a-menu-item>
      <a-menu-item key="roles" v-if="showAdminMenu">
        <router-link to="/roles">角色列表</router-link>
      </a-menu-item>
      <a-menu-item key="permissions" v-if="showAdminMenu">
        <router-link to="/permissions">权限列表</router-link>
      </a-menu-item>
    </a-menu>
  </a-layout-sider>
</template>

<script>
import { computed } from 'vue';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';

export default {
  name: 'SideBar',
  setup() {
    const store = useStore();
    const route = useRoute();
    
    // 统一使用Navbar的管理员权限判断逻辑
    const showAdminMenu = computed(() => {
      const user = store.state.user;
      return user && (
        user.role === '管理员' || // 将 'admin' 修改为 '管理员' 以匹配中文角色名
        (user.permissions && user.permissions.includes('delete_user'))
      );
    });
    
    const selectedKey = computed(() => route.name || 'home');
    return { showAdminMenu, selectedKey };
  },
};
</script>

<style scoped>
.site-layout-background {
  background: #fff;
}
</style>
