<template>
  <div class="schedule-container">
    <div class="header-container">
      <div class="header-left">
        <div class="overview-title">
          <span>用户管理系统</span>
        </div>
        <div class="formatted-date">
          <span>{{ formattedDate }}</span>
        </div>
      </div>
      <div class="header-right">
        <el-button type="primary" :icon="House" circle size="large" @click="goHome" />
        <el-dropdown trigger="click" @command="handleNotificationCommand">
          <span class="el-dropdown-link">
            <el-badge is-dot class="notification-badge" :offset="[-5,1]">
              <el-button :icon="Message" type="primary" circle size="large" />
            </el-badge>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item v-for="(notification, index) in notifications" :key="index" :command="notification">
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

    <div class="after-header">
      <div class="actions">
        <el-button
        type="primary"
        size="large"
        class="custom-add-user-btn"
        @click="addUser"
        >
        添加用户
        </el-button>
      </div>

      <div class="table">

        <div class="search-bar">
      <el-input
        v-model="searchQuery"
        placeholder="请输入用户名或邮箱进行搜索"
        clearable
        prefix-icon="el-icon-search"
        class="custom-search-input"
      />
    </div>
    <!-- 表格部分 -->
    <el-table
      border
      style="width: 100%"
      class="custom-table"
      :data="paginatedUsers"
    >
      <el-table-column
        prop="username"
        label="用户名"
        align="center"
        class-name="custom-column"
      />
      <el-table-column
        prop="email"
        label="邮箱"
        align="center"
        class-name="custom-column"
      />
      <el-table-column
        prop="isAdmin"
        label="角色"
        align="center"
        class-name="custom-column"
      >
        <template #default="{ row }">
          <el-tag
            :type="row.isAdmin ? 'success' : 'info'"
            effect="plain"
            class="custom-role-tag"
          >
            {{ row.isAdmin ? '管理员' : '普通用户' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="200"
        class-name="custom-column"
      >
        <template #default="{ row }">
          <el-button
            size="small"
            type="primary"
            @click="toggleAdmin(row)"
            class="custom-action-btn"
          >
            {{ row.isAdmin ? '降为普通用户' : '提升为管理员' }}
          </el-button>
          <el-button
            size="small"
            type="danger"
            @click="deleteUser(row.id)"
            class="custom-delete-btn"
          >
            删除用户
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      background
      layout="prev, pager, next"
      :current-page="currentPage"
      :page-size="pageSize"
      :total="sortedUsers.length"
      @current-change="handlePageChange"
      class="custom-pagination"
    />
  </div>
     
<div class="form-item">
  <el-dialog
  v-model="showAddUserModal"
  title=""
  width="40%"
  :close-on-click-modal="false"
  class="custom-dialog"
>
  <!-- 自定义标题 -->
  <div class="dialog-header">
    <h2>添加新用户</h2>
  </div>

  <form @submit.prevent="submitNewUser">
    <!-- 头像上传 -->
    <div class="form-item">
      <el-form-item label="头像" align="center" label-width="40px" >
        <el-upload
          class="avatar-uploader"
          action="#"
          :show-file-list="false"
          :on-change="handleAvatarChange"
          :before-upload="beforeAvatarUpload"
        >
          <el-avatar
            size="large"
            :src="newUser.avatar"
            class="avatar-preview"
          />
          <div slot="trigger" class="upload-trigger">
            <el-button
              type="primary"
              icon="el-icon-picture"
              size="small"
            >
              上传头像
            </el-button>
          </div>
        </el-upload>
      </el-form-item>
    </div>

    <!-- 用户名 -->
    <div class="form-item">
      <el-form-item label="用户名" label-width="100px" required>
        <el-input
          v-model="newUser.username"
          placeholder="请输入用户名"
          class="custom-input"
        />
      </el-form-item>
    </div>

    <!-- 邮箱 -->
    <div class="form-item">
      <el-form-item label="邮箱" label-width="100px" required>
        <el-input
          v-model="newUser.email"
          placeholder="请输入邮箱"
          type="email"
          class="custom-input"
        />
      </el-form-item>
    </div>

    <!-- 密码 -->
    <div class="form-item">
      <el-form-item label="密码" label-width="100px" required>
        <el-input
          v-model="newUser.password"
          placeholder="请输入密码"
          type="password"
          class="custom-input"
        />
      </el-form-item>
    </div>

    <!-- 是否设置为管理员 -->
    <div class="form-item">
      <el-form-item label="设置为管理员" label-width="100px">
        <el-switch
          v-model="newUser.isAdmin"
          active-text="是"
          inactive-text="否"
          active-color="#3498db"
          inactive-color="#e74c3c"
        />
      </el-form-item>
    </div>

    <!-- 按钮 -->
    <div class="modal-actions">
      <el-button
        type="primary"
        size="large"
        native-type="submit"
        class="submit-btn"
      >
        提交
      </el-button>
      <el-button
        size="large"
        type="danger"
        @click="closeAddUserModal"
        class="cancel-btn"
      >
        取消
      </el-button>
    </div>
  </form>
</el-dialog>
</div>
  
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted} from 'vue';
import { Message, House, Search } from '@element-plus/icons-vue';
import { defineEmits } from 'vue';
import axios from 'axios';

// 使用 defineEmits 来定义触发的事件
const emit = defineEmits();
const jwtToken = localStorage.getItem('authToken'); // 假设存储在 localStorage

// 第一部分：用户查询与管理
// 定义用户类型
interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  image: string;
}

// 用户数据
const users = ref<User[]>([]); // 存储所有用户信息
const searchQuery = ref(''); // 搜索框内容
const filteredUsers = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) {
    return users.value; // 搜索框为空时返回全部用户
  }
  return users.value.filter((user) =>
    user.username.toLowerCase().includes(query) ||
    user.email.toLowerCase().includes(query) ||
    user.role.toLowerCase().includes(query)
  );
});
// 页面加载时获取用户信息
const fetchUsers = async () => {
  try {
    const response = await axios.get(`/user/all`, {
      headers: {
        Authorization: `Bearer ${jwtToken}`, // 添加 JWT Token
      },
    });
    users.value = response.data; // 将接口数据存入状态
  } catch (error) {
    console.error('Error fetching users:', error);
  }
};



// 当前页码
const currentPage = ref(1);
// 每页显示的条数
const pageSize = ref(5);
// 处理排序逻辑（管理员优先）
const sortedUsers = computed(() => {
  return filteredUsers.value.slice().sort((a, b) => {
    if (a.role === b.role) return 0;
    return a.role ? 1 : -1; // 管理员排在前面
  });
});
// 获取当前页的用户
const paginatedUsers = computed(() => {
  const startIndex = (currentPage.value - 1) * pageSize.value;
  const endIndex = startIndex + pageSize.value;
  return sortedUsers.value.slice(startIndex, endIndex);
});


// 分页切换事件
const handlePageChange = (page: number) => {
  currentPage.value = page;
};


// 第二部分：添加新用户
// 定义新用户数据类型
interface NewUser {
  username: string;
  password_hash: string;
  email: string;
  role: number;
  image: number[]; // 使用数字数组来表示二进制数据
}
const newUser = ref<NewUser>({
  username: "",
  email: "",
  password_hash: "",
  role: 0 , // 是否管理员
  image: [] // 头像路径
});

// 控制弹窗的显示
const showAddUserModal = ref(false);

// 添加用户弹窗显示
const addUser = () => {
  showAddUserModal.value = true;
};

// 关闭添加用户弹窗
const closeAddUserModal = () => {
  showAddUserModal.value = false;
};

// 提交新用户
const submitNewUser = async () => {
  try {
    // 校验数据完整性
    if (!newUser.value.username || !newUser.value.email || !newUser.value.password_hash || !newUser.value.image || newUser.value.image.length === 0) {
      return alert("请填写完整的用户信息！");
    }

    // 将数据组织为后端要求的格式
    const requestData = {
      username: newUser.value.username,
      password_hash: newUser.value.password_hash, // 假设密码直接作为哈希值发送
      email: newUser.value.email,
      role: newUser.value.role,
      image: newUser.value.image, // 直接使用已经存储的 image 数组（number[]）
    };

    // 调用后端 API
    const response = await axios.post(`/user/register`, requestData, {
      headers: {
        Authorization: `Bearer ${jwtToken}`, // 添加 JWT Token
        "Content-Type": "application/json", // 指定 JSON 格式
      },
    });

    if (response.status === 200) {
      alert("用户添加成功！");
      // 清空表单
      newUser.value = { username: "", email: "", password_hash: "", image: [], role: 0 };
      showAddUserModal.value = false;
      // 重新加载用户列表
      fetchUsers();
    }
  } catch (error) {
    console.error("Error registering user:", error);
    alert("用户添加失败，请检查输入信息或稍后重试！");
  }
};



// 删除用户
const deleteUser = (userId: number) => {
  users.value = users.value.filter(user => user.id !== userId);
};

const handleAvatarChange = (file: File) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const arrayBuffer = e.target?.result as ArrayBuffer; // 获取二进制数据（ArrayBuffer）
    newUser.value.image = Array.from(new Uint8Array(arrayBuffer)); // 转换为数字数组
  };
  reader.readAsArrayBuffer(file); // 读取文件为二进制数据
};



// Formatting the current date
const formattedDate = computed(() => {
  const currentDate = new Date();
  const day = currentDate.getDate();
  const month = currentDate.toLocaleString('en-US', { month: 'long' });
  const year = currentDate.getFullYear();

  const getOrdinalSuffix = (day: number) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1:
        return 'st';
      case 2:
        return 'nd';
      case 3:
        return 'rd';
      default:
        return 'th';
    }
  };
  return `${day}${getOrdinalSuffix(day)} ${month} ${year}`;
});

// Mock data for notifications
const notifications = ref([
  { message: 'You have a new message from Dr. Alice Smith' },
  { message: 'Your paper "AI and Ethics" has been downloaded 5 times' },
  { message: 'You have a new follower: Dr. Bob Brown' },
]);

// Handle dropdown commands (click event for individual notifications)
const handleNotificationCommand = (notification) => {
  console.log('Notification clicked:', notification);
};
// Navigate to home route
const goHome = () => {
  emit('goHome','Home');
  console.log('Go Home');
};

onMounted(() => {
  fetchUsers();
});
</script>


<style scoped>
.schedule-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
}
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
.after-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
    flex-direction: column;
}


.actions {
  margin-left: 30px;
  align-self: flex-start;
}

.admin-schedule {
  padding: 20px;
  background-color: #f0f4f8; /* Light background for the container */
}

.custom-add-user-btn {
  background-color: #3498db; /* 蓝色背景 */
  border-radius: 30px; /* 圆角按钮 */
  font-size: 16px; /* 调整文字大小 */
  font-weight: bold; /* 加粗文字 */
  padding: 10px 25px; /* 增加按钮的填充空间 */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* 添加轻微阴影 */
  transition: all 0.3s ease; /* 添加过渡动画 */
}
.custom-column{
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-content: center;
}
.custom-add-user-btn:hover {
  background-color: #217dbb; /* 鼠标悬停变为深蓝色 */
  transform: translateY(-2px); /* 提升效果 */
}

.custom-add-user-btn:focus {
  outline: none; /* 去除聚焦边框 */
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.2); /* 聚焦时阴影加深 */
}

.table {
  margin-left: 30px;
  margin-top: 20px;
}
/* 优化表格样式 */
.custom-table {
  border-radius: 10px; /* 圆角设计 */
  overflow: hidden; /* 隐藏溢出部分 */
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); /* 添加阴影效果 */
  background-color: #ffffff; /* 白色背景 */

  width: 100%;
}

/* 表头优化 */
.el-table th {
  background-color: #3498db; /* 蓝色背景 */
  color: #ffffff; /* 白色文字 */
  font-size: 14px; /* 表头字体大小 */
  font-weight: bold; /* 表头加粗 */
  text-align: center; /* 居中显示 */
}

/* 表格行优化 */
.el-table td {
  font-size: 14px;
  color: #333; /* 字体颜色 */
  background-color: #f9f9f9; /* 浅灰色背景 */
}

/* 表格悬停效果 */
.el-table .el-table__row:hover td {
  background-color: #eef6fc; /* 悬停时的浅蓝色 */
}

/* 角色标签优化 */
.custom-role-tag {
  font-size: 12px;
  border-radius: 5px;
  padding: 5px 10px;
}

/* 操作按钮优化 */
.custom-action-btn {
  border-radius: 20px; /* 圆角设计 */
  background-color: #3498db; /* 主色调蓝色 */
  color: white; /* 白色文字 */
  width: 60%;
}

.custom-action-btn:hover {
  background-color: #217dbb; /* 深蓝色悬停效果 */
}

.custom-delete-btn {
  border-radius: 20px; /* 圆角设计 */
  background-color: #e74c3c; /* 红色背景 */
  color: white; /* 白色文字 */
  width: 60%;
}
.el-button+.el-button {
     margin-left: 0px;
}
.custom-delete-btn:hover {
  background-color: #c0392b; /* 深红色悬停效果 */
}
/* 分页 */
.custom-pagination {
  margin-top: 20px;
}
/* 自定义弹窗样式 */
.custom-dialog {
  border-radius: 15px; /* 圆角设计 */
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2); /* 增加阴影 */
}

.dialog-header {
  text-align: center;
  padding-bottom: 10px;
  border-bottom: 1px solid #eaeaea; /* 底部边框分割 */
  margin-bottom: 20px;
}

.dialog-header h2 {
  font-size: 24px; /* 加大标题字体 */
  font-weight: bold;
  color: #3498db; /* 标题颜色 */
  margin: 0;
}
/* 表单间距调整 */
.form-item {
  margin-bottom: 20px;
}

/* 按钮样式优化 */
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 20px;
  margin-top: 20px;
}

.submit-btn {
  background-color: #3498db;
  color: white;
  border-radius: 20px;
  padding: 10px 20px;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.3s ease;
}

.submit-btn:hover {
  background-color: #217dbb;
  transform: translateY(-2px);
}

.cancel-btn {
  background-color: #e74c3c;
  color: white;
  border-radius: 20px;
  padding: 10px 20px;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  background-color: #c0392b;
}

.search-bar {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.custom-search-input {
  width: 300px; /* 搜索框宽度 */
  border-radius: 20px; /* 圆角设计 */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* 添加阴影 */
  transition: all 0.3s ease; /* 动画过渡效果 */
}

.custom-search-input .el-input__inner {
  height: 40px; /* 调整搜索框高度 */
  font-size: 14px;
  padding: 0 20px; /* 内边距 */
}

.custom-search-input .el-input__inner:focus {
  border-color: #3498db; /* 聚焦时高亮 */
  box-shadow: 0 0 5px rgba(52, 152, 219, 0.5);
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
  position: relative;
}

/* 表单项间距调整 */
.form-item {
  margin-bottom: 20px;
}

/* 自定义输入框 */
.custom-input .el-input__inner {
  border-radius: 10px; /* 圆角输入框 */
  border: 1px solid #dcdfe6;
  padding: 12px 16px;
  font-size: 14px; /* 优雅字体大小 */
}

.custom-input .el-input__inner:focus {
  border-color: #3498db; /* 聚焦时高亮 */
  box-shadow: 0 0 5px rgba(52, 152, 219, 0.5);
}

/* 输入框和上传按钮布局 */
.form-item {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  margin-bottom: 20px;
}

/* 按钮样式 */
.submit-btn {
  background-color: #3498db;
  color: white;
  border-radius: 20px;
  padding: 10px 20px;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.3s ease;
}

.submit-btn:hover {
  background-color: #217dbb;
  transform: translateY(-2px);
}

.cancel-btn {
  background-color: #e74c3c;
  color: white;
  border-radius: 20px;
  padding: 10px 20px;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  background-color: #c0392b;
}

/* 弹窗样式 */
.custom-dialog {
  border-radius: 15px; /* 圆角设计 */
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2); /* 增加阴影 */
}

/* 弹窗标题样式 */
.dialog-header {
  text-align: center;
  padding-bottom: 10px;
  border-bottom: 1px solid #eaeaea; /* 底部边框分割 */
  margin-bottom: 20px;
}

.dialog-header h2 {
  font-size: 24px; /* 加大标题字体 */
  font-weight: bold;
  color: #3498db; /* 标题颜色 */
  margin: 0;
}

.el-switch {
  margin-left: auto; /* 控制开关与文字的对齐 */
}
.form-item {
  display: flex;
  align-items: center; /* 垂直居中 */
  justify-content: flex-start; /* 水平对齐 */
  gap: 10px; /* 调整标题与控件之间的间距 */
  margin-bottom: 20px; /* 控制整体间距 */
}
</style>