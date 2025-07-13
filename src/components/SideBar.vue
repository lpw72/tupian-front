<template>
  <a-layout-sider width="200" class="site-layout-background">
    <a-menu mode="inline" :selectedKeys="[selectedKey]" style="height: 100%; border-right: 0">
      <!-- 始终显示的菜单项 -->
      <a-menu-item key="home">
        <router-link to="/">首页</router-link>
      </a-menu-item>
      <a-menu-item key="profile">
        <router-link to="/profile">个人信息</router-link>
      </a-menu-item>
      <a-menu-item key="file-library">
        <router-link to="/file-library">文件库</router-link>
      </a-menu-item>
      <a-menu-item key="my-resources">
        <router-link to="/my-resources">我的资源</router-link>
      </a-menu-item>
      
      <!-- 需要权限控制的菜单项 -->
      <a-menu-item key="user-info" v-if="showUserInfoMenu">
        <router-link to="/user-info">用户信息</router-link>
      </a-menu-item>
      <a-menu-item key="file-list" v-if="showFileListMenu">
        <router-link to="/file-list">文件列表</router-link>
      </a-menu-item>
      <a-menu-item key="categories" v-if="showAdminOnlyMenu">
        <router-link to="/categories">类别表</router-link>
      </a-menu-item>
      <a-menu-item key="roles" v-if="showAdminOnlyMenu">
        <router-link to="/roles">角色列表</router-link>
      </a-menu-item>
      <a-menu-item key="permissions" v-if="showAdminOnlyMenu">
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
    
    // 用户信息菜单：管理角色或删除用户权限
    const showUserInfoMenu = computed(() => {
      const user = store.state.user;
      return user && user.permissions && (
        user.permissions.includes('管理角色权限') || 
        user.permissions.includes('删除用户权限')
      );
    });
    
    // 文件列表菜单：删除任何文件权限
    const showFileListMenu = computed(() => {
      const user = store.state.user;
      return user && (
        user.permissions && user.permissions.includes('删除任何文件权限')
      );
    });
    
    // 管理员专用菜单：仅管理员角色可见
    const showAdminOnlyMenu = computed(() => {
      const user = store.state.user;
      return user && user.role === '管理员';
    });
    
    const selectedKey = computed(() => route.name || 'home');
    return { showUserInfoMenu, showFileListMenu, showAdminOnlyMenu, selectedKey };
  },
};
</script>

<style scoped>
.site-layout-background {
  background: #fff;
}
</style>
