<template>
  <div class="admin-schedule">
    <h2>管理员界面 - 用户管理</h2>

    <!-- 用户管理功能区 -->
    <div class="actions">
      <button @click="addUser">添加用户</button>
    </div>

    <!-- 用户列表 -->
    <table class="user-table">
      <thead>
        <tr>
          <th>用户名</th>
          <th>邮箱</th>
          <th>角色</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id">
          <td>{{ user.username }}</td>
          <td>{{ user.email }}</td>
          <td>{{ user.isAdmin ? '管理员' : '普通用户' }}</td>
          <td>
            <button @click="toggleAdmin(user)">
              {{ user.isAdmin ? '降为普通用户' : '提升为管理员' }}
            </button>
            <button @click="deleteUser(user.id)">删除用户</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- 添加用户弹窗 -->
    <div v-if="showAddUserModal" class="modal">
      <div class="modal-content">
        <h3>添加新用户</h3>
        <form @submit.prevent="submitNewUser">
          <div>
            <label for="username">用户名</label>
            <input type="text" v-model="newUser.username" id="username" required />
          </div>
          <div>
            <label for="email">邮箱</label>
            <input type="email" v-model="newUser.email" id="email" required />
          </div>
          <div>
            <label for="password">密码</label>
            <input type="password" v-model="newUser.password" id="password" required />
          </div>
          <div>
            <button type="submit">提交</button>
            <button type="button" @click="closeAddUserModal">取消</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, Ref } from 'vue';

// 用户数据接口
interface User {
  id: number;
  username: string;
  email: string;
  isAdmin: boolean;
}

// 新用户数据接口
interface NewUser {
  username: string;
  email: string;
  password: string;
}

export default {
  name: 'AdminSchedule',
  setup() {
    // 用户列表数据
    const users: Ref<User[]> = ref([
      { id: 1, username: 'Alice', email: 'alice@example.com', isAdmin: false },
      { id: 2, username: 'Bob', email: 'bob@example.com', isAdmin: true },
      { id: 3, username: 'Charlie', email: 'charlie@example.com', isAdmin: false },
    ]);

    // 新用户数据
    const newUser: Ref<NewUser> = ref({
      username: '',
      email: '',
      password: '',
    });

    // 控制弹窗的显示
    const showAddUserModal: Ref<boolean> = ref(false);

    // 显示添加用户弹窗
    const addUser = (): void => {
      showAddUserModal.value = true;
    };

    // 关闭添加用户弹窗
    const closeAddUserModal = (): void => {
      showAddUserModal.value = false;
    };

    // 提交新用户
    const submitNewUser = (): void => {
      const newId = users.value.length
        ? Math.max(...users.value.map((user) => user.id)) + 1
        : 1; // 确保 ID 唯一
      users.value.push({
        id: newId,
        username: newUser.value.username,
        email: newUser.value.email,
        isAdmin: false,
      });
      newUser.value = { username: '', email: '', password: '' }; // 清空表单
      closeAddUserModal();
    };

    // 删除用户
    const deleteUser = (userId: number): void => {
      users.value = users.value.filter((user) => user.id !== userId);
    };

    // 切换管理员权限
    const toggleAdmin = (user: User): void => {
      user.isAdmin = !user.isAdmin;
    };

    return {
      users,
      newUser,
      showAddUserModal,
      addUser,
      closeAddUserModal,
      submitNewUser,
      deleteUser,
      toggleAdmin,
    };
  },
};
</script>

<style scoped>
.admin-schedule {
  padding: 20px;
  background-color: #f0f4f8;
}

.actions button,
button {
  padding: 5px 10px;
  margin-right: 10px;
  cursor: pointer;
  background-color: #1565c0;
  color: white;
  border: none;
  border-radius: 5px;
}

.actions button:hover,
button:hover {
  background-color: #0d47a1;
}

.user-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.user-table th,
.user-table td {
  padding: 10px;
  border: 1px solid #ddd;
  text-align: left;
}

.user-table th {
  background-color: #1565c0;
  color: white;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: #fff;
  padding: 20px;
  border-radius: 5px;
  width: 400px;
}

input {
  width: 100%;
  padding: 8px;
  margin: 10px 0;
  border: 1px solid #ddd;
  border-radius: 5px;
}
</style>
