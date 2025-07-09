<template>
  <a-menu mode="horizontal" theme="dark">
    <a-menu-item key="home"><router-link to="/">首页</router-link></a-menu-item>
    <a-menu-item key="profile"><router-link to="/profile">个人信息</router-link></a-menu-item>
    <a-menu-item key="file-library"><router-link to="/file-library">文件库</router-link></a-menu-item>
    <a-menu-item key="my-resources"><router-link to="/my-resources">我的资源</router-link></a-menu-item>
    <a-menu-item v-if="showAdminMenu" key="user-info"><router-link to="/user-info">用户信息</router-link></a-menu-item>
    <a-menu-item v-if="showAdminMenu" key="file-list"><router-link to="/file-list">文件列表</router-link></a-menu-item>
    <a-menu-item v-if="showAdminMenu" key="categories"><router-link to="/categories">类别表</router-link></a-menu-item>
    <a-menu-item v-if="showAdminMenu" key="roles"><router-link to="/roles">角色列表</router-link></a-menu-item>
    <a-menu-item v-if="showAdminMenu" key="permissions"><router-link to="/permissions">权限列表</router-link></a-menu-item>
  </a-menu>
</template>

<script>
import { computed } from 'vue';
import { useStore } from 'vuex';

export default {
  name: 'AppNavbar',
  setup() {
    const store = useStore();
    // 判断是否为管理员（有 delete_user 权限）
    const showAdminMenu = computed(() => {
      const user = store.state.user;
      // 管理员角色或拥有删除用户权限都可显示管理菜单
      return user && (
        user.role === 'admin' || 
        (user.permissions && user.permissions.includes('delete_user'))
      );
    });
    return { showAdminMenu };
  },
};
</script>