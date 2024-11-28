import { defineStore } from 'pinia';
import { ref, watch, onMounted, onUnmounted } from 'vue';
import axios from 'axios';

export const useUserStore = defineStore('user', () => {
  // 用户状态
  const authToken = ref<string>(localStorage.getItem('authToken') || '');
  const user = ref<{ username: string; avatar: string; useremail:String; Role:number}>({
    username: 'Unknown',
    avatar: '/static/Group 2210.png',
    useremail:'',
    Role:1
  });

  // 定时刷新用户信息
  let refreshIntervalId: number | null = null;

  // 登录逻辑
  const login = async (username: string, password: string) => {
    try {
      const response = await axios.post('/user/login', {
        username,
        password_hash: password,
      });
      const token = response.data; // 后端返回 Token
      authToken.value = token;
      localStorage.setItem('authToken', token);

      await fetchUserInfo(); // 登录成功后获取用户信息
    } catch (error) {
      console.error('登录失败:', error);
      throw error;
    }
  };

  // 注销逻辑
  const logout = () => {
    authToken.value = '';
    localStorage.removeItem('authToken');
    user.value.username = 'Unknown';
    user.value.avatar = '/static/Group 2210.png';
    stopRefreshing(); // 停止定时刷新
  };

  // 获取用户信息
  const fetchUserInfo = async () => {
    if (!authToken.value) {
      console.warn('未登录，无法获取用户信息');
      return;
    }
  
    try {
      // 获取用户基本信息
      const response = await axios.get('/user/info', {
        headers: {
          Authorization: `Bearer ${authToken.value}`,
        },
      });
  
      // 更新用户名
      user.value.username = response.data.username;
      user.value.useremail = response.data.email;
      user.value.Role = response.data.role;
  
      // 异步获取用户头像图像
      const imagePath = response.data.image; // 从用户信息中获取图像路径
      if (imagePath) {
        try {
          const imageResponse = await axios.get('/user/imagefile', {
            params: { image_path: imagePath }, // 向 /user/imagefile 发送请求
            responseType: 'blob', // 指定返回 Blob 数据
          });
  
          // 包装 Blob 为 URL 并更新 avatar
          const imageBlob = imageResponse.data;
          user.value.avatar = URL.createObjectURL(imageBlob); // 创建临时 URL
        } catch (imageError) {
          console.error('获取用户头像失败:', imageError);
          user.value.avatar = ''; // 图像请求失败时处理
        }
      } else {
        user.value.avatar = ''; // 如果没有图像路径，则清空 avatar
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
      user.value.username = 'Unknown';
      user.value.avatar = '';
    }
  };
  

  // 定时刷新逻辑
  const startRefreshing = () => {
    stopRefreshing(); // 清理已有的定时器
    refreshIntervalId = window.setInterval(() => {
      console.log('定时刷新用户信息...');
      fetchUserInfo();
    }, 6000000); // 每 100 分钟刷新
  };

  const stopRefreshing = () => {
    if (refreshIntervalId) {
      clearInterval(refreshIntervalId);
      refreshIntervalId = null;
    }
  };

  // 监听 authToken 的变化
  watch(authToken, (newToken) => {
    console.log('Token 更新:', newToken);
    if (newToken) {
      fetchUserInfo();
      startRefreshing();
    } else {
      stopRefreshing();
      user.value.username = 'Unknown';
      user.value.avatar = '/static/Group 2210.png';
    }
  });

  // 生命周期管理
  onMounted(() => {
    if (authToken.value) {
      fetchUserInfo();
      startRefreshing();
    }
  });

  onUnmounted(() => {
    stopRefreshing();
  });

  return {
    authToken,
    user,
    login,
    logout,
    fetchUserInfo,
    startRefreshing,
    stopRefreshing,
  };
});
