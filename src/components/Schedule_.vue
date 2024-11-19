<template>
    <div class="schedule-container">
      <!-- Header -->
      <div class="header-container">
        <div class="header-left">
          <div class="overview-title">
            <span>图书管理</span>
          </div>
          <div class="formatted-date">
            <span>{{ formattedDate }}</span>
          </div>
        </div>
        <div class="header-right">
          <el-button type="primary" :icon="House" circle size="large"  />
          <el-dropdown trigger="click" @command="handleNotificationCommand">
            <span class="el-dropdown-link">
              <el-badge is-dot class="notification-badge" :offset="[-5, 1]">
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
  
      <!-- 图书借阅审核 -->
      <div class="info-card-container">
        <div class="published-section">
          <el-card class="paper-card" shadow="hover" body-style="padding: 8px">
            <div class="card-header centered">
              <h3>图书借阅审核</h3>
            </div>
            <div class="table-container">
              <table class="paper-table">
                <thead>
                  <tr>
                    <th>图书名称</th>
                    <th>作者</th>
                    <th>借阅者</th>
                    <th>状态</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(request, index) in borrowRequests" :key="index">
                    <td>{{ request.title }}</td>
                    <td>{{ request.author }}</td>
                    <td>{{ request.user }}</td>
                    <td>{{ request.status }}</td>
                    <td>
                      <el-button
                        size="small"
                        type="success"
                        @click="approveBorrow(request)"
                        :disabled="request.status === '已批准'"
                      >批准借阅</el-button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </el-card>
        </div>
      </div>
  
      <!-- 图书归还审核 -->
      <div class="info-card-container">
        <div class="published-section">
          <el-card class="paper-card" shadow="hover" body-style="padding: 8px">
            <div class="card-header centered">
              <h3>图书归还审核</h3>
            </div>
            <div class="table-container">
              <table class="paper-table">
                <thead>
                  <tr>
                    <th>图书名称</th>
                    <th>作者</th>
                    <th>归还者</th>
                    <th>状态</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(request, index) in returnRequests" :key="index">
                    <td>{{ request.title }}</td>
                    <td>{{ request.author }}</td>
                    <td>{{ request.user }}</td>
                    <td>{{ request.status }}</td>
                    <td>
                      <el-button
                        size="small"
                        type="primary"
                        @click="confirmReturn(request)"
                        :disabled="request.status === '已归还'"
                      >确认归还</el-button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </el-card>
        </div>
      </div>
  
      <!-- 上传文件确认 -->
      <div class="info-card-container">
        <div class="published-section">
          <el-card class="paper-card" shadow="hover" body-style="padding: 8px">
            <div class="card-header centered">
              <h3>上传文件确认</h3>
            </div>
            <div class="table-container">
              <table class="paper-table">
                <thead>
                  <tr>
                    <th>文件名称</th>
                    <th>上传者</th>
                    <th>状态</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(file, index) in fileUploads" :key="index">
                    <td>{{ file.fileName }}</td>
                    <td>{{ file.uploader }}</td>
                    <td>{{ file.status }}</td>
                    <td>
                      <el-button
                        size="small"
                        type="info"
                        @click="confirmFile(file)"
                        :disabled="file.status === '已确认'"
                      >确认文件</el-button>
                      <el-button
                        size="small"
                        type="primary"
                        @click="viewFileDetails(file)"
                      >查看详情</el-button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </el-card>
        </div>
      </div>
    </div>
  </template>
  
  <script lang="ts" setup>
  import { ref, computed } from 'vue';
  import { Message, House } from '@element-plus/icons-vue';
  
  // Mock data for borrow requests with index for initial order
  const borrowRequests = ref([
    { index: 0, title: 'Machine Learning Basics', author: 'Alice Smith', user: 'Alice', status: '待批准' },
    { index: 1, title: 'Deep Learning Advanced', author: 'Bob Brown', user: 'Bob', status: '待批准' },
    { index: 2, title: 'Natural Language Processing', author: 'Carol White', user: 'Carol', status: '待批准' },
    { index: 3, title: 'AI Ethics and Society', author: 'Dan Black', user: 'Dan', status: '待批准' },
    { index: 4, title: 'Quantum Computing Essentials', author: 'Eve Johnson', user: 'Eve', status: '待批准' },
    { index: 5, title: 'Introduction to Robotics', author: 'Frank Green', user: 'Frank', status: '待批准' },
    { index: 6, title: 'Augmented Reality Applications', author: 'Grace Blue', user: 'Grace', status: '待批准' }
  ]);
  // 模拟通知数据
const notifications = ref([
  { message: '您有一条新消息：Dr. Alice Smith' },
  { message: '您的论文《AI与伦理》已被下载5次' },
  { message: '新粉丝：Dr. Bob Brown关注了您' },
]);

// 处理通知点击事件
const handleNotificationCommand = (notification) => {
  console.log('Notification clicked:', notification);
};
  // Mock data for return requests with index for initial order
  const returnRequests = ref([
    { index: 0, title: 'AI in Healthcare', author: 'Alice Green', user: 'Alice', status: '待归还' },
    { index: 1, title: 'Cybersecurity Basics', author: 'Bob White', user: 'Bob', status: '待归还' },
    { index: 2, title: 'Machine Vision', author: 'Charlie Black', user: 'Charlie', status: '待归还' },
    { index: 3, title: 'Data Science Fundamentals', author: 'Diana Brown', user: 'Diana', status: '待归还' },
    { index: 4, title: 'Blockchain for Beginners', author: 'Edward Johnson', user: 'Edward', status: '待归还' },
    { index: 5, title: 'Digital Transformation', author: 'Fiona White', user: 'Fiona', status: '待归还' },
    { index: 6, title: 'IoT in Smart Cities', author: 'George Grey', user: 'George', status: '待归还' },
    { index: 7, title: 'IoT in Smart Cities', author: 'George Grey', user: 'George', status: '待归还' },
    { index: 8, title: 'IoT in Smart Cities', author: 'George Grey', user: 'George', status: '待归还' }
  ]);
  
  // Mock data for file uploads with index for initial order
  const fileUploads = ref([
    { index: 0, fileName: 'Research_Paper_1.pdf', uploader: 'Alice', status: '待确认' },
    { index: 1, fileName: 'AI_Thesis_Final.pdf', uploader: 'Bob', status: '待确认' },
    { index: 2, fileName: 'ML_Report_Spring2024.docx', uploader: 'Carol', status: '待确认' },
    { index: 3, fileName: 'NLP_Conference_Presentation.pptx', uploader: 'Dan', status: '待确认' },
    { index: 4, fileName: 'Quantum_Physics_Overview.pdf', uploader: 'Eve', status: '待确认' },
    { index: 5, fileName: 'Robotics_Workshop_Notes.pdf', uploader: 'Frank', status: '待确认' },
    { index: 6, fileName: 'AR_Research_Project.pdf', uploader: 'Grace', status: '待确认' }
  ]);
  
  const formattedDate = computed(() => {
    const currentDate = new Date();
    const day = currentDate.getDate();
    const month = currentDate.toLocaleString('zh-CN', { month: 'long' });
    const year = currentDate.getFullYear();
    return `${year}年${month}${day}日`;
  });
  
  // 排序函数，已批准/已归还/已确认的条目排到最下面，同时按 index 保持原始顺序
  const sortEntries = () => {
    borrowRequests.value.sort((a, b) => {
      if (a.status === '已批准' && b.status !== '已批准') return 1;
      if (a.status !== '已批准' && b.status === '已批准') return -1;
      return a.index - b.index;
    });
    returnRequests.value.sort((a, b) => {
      if (a.status === '已归还' && b.status !== '已归还') return 1;
      if (a.status !== '已归还' && b.status === '已归还') return -1;
      return a.index - b.index;
    });
    fileUploads.value.sort((a, b) => {
      if (a.status === '已确认' && b.status !== '已确认') return 1;
      if (a.status !== '已确认' && b.status === '已确认') return -1;
      return a.index - b.index;
    });
  };
  
  // 更新状态并排序
  const approveBorrow = (request) => {
    request.status = '已批准';
    sortEntries();
  };
  
  const confirmReturn = (request) => {
    request.status = '已归还';
    sortEntries();
  };
  
  const confirmFile = (file) => {
    file.status = '已确认';
    sortEntries();
  };
  
  const viewFileDetails = (file) => {
    console.log('查看文件详情:', file.fileName);
  };
  
  // 初始排序
  sortEntries();
  </script>
  
  <style scoped>
  .schedule-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
    width: 95%;
    padding: 20px;
    margin: 0 auto;
  }
  
  .header-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .header-left {
    display: flex;
    flex-direction: column;
  }
  
  .overview-title {
    font-size: 24px;
    font-weight: bold;
    color: #333;
  }
  
  .formatted-date {
    font-size: 14px;
    color: #777;
  }

  .header-right {
  display: flex;
  align-items: center;
  gap: 15px;
}
  
  .info-card-container {
    margin-top: 25px;
    width: 100%;
  }
  
  .published-section {
    padding: 20px 20px;
    width: 100%;
  }
  
  .paper-card {
    border-radius: 12px;
    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
    background-color: #fff;
    min-height: 400px;
  }
  
  .card-header {
    font-size: 18px;
    font-weight: bold;
    text-align: center;
    color: #333;
  }
  
  .table-container {
    max-height: 400px;
    overflow-y: auto;
    border-radius: 8px;
    width: 100%;
  }
  
  .paper-table {
    width: 100%;
    border-collapse: collapse;
  }
  
  .paper-table th,
  .paper-table td {
    padding: 10px;
    text-align: left;
  }
  
  .paper-table th {
    background-color: #007bff;
    color: white;
    font-weight: 600;
    position: sticky;
    top: 0;
  }
  
  .paper-table td {
    color: #333;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .paper-table tr:nth-child(even) {
    background-color: #f9f9f9;
  }
  
  .table-container::-webkit-scrollbar {
    width: 8px;
  }
  
  .table-container::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
  }
  
  .table-container::-webkit-scrollbar-track {
    background-color: #f0f0f0;
  }
  </style>