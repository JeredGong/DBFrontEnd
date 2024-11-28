import { defineStore } from 'pinia';
import { ref, watch, onMounted, onUnmounted } from 'vue';
import axios from 'axios';
axios.defaults.baseURL ='http://localhost:9876'
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
        username:username,
        password_hash: password
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

  // 获取用户基本信息
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

    // 更新用户基本信息
    user.value.username = response.data.username;
    user.value.useremail = response.data.email;
    user.value.Role = response.data.role;

    
  } catch (error) {
    console.error('获取用户信息失败:', error);
    user.value.username = 'Unknown';
    user.value.useremail = '';
    user.value.Role = 1;
  }
  fetchUserAvatar(user.value.username); // 获取用户头像
};

// 获取用户头像
const fetchUserAvatar = async (imagePath) => {
  if (!imagePath) {
    user.value.avatar = '/static/Group 2210.png'; // 如果没有图像路径，则使用默认头像
    return;
  }

  try {
    const imageResponse = await axios.get('/user/image', {
      params: { image_path: imagePath },
      responseType: 'blob', // 返回 Blob 数据
    });

    // 包装 Blob 为 URL 并更新 avatar
    const imageBlob = imageResponse.data;
    user.value.avatar = URL.createObjectURL(imageBlob); // 创建临时 URL
  } catch (imageError) {
    console.error('获取用户头像失败:', imageError);
    user.value.avatar = '/static/Group 2210.png'; // 如果头像请求失败，使用默认头像
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
