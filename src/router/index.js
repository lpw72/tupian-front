import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../pages/HomePage.vue';
import LoginPage from '../pages/LoginPage.vue';
import RegisterPage from '../pages/RegisterPage.vue';

import UserProfile from '../components/UserProfile.vue';
import FileLibrary from '../components/FileLibrary.vue';
import MyResources from '../components/MyResources.vue';
import UserInfo from '../components/UserInfo.vue';
import FileList from '../components/FileList.vue';
import Categories from '../components/Categories.vue';
import Roles from '../components/Roles.vue';
import Permissions from '../components/Permissions.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage,
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterPage,
  },
  {
    path: '/profile',
    name: 'UserProfile',
    component: UserProfile,
  },
  {
    path: '/file-library',
    name: 'FileLibrary',
    component: FileLibrary,
  },
  {
    path: '/my-resources',
    name: 'MyResources',
    component: MyResources,
  },
  {
    path: '/user-info',
    name: 'UserInfo',
    component: UserInfo,
  },
  {
    path: '/file-list',
    name: 'FileList',
    component: FileList,
  },
  {
    path: '/categories',
    name: 'Categories',
    component: Categories,
  },
  {
    path: '/roles',
    name: 'Roles',
    component: Roles,
  },
  {
    path: '/permissions',
    name: 'Permissions',
    component: Permissions,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;