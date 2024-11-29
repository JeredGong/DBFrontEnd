<template>
  <div class="settings-container">
    <!-- Header -->
    <div class="header-container">
      <div class="header-left">
        <div class="overview-title">
          <span>用户设置与更改</span>
        </div>
        <div class="formatted-date">
          <span>{{ formattedDate }}</span>
        </div>
      </div>
      <div class="header-right">
        <el-button
          type="primary"
          :icon="House"
          circle
          size="large"
          @click="goHome()"
        />
        <el-dropdown trigger="click" @command="handleNotificationCommand">
          <span class="el-dropdown-link">
            <el-badge is-dot class="notification-badge" :offset="[-5, 1]">
              <el-button :icon="Message" type="primary" circle size="large" />
            </el-badge>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                v-for="(notification, index) in notifications"
                :key="index"
                :command="notification"
              >
                {{ notification.message }}
              </el-dropdown-item>
              <el-dropdown-item v-if="notifications.length === 0" disabled>
                No new notifications
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- 主体部分 -->
    <div class="main-content">
      <div class="box">
  <h3 class="box-title">头像设置</h3>
  <div class="avatar-container">
    <el-upload
          class="avatar-uploader"
          action=#
          :show-file-list="false"
          :limit="1"
          :on-success="handleAvatarChange"
          :on-change="handleAvatarChange"
          :auto-upload="false" 
          >
          <div>
            <el-avatar
              :src="AvatarForm.url"
              size="large"
              shape="circle"
            />
          </div>
      <div class="upload-trigger">
        <el-button
        @click="submitAvatar"
        type="primary" 
        class="custom-button">
          更换头像
        </el-button>
      </div>  
    </el-upload>
  </div>
</div>

<div class="box">
  <h3 class="box-title">更新用户名</h3>
  <div class="form-container">
    <el-form :model="form" >
      <el-form-item >
        <el-input
          v-model="form.username"
          placeholder="Enter username"
          clearable
          class="input-rounded updated-input"
        />
      </el-form-item>
    </el-form>
    <button @click="updateUsername" class="custom-button">更新用户名</button>
  </div>
</div>

<div class="box">
  <h3 class="box-title">更换密码</h3>
  <form @submit.prevent="updatePassword" class="form-container">
    <div class="input-wrapper">
      <input
        v-model="passwordForm.currentPassword"
        type="password"
        placeholder="Current Password"
        class="input-rounded updated-input"
        required
      />
    </div>
    <div class="input-wrapper">
      <input
        v-model="passwordForm.newPassword"
        type="password"
        placeholder="New Password"
        class="input-rounded updated-input"
        required
      />
    </div>
    <div class="input-wrapper">
      <input
        v-model="passwordForm.confirmPassword"
        type="password"
        placeholder="Confirm New Password"
        class="input-rounded updated-input"
        required
      />
    </div>
    <button type="submit" class="custom-button">确认</button>
  </form>
</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { reactive } from 'vue';
import { ElMessage } from "element-plus";
import { Message, House } from "@element-plus/icons-vue";
import { defineEmits } from 'vue';
import axios from 'axios';
import { useUserStore } from '../stores/user';
axios.defaults.baseURL ='http://localhost:9876'
const userStore = useUserStore();           // 引入用户状态
const emit = defineEmits();
const jwtToken = localStorage.getItem('authToken');
// 用户名表单
const form = ref({ username: userStore.user.username });

// 密码表单
const passwordForm = ref({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});
//头像表单
const AvatarForm = reactive({
  image: new Uint8Array(), //头像的二进制
  url   : userStore.user.avatar
});

// 处理头像变更
const handleAvatarChange = (file) => {
  const reader = new FileReader();
  AvatarForm.url = URL.createObjectURL(file.raw);
  reader.onload = (e) => {
    const arrayBuffer = e.target?.result as ArrayBuffer;

    if (!arrayBuffer) {
      console.error("读取文件时出错，文件内容为空！");
      return;
    }

    // 将二进制数据转为数字数组
    AvatarForm.image = new Uint8Array(arrayBuffer); // 转换为数字数组
    console.log("头像的二进制数据:", AvatarForm.image);
  };

  // 捕获读取文件过程中的错误
  reader.onerror = (error) => {
    console.error("文件读取错误:", error);
  };

  // 开始读取文件
  reader.readAsArrayBuffer(file.raw); // 读取文件为二进制数据
}; 

const submitAvatar = async () => {
  try {
    const jwtToken = localStorage.getItem('authToken'); // 获取 JWT Token
    if (!jwtToken) {
      ElMessage.error('请先登录');
      return;
    }

    const avatarData = {
      image: Array.from(AvatarForm.image)
    };
    if(avatarData.image.length === 0){
      ElMessage.error('请先选择头像');
      return;
    }
    const response = await axios.put('/user/image', avatarData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`,
      }
    });
    if(response.status === 200){
      ElMessage.success('头像上传成功');
    }
    console.log('服务器响应:', response.data);
  } catch (error) {
    console.error('头像上传失败:', error);
    ElMessage.error('头像上传失败，请稍后重试');
  }
}

// 更新用户名
const updateUsername = async () => {
      try {
        const response = await axios.put('/user/username', {
          username: form.value.username
        },{
          headers:{
            Authorization:`Bearer ${jwtToken}`
          }
        });
        console.log('Username updated:', response.data);
        ElMessage.success('Username updated successfully!');
      } catch (error) {
        console.error('Error updating username:', error);
        ElMessage.error('Error updating username');
      }
    };

// 更新密码
const updatePassword = async () => {
      const { currentPassword, newPassword, confirmPassword } = passwordForm.value;

      if (!currentPassword || !newPassword || !confirmPassword) {
        ElMessage.error('All fields are required');
        return;
      }

      if (newPassword !== confirmPassword) {
        ElMessage.error('New password and confirmation do not match');
        return;
      }

      try {
        const response = await axios.put('/user/password', {
          old_password_hash: currentPassword,
          password_hash: newPassword
        },{
          headers:{
            Authorization:`Bearer ${jwtToken}`
          }
        });
        console.log('Password updated:', response.data);
        ElMessage.success('Password updated successfully!');
        passwordForm.value.currentPassword = '';
        passwordForm.value.newPassword = '';
        passwordForm.value.confirmPassword = '';
      } catch (error) {
        console.error('Error updating password:', error);
        ElMessage.error('Error updating password');
      }
    };

// 消息处理与日期计算
const notifications = ref([
  { message: "You have a new message from Dr. Alice Smith" },
  { message: 'Your paper "AI and Ethics" has been downloaded 5 times' },
  { message: "You have a new follower: Dr. Bob Brown" },
]);

const formattedDate = computed(() => {
  const currentDate = new Date();
  const day = currentDate.getDate();
  const month = currentDate.toLocaleString("en-US", { month: "long" });
  const year = currentDate.getFullYear();
  const getOrdinalSuffix = (day: number) => {
    if (day > 3 && day < 21) return "th";
    switch (day % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };
  return `${day}${getOrdinalSuffix(day)} ${month} ${year}`;
});


// Navigate to home route
const goHome = () => {
  emit('goHome','Home');
  console.log('Go Home');
};
// Handle dropdown commands
const handleNotificationCommand = (notification) => {
  console.log("Notification clicked:", notification);
};
</script>

<style scoped>
.header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
}

.header-left {
  display: flex;
  flex-direction: column;
  margin-left: 40px;
}

.formatted-date {
  font-size: 14px;
  color: #777;
}

.overview-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-right: 20px;
}

.header-container {
  width: 100%;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 40px;
}
.settings-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin: 0 auto;
}

.header-container {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}

.overview-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.formatted-date {
  font-size: 14px;
  color: #777;
}

.main-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px; /* 调整间距以减少空虚感 */
  width: 100%;
  max-width: 800px;
  margin: 20px auto;
}

.box {
  width: 100%;
  background: white;
  border-radius: 16px;
  padding: 30px 20px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
}

.box-title {
  font-size: 18px;
  color: #2c3e50;
  text-align: left; /* 调整为左对齐，更具结构感 */
  border-left: 4px solid #3498db;
  padding-left: 10px;
  margin-bottom: 20px;
}

.avatar-container,
.form-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.input-wrapper {
  width: 100%;
}

.input-rounded {
  width: 100%;
  font-size: 14px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
  transition: all 0.3s ease-in-out;
}

.input-rounded:focus {
  border-color: #3498db;
  background-color: white;
  outline: none;
  box-shadow: 0 0 8px rgba(52, 152, 219, 0.2);
}

.updated-input {
  padding: 4px 6px; /* 增加内边距，优化视觉 */
}

.custom-button {
  width: auto;
  padding: 10px 30px;
  background: linear-gradient(90deg, #3498db, #2980b9);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.custom-button:hover {
  background: linear-gradient(90deg, #2980b9, #3498db);
  transform: translateY(-2px);
}

.custom-button:active {
  transform: translateY(0);
}

/* 优化头像上传骨架与按钮间距 */
.avatar-uploader {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px; /* 调整骨架和按钮的间距 */
}

.avatar-preview {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 50%;
  background-color: #f2f2f2; /* 提供骨架背景色 */
  border: 1px solid #dcdfe6; /* 骨架边框颜色 */
}

.upload-trigger .el-button {
  border-radius: 20px; /* 调整按钮更加圆润 */
  font-size: 14px; /* 优化字体大小 */
  background-color: #3498db; /* 主色调蓝色 */
  color: #fff; /* 白色文字 */
  transition: all 0.3s ease;
  margin-left: 10px;
}

.upload-trigger .el-button:hover {
  background-color: #217dbb; /* 深蓝色悬停效果 */
}
/* 修改头像上传按钮的样式 */
.el-upload {
  display: inline-block;
}
</style>

