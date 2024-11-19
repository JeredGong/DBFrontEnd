<template>
  <div class="settings-container">
    <el-card class="settings-card" shadow="always">
      <template #header>
        <div class="header-container">
          <h2 class="header-title">⚙️ Settings</h2>
        </div>
      </template>

      <!-- 头像设置部分 -->
      <div class="section">
        <h3 class="section-title">Update Avatar</h3>
        <div class="avatar-section">
          <el-avatar src="/static/Group 2210.png" size="100" shape="circle" />
          <el-button type="primary" @click="uploadAvatar" size="small">Change Avatar</el-button>
          <input
            type="file"
            ref="avatarInput"
            @change="handleAvatarChange"
            accept="image/*"
            style="display: none"
          />
        </div>
      </div>

      <!-- 用户名设置部分 -->
      <div class="section">
        <h3 class="section-title">Update Username</h3>
        <el-form :model="form" label-width="100px" class="username-form">
          <el-form-item label="Username">
            <el-input
              v-model="form.username"
              placeholder="Enter username"
              clearable
              class="input-rounded"
            />
          </el-form-item>
          <el-button type="success" @click="updateUsername" size="small">Update Username</el-button>
        </el-form>
      </div>

      <!-- 修改密码部分 -->
      <div class="section">
        <h3 class="section-title">Change Password</h3>
        <form class="password-form" @submit.prevent="updatePassword">
          <input
            v-model="passwordForm.currentPassword"
            type="password"
            placeholder="Current Password"
            class="input-rounded"
            required
          />
          <input
            v-model="passwordForm.newPassword"
            type="password"
            placeholder="New Password"
            class="input-rounded"
            required
          />
          <input
            v-model="passwordForm.confirmPassword"
            type="password"
            placeholder="Confirm New Password"
            class="input-rounded"
            required
          />
          <button type="submit" class="submit-button">Update Password</button>
        </form>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { ElMessage } from 'element-plus';

export default defineComponent({
  name: 'Settings',
  setup() {
    const form = ref({ username: 'Dagank' });

    const passwordForm = ref({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });

    const uploadAvatar = () => {
      const input = document.querySelector("input[type='file']") as HTMLInputElement;
      if (input) input.click();
    };

    const handleAvatarChange = (event: Event) => {
      const file = (event.target as HTMLInputElement)?.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          ElMessage.success('Avatar updated successfully!');
        };
        reader.readAsDataURL(file);
      }
    };

    const updateUsername = () => {
      ElMessage.success(`Username updated to: ${form.value.username}`);
    };

    const updatePassword = () => {
      const { currentPassword, newPassword, confirmPassword } = passwordForm.value;

      if (!currentPassword || !newPassword || !confirmPassword) {
        ElMessage.error('All fields are required');
        return;
      }
      if (newPassword !== confirmPassword) {
        ElMessage.error('New password and confirmation do not match');
        return;
      }

      ElMessage.success('Password updated successfully!');
      passwordForm.value.currentPassword = '';
      passwordForm.value.newPassword = '';
      passwordForm.value.confirmPassword = '';
    };

    return {
      form,
      passwordForm,
      uploadAvatar,
      handleAvatarChange,
      updateUsername,
      updatePassword,
    };
  },
});
</script>

<style scoped>
.settings-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 20px;
  background-color: #f9f9f9;
  min-height: 100vh;
  border: 2px solid #3498db; /* 添加蓝色边框 */
  border-radius: 12px;
}

.settings-card {
  width: 100%;
  max-width: 600px;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  background: #fff;
}

.header-container {
  text-align: center;
  margin-bottom: 10px;
}

.header-title {
  font-size: 28px;
  font-weight: bold;
  color: #3498db;
  background: linear-gradient(90deg, #3498db, #1abc9c);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.1);
}

.section {
  margin-bottom: 30px;
}

.section-title {
  font-size: 18px;
  margin-bottom: 10px;
  font-weight: 600;
  color: #333;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 20px;
}

.username-form {
  margin-top: 10px;
}

.input-rounded {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s ease;
}

.input-rounded:focus {
  border-color: #3498db;
  outline: none;
}

.password-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.submit-button {
  padding: 10px;
  background: linear-gradient(90deg, #3498db, #1abc9c);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.submit-button:hover {
  background: linear-gradient(90deg, #1abc9c, #3498db);
}
</style>
