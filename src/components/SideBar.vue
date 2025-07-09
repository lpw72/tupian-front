<template>
  <a-layout-sider width="200" class="site-layout-background">
    <a-menu mode="inline" :selectedKeys="[selectedKey]" style="height: 100%; border-right: 0">
      <a-menu-item key="profile" v-if="true">
        <router-link to="/profile">个人信息</router-link>
      </a-menu-item>
      <a-menu-item key="file-library" v-if="true">
        <router-link to="/file-library">文件库</router-link>
      </a-menu-item>
      <a-menu-item key="my-resources" v-if="true">
        <router-link to="/my-resources">我的资源</router-link>
      </a-menu-item>
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
    // 假设 user.permissions 是权限数组
    const showAdminMenu = computed(() => {
      const user = store.state.user;
      return user && user.permissions && user.permissions.includes('delete_user');
    });
    const selectedKey = computed(() => route.name || 'profile');
    return { showAdminMenu, selectedKey };
  },
};
</script>

<style scoped>
.site-layout-background {
  background: #fff;
}
</style>
