<template>
  <div class="main-container">
    <div class="header-container">
      <div class="header-left">
        <div class="overview-title">
          <span>Overview</span>
        </div>
        <div class="formatted-date">
          <span>{{ formattedDate }}</span>
        </div>
      </div>
      <div class="header-right">
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

    <div class="content-container">
      <!-- Left Main Content -->
      <div class="left-content">
        <div class="info-card-container">
          <el-row :gutter="25" class="card-row">
            <el-col :span="8">
              <el-card class="statistic-card" shadow="hover">
                <template #header>
                  <div class="card-header">最近发表的论文数</div>
                </template>
                <div class="card-content">
                  <p>本月共发表论文数：12</p>
                </div>
              </el-card>
            </el-col>

            <el-col :span="8">
              <el-card class="statistic-card" shadow="hover">
                <template #header>
                  <div class="card-header">最近发表的著作数</div>
                </template>
                <div class="card-content">
                  <p>本月共发表著作数：5</p>
                </div>
              </el-card>
            </el-col>

            <el-col :span="8">
              <el-card class="statistic-card" shadow="hover">
                <template #header>
                  <div class="card-header">最近借阅的图书数</div>
                </template>
                <div class="card-content">
                  <p>本月共借阅图书数：30</p>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>

        <!-- Published Papers Section -->
        <div class="info-card-container">
          <div class="published-section">
            <el-card class="paper-card" shadow="hover" body-style="padding: 8px">
                <div class="card-header centered" > 
                  <h3>Published Papers</h3>
                </div>
              <div class="table-container">
                <table class="paper-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Author</th>
                      <th>Link</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(paper, index) in papers" :key="index">
                      <td>{{ paper.title }}</td>
                      <td>{{ paper.author }}</td>
                      <td><a :href="paper.link" target="_blank">View Paper</a></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </el-card>
          </div>
        </div>

        <!-- Published Books Section -->
        <div class="info-card-container">
          <div class="published-section">
            <el-card class="paper-card" shadow="hover" body-style="padding: 8px">
                <div class="card-header centered">
                  <h3>Published Books</h3>
                </div>
              <div class="table-container">
                <table class="paper-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Author</th>
                      <th>Link</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(paper, index) in papers" :key="index">
                      <td>{{ paper.title }}</td>
                      <td>{{ paper.author }}</td>
                      <td><a :href="paper.link" target="_blank">View Paper</a></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </el-card>
          </div>
        </div>
      </div>

      <!-- Right Main Content -->
      <div class="right-content">
        <el-card class="user-info-card" shadow="hover">
            <div class="avatar-container">
              <el-avatar class="user-avatar" :src="iconUrl" size="100" shape="circle"></el-avatar>
            </div>
          <h3 class="user-name">{{ userName }}</h3>
          <div class="user-stats">
            <div class="stat">
              <span class="stat-number">{{ productCount }}</span>
              <span class="stat-label">Download</span>
            </div>
            <div class="divider"></div>
            <div class="stat">
              <span class="stat-number">{{ experience }}</span>
              <span class="stat-label">Upload</span>
            </div>
            <div class="divider"></div>
            <div class="stat">
              <span class="stat-number">{{ rating }}</span>
              <span class="stat-label">Rating</span>
            </div>
          </div>
        </el-card>

        <el-card class="recent-downloads-card" shadow="hover">
          <template #header>
            <h3 class="card-title">Recent Downloads</h3>
          </template>
          <ul class="download-list">
            <li v-for="(item, index) in recentDownloads" :key="index" class="download-item">
              <span class="item-title">{{ item.title }}</span>
              <span class="item-type">{{ item.type }}</span>
              <span class="download-date">{{ item.date }}</span>
            </li>
          </ul>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { Message } from '@element-plus/icons-vue';

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

// Mock data for published papers
const papers = ref([
  { title: 'Deep Learning in Medical Imaging', author: 'Dr. Alice Smith', link: 'https://example.com/paper1' },
  { title: 'Natural Language Processing Trends', author: 'Dr. Bob Brown', link: 'https://example.com/paper2' },
  { title: 'AI and Ethics', author: 'Dr. Charlie Johnson', link: 'https://example.com/paper3' },
  { title: 'Quantum Computing Basics', author: 'Dr. Eve Green', link: 'https://example.com/paper4' },
  { title: 'Blockchain and Security', author: 'Dr. Frank White', link: 'https://example.com/paper5' },
  { title: 'Robotics in Agriculture', author: 'Dr. Grace Black', link: 'https://example.com/paper6' },
  { title: 'Augmented Reality Applications', author: 'Dr. Henry Gold', link: 'https://example.com/paper7' },
  { title: 'Advances in Data Science', author: 'Dr. Ivy Blue', link: 'https://example.com/paper8' },
]);

// User information data
const iconUrl = 'https://path-to-your-icon.png';
const userName = 'Odeon Mart';
const productCount = 400;
const experience = 12;
const rating = 4.8;

// Mock data for recent downloads
const recentDownloads = ref([
  { title: 'Deep Learning in Medical Imaging', type: 'Paper', date: '2023-11-01' },
  { title: 'AI and Ethics', type: 'Book', date: '2023-10-29' },
  { title: 'Natural Language Processing Trends', type: 'Paper', date: '2023-10-25' },
  { title: 'Quantum Computing Basics', type: 'Book', date: '2023-10-20' },
  { title: 'Blockchain and Security', type: 'Paper', date: '2023-10-15' },
  { title: 'Robotics in Agriculture', type: 'Paper', date: '2023-10-10' },
  { title: 'Augmented Reality Applications', type: 'Book', date: '2023-10-05' },
]);
</script>

<style scoped>
/* ========================
  Layout Styles
======================== */
.main-container {
  display: flex;
  flex-direction: column;
  width: 100%;
}
.header-container {
  width: 100%;
  height: 64px;
  margin-top: 40px;
  display: flex;
  flex-direction: row;
}
.content-container {
  display: flex;
  flex-direction: row;
}
.left-content {
  width: 65%;
  display: flex;
  flex-direction: column;
}
.right-content {
  width: 35%;
  display: flex;
  flex-direction: column;
  margin-right: 10px;
}

/* ========================
  Header Styles
======================== */
.header-left {
  margin-left: 40px;
  display: flex;
  flex-direction: column;
}
.overview-title {
  font-size: 24px;
  font-weight: 600;
  color: rgba(51, 51, 51, 1);
  text-align: left;
}
.formatted-date {
  margin-top: 10px;
  font-size: 14px;
  color: rgba(51, 51, 51, 0.71);
  text-align: left;
}
.header-right {
  margin-right: 40px;
  margin-left: auto;
  display: flex;
  flex-direction: row;
  align-items: center;
}
.notification-badge {
  width: 40px;
  height: 100%;
}
.user-avatar {
  width: 80px;
  height: 80px;
  margin-left: auto;
  margin-right: auto;
}

/* ========================
  Card Styles
======================== */
.info-card-container {
  width: 100%;
  display: flex;
  flex-direction: row;
  margin-top: 25px;
}
.card-row {
  width: 100%;
  padding: 20px 40px;
}
.statistic-card {
  border-radius: 8px;
}
.card-header {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}
.card-content {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}
.published-section {
  padding: 20px 40px;
  width: 100%;
}
.paper-card {
  border-radius: 12px;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
  background-color: #fff;
}
.centered {
  text-align: center;
}

/* ========================
  Table Styles
======================== */
.table-container {
  max-height: 200px;
  overflow-y: auto;
  border-radius: 8px;
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
.paper-table a {
  color: #0066cc;
  font-weight: 500;
  text-decoration: none;
}
.paper-table a:hover {
  color: #004a99;
  text-decoration: underline;
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

/* ========================
  User Card Styles
======================== */
.user-info-card {
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  background-color: #ffffff;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);
}
.avatar-container {
  display: flex;
  justify-content: center;
  flex-direction: row;
  margin-bottom: 10px;
}
.user-name {
  font-size: 20px;
  font-weight: bold;
  color: #333333;
  margin: 10px 0;
}
.user-stats {
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin-top: 55px;
}
.stat {
  text-align: center;
}
.stat-number {
  font-size: 18px;
  font-weight: bold;
  color: #333333;
  display: block;
}
.stat-label {
  font-size: 14px;
  color: #888888;
  display: block;
  margin-top: 4px;
}
.divider {
  width: 1px;
  height: 24px;
  background-color: #e0e0e0;
}

/* ========================
  Recent Downloads Styles
======================== */
.recent-downloads-card {
  margin-top: 20px;
  padding: 20px;
  max-height: 400px;
  border-radius: 10px;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);
  background-color: #ffffff;
  margin-right: 10px;
  width: 90%;
}
.card-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}
.download-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.download-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}
.download-item:last-child {
  border-bottom: none;
}
.item-title {
  font-weight: 500;
  color: #333;
  max-width: 140px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}
.item-type {
  font-size: 12px;
  color: #888;
  margin-left: 10px;
  flex-shrink: 0;
}
.download-date {
  font-size: 12px;
  color: #666;
  margin-left: 10px;
  flex-shrink: 0;
}
</style>
