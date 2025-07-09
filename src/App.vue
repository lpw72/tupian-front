<template>
  <a-layout style="min-height: 100vh;">
    <a-layout-header style="background: #001529; padding: 0 24px;">
      <a-menu mode="horizontal" theme="dark" style="line-height: 64px;">
        <a-menu-item key="home">
          <router-link to="/">首页</router-link>
        </a-menu-item>
      </a-menu>
    </a-layout-header>
    <a-layout>
      <SideBar />
      <a-layout-content style="padding: 24px;">
        <router-view />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script>
import SideBar from './components/SideBar.vue';
export default {
  name: 'App',
  components: {
    SideBar
  }
}
</script>

<style>

</style>
