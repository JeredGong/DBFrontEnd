<template>
  <div class="common-layout">
<el-container>
  <div class="aside" >
    <div class="UserInfoBox">
        <div class="UserProfileBox">
            <img src="/static/Group 2210.png" alt="UserProfile" />
            </div>
            <div style=" width:80px; height: 28px; margin-top: 5px; " class="Username">
            Dagank 
            </div>
        </div>
    <div class="MenuBox" style="margin-top:40px ; margin-left: 42px;" @click="handleClick('Home')">
        <div class="MenuIcon">
            <el-icon :size=21 >
            <House />
        </el-icon>
        </div>
        <div class="MenuText">
            Home
        </div>
    </div>
    <div class="MenuBox" style="margin-top:27px ; margin-left: 42px;" @click="handleClick('Collections')">
        <div class="MenuIcon">
            <el-icon :size=21 >
            <Collection />
        </el-icon>
        </div>
        <div class="MenuText">
            Collection
        </div>
    </div>
    <div class="MenuBox" style="margin-top:27px ; margin-left: 42px;" @click="handleClick('Upload')">
        <div class="MenuIcon">
            <el-icon :size=21 >
            <UploadFilled />
        </el-icon>
        </div>
        <div class="MenuText">
            Upload
        </div>
    </div>
    <el-dropdown @command="handleClick">
    <div class="MenuBox" style="margin-top:27px ; margin-left: 42px;">
        <div class="MenuIcon">
            <el-icon :size=21>
                <Calendar />
            </el-icon>
        </div>
        <div class="MenuText">
            Schedule
        </div>
    </div>
    <template #dropdown>
        <el-dropdown-menu>
            <el-dropdown-item command="Schedule">借阅图书</el-dropdown-item>
            <el-dropdown-item command="Schdule">用户管理</el-dropdown-item>
            <el-dropdown-item command="Schedule_">借阅管理</el-dropdown-item>
        </el-dropdown-menu>
    </template>
    </el-dropdown>
    <div class="MenuBox" style="margin-top:27px ; margin-left: 42px;" @click="handleClick('Settings')">
        <div class="MenuIcon">
            <el-icon :size=21 >
            <Setting />
        </el-icon>
        </div>
        <div class="MenuText">
            Settings
        </div>
    </div>
    <div class="MenuBox" style="margin-top:27px ; margin-left: 42px;" @click="handleLog()">
        <div class="MenuIcon">
            <el-icon :size=21 >
              <div v-show="LogStatus === 'Log in'"> <Top /> </div>
              <div v-show="LogStatus === 'Log Out'"> <Remove /> </div>
        </el-icon>
        </div>
        <div class="MenuText">
            {{LogStatus}}
        </div>
    </div>
  </div>
    <el-main>
      <keep-alive>
          <component :is="currentComponent" />
      </keep-alive>
    </el-main>
</el-container>
<el-drawer
v-model="drawerVisible"
title=""
size="35%"
:with-header="false"
custom-class="login-drawer"
direction="ltr"
>
<div class="login-container">
  <!-- Logo Section -->
  <div class="logo">LOGO</div>

  <!-- Title and Description -->
  <h2 class="login-title">Login with Lorem</h2>
  <p class="login-description">
    Lorem Ipsum is simply dummy text of the printing and typesetting industry.
  </p>

  <!-- Form Section -->
  <div class="login-form">
    <el-form :model="loginForm" :rules="rules" ref="loginFormRef" label-width="120px">
      <el-form-item label="User name" prop="username">
        <el-input
          v-model="loginForm.username"
          placeholder="Enter your username"
          class="rounded-input"
          clearable
        ></el-input>
      </el-form-item>
      <el-form-item label="Password" prop="password">
        <el-input
          v-model="loginForm.password"
          type="password"
          placeholder="Enter your password"
          class="rounded-input"
          show-password
        ></el-input>
      </el-form-item>
      <!-- Additional Options -->
      <div class="options">
        <el-checkbox v-model="rememberMe">Remember me?</el-checkbox>
        <a href="#" class="forgot-password">Forgot Password?</a>
      </div>
      <!-- Button Section -->
      <el-button type="primary" @click="handleLogin" class="login-button" size="large">
        LogIn
      </el-button>
    </el-form>
  </div>
</div>
</el-drawer>
</div>
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue';
import { Collection, House, UploadFilled, Calendar, Setting, Remove, Top } from '@element-plus/icons-vue';
import Home from './components/Home.vue';
import Collections from './components/Collection.vue';
import Schdule from './components/Schdule.vue';
import Settings from './components/Settings.vue';
import Schedule from './components/Schedule.vue';
import Upload from './components/UploadPaper.vue';
import Schedule_ from './components/Schedule_.vue';
export default defineComponent({
components: {
  House,
  Collection,
  UploadFilled,
  Calendar,
  Setting,
  Remove,
  Home,
  Top,
  Collections,
  Schdule,
  Settings,
  Upload,
  Schedule,
  Schedule_
},
data() {
  return {
    currentComponent: 'Home'
  };
},
methods: {
  handleClick(name: string) {
    this.currentComponent = name;
  }
},
setup() {
  // 使用 ref 创建响应式变量，并添加类型注解
  const drawerVisible = ref<boolean>(false);
  const LogStatus = ref<string>('Log in');
  const loginForm = ref<{ username: string; password: string }>({
    username: '1234',
    password: '1234'
  });
  // 定义规则的类型
  const rules = ref<Record<string, { required: boolean; message: string; trigger: string }[]>>({
    username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
    password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
  });


  const handleLog = (): void => {
    if (LogStatus.value === 'Log in') {
      drawerVisible.value = true;
    } else {
      // 弹窗提示，是否退出登录
      LogStatus.value = 'Log in';
    }
  };
  
  return {
    drawerVisible,
    LogStatus,
    loginForm,
    rules,
    handleLog
  };
}
});
</script>

<style scoped>
.el-container {
background: rgba(230, 230, 230, 1);
box-shadow: 0px 2px 4px  rgba(0, 0, 0, 0.25);
display: flex;
flex-direction: row;
justify-content: center;
height: 100vh;
width: 100%;
opacity: 1;
}
.aside {
width: 14.58%;
height: 100vh;
opacity: 1;
background: rgba(230, 230, 230, 1);
box-shadow: 10px 24px 54px  rgba(0, 0, 0, 0.1);
display: flex;
flex-direction: column;
}
.UserInfoBox{
margin-top: 52px;
margin-left: 39px;
width: 130px;
height: 40px;
opacity: 1;
display: flex;
flex-direction: row;
}
.UserProfileBox{
width: 40px;
height: 40px;
opacity: 1;
margin-right: 10px;
}
.Username{
font-size: 20px;
font-weight: 600;
letter-spacing: 0px;
color: rgba(51, 51, 51, 1);
text-align: left;
vertical-align: top;
}
.MenuBox{
width:80%;
height: 48px;
opacity: 1;
border-radius: 10px;
display: flex;
flex-direction: row;
align-items: center;
cursor: pointer;
transition: background-color 0.3s, color 0.3s;
background-color: transparent;
box-sizing: border-box;
outline: none; /* 去除默认的焦点框 */
border: none;  /* 去除可能的边框 */
}
.MenuBox:hover {
background-color: #3498db;
}
.MenuIcon{
width: 16.9px;
height: 16.7px;
opacity: 1;
}
.MenuText{
margin-left: 14px;
width: 65px;
height: 21px;
opacity: 1;
font-size: 14px;
font-weight: 400;
letter-spacing: 0px;
line-height: 19.6px;
color: rgba(51, 51, 51, 1);
text-align: left;
vertical-align: top;
}
.MenuBox:hover .MenuText {
color: white;
}
.el-main {
--el-main-padding: 0px
width: 85.12%;
}
.login-drawer {
padding: 40px;
background-color: #ffffff;
}

.logo {
font-size: 28px;
font-weight: bold;
color: #1e90ff;
text-align: left;
margin-bottom: 30px;
}

.login-container {
text-align: center;
}

.login-title {
font-size: 26px;
font-weight: bold;
color: #2c3e50;
margin-bottom: 15px;
}

.login-description {
font-size: 16px;
color: #7f8c8d;
margin-bottom: 40px;
line-height: 1.5;
}

.login-form {
display: flex;
flex-direction: column;
align-items: center;
}

.el-form-item {
width: 100%;
margin-bottom: 25px;
}

.rounded-input {
border-radius: 6px;
}

.options {
display: flex;
justify-content: space-between;
width: 100%;
margin-bottom: 30px;
font-size: 14px;
color: #7f8c8d;
}

.forgot-password {
color: #3498db;
text-decoration: none;
}

.forgot-password:hover {
text-decoration: underline;
}

.login-button {
width: 100%;
border-radius: 8px;
background-color: #1e90ff;
color: #fff;
font-size: 18px;
padding: 12px;
transition: all 0.3s;
}

.login-button:hover {
background-color: #1565c0;
}


.el-dropdown-menu {
    background-color: #fff;
    border-radius: 5px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.el-dropdown-item {
    font-size: 14px;
    color: #333;
    padding: 8px 15px;
}

.el-dropdown-item:hover {
    background-color: #3498db;
    color: white;
}
</style>