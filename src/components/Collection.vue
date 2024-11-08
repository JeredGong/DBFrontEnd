<template>
  <div class="document-search-container">
    <!-- Header -->
    <div class="header-container">
      <div class="header-left">
        <div class="overview-title">
          <span>文档查询系统</span>
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

    <!-- Upload and Download Buttons -->
    <div class="action-buttons">
      <el-button type="primary" :icon="Upload" @click="handleUpload">上传文档</el-button>
      <el-button :type="BatchDowload" :icon="Download" @click="handleBatchDownload">批量下载</el-button>
    </div>

    <!-- Search Bar -->
    <div class="search-bar">
      <el-input
        v-model="searchQuery"
        placeholder="搜索文献或图书"
        clearable
        :prefix-icon="Search"
        @keyup.enter="searchDocuments"
        class="large-rounded-search-input"
      ></el-input>
    </div>

    <!-- Search Results -->
    <div class="search-results">
      <el-table :data="paginatedDocuments" style="width: 100%; display: flex; justify-content: space-between;" :default-sort="{ prop: 'publishDate', order: 'descending' }" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="title" label="标题" width="300"></el-table-column>
        <el-table-column prop="type" label="类型" width="120"></el-table-column>
        <el-table-column prop="author" label="作者" width="180"></el-table-column>
        <el-table-column prop="publishDate" label="出版时间" width="150" sortable></el-table-column>
        <el-table-column label="操作" width="320" align="center" >
          <template #default="scope">
            <div class="action-buttons-group">
              <el-button size="small" type="success" icon="el-icon-download" @click="downloadDocument(scope.row)">下载</el-button>
              <el-button size="small" type="danger" icon="el-icon-delete" @click="deleteDocument(scope.$index)">删除</el-button>
              <el-button size="small" type="warning" icon="el-icon-edit" @click="editDocument(scope.row)">编辑</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <el-pagination
        background
        layout="prev, pager, next"
        :total="filteredDocuments.length"
        :page-size="pageSize"
        v-model:current-page="currentPage"
        @current-change="handlePageChange"
        class="pagination-center"
      ></el-pagination>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { Message, House, Search,Upload,Download} from '@element-plus/icons-vue';

// Initialize router
const router = useRouter();
interface Document {
  title: string;
  type: string;
  author: string;
  publishDate: string;
  // 其他属性
}
const BatchDowload = ref('info');
const selectedRows = ref<Document[]>([]); // 存储选中行的数据
const handleSelectionChange = (rows: Document[]) => {
      selectedRows.value = rows;
      console.log('Selected rows:', selectedRows.value);
      if(selectedRows.value.length > 0){
        BatchDowload.value = 'primary';
      }
      else{
        BatchDowload.value = 'info';
      }
    };

// Mock data for notifications
const notifications = ref([
  { message: 'You have a new message from Dr. Alice Smith' },
  { message: 'Your paper "AI and Ethics" has been downloaded 5 times' },
  { message: 'You have a new follower: Dr. Bob Brown' },
]);
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

// Navigate to home route
const goHome = () => {
  router.push('/');
};

// Handle dropdown commands (click event for individual notifications)
const handleNotificationCommand = (notification) => {
  console.log('Notification clicked:', notification);
  console.log('Selected rows:', selectedRows.value);
  return selectedRows
};

// Mock data for documents
const documents = ref([
  { title: 'Machine Learning Basics', author: 'Alice Smith', publishDate: '2021-05-10', type: 'Book' },
  { title: 'Deep Learning Advanced', author: 'Bob Brown', publishDate: '2022-03-15', type: 'Paper' },
  { title: 'AI in Medicine', author: 'Charlie Johnson', publishDate: '2020-11-25', type: 'Book' },
  // 更多文档数据...
]);

const searchQuery = ref('');
const currentPage = ref(1);
const pageSize = 5;

const filteredDocuments = computed(() => {
  return documents.value.filter((doc) =>
    doc.title.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const paginatedDocuments = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  const end = start + pageSize;
  return filteredDocuments.value.slice(start, end);
});

const handlePageChange = (page) => {
  currentPage.value = page;
};
const handleBatchDownload = () => { 
   // 检查是否有选中的行
   if (selectedRows.value.length > 0) {
     console.log('Batch download:', selectedRows.value);
     
   } else {
     console.log('No rows selected for batch download');
   }
};
const handleUpload = () => console.log('Upload clicked');
const searchDocuments = () => console.log('Search:', searchQuery.value);
const downloadDocument = (doc) => console.log('Download:', doc.title);
const deleteDocument = (index) => documents.value.splice(index, 1);
const editDocument = (doc) => console.log('Edit:', doc.title);

</script>

<style scoped>
.document-search-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
}

.header-container {
  width: 100%;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 40px;
}

.header-left {
  display: flex;
  flex-direction: column;
  margin-left: 40px;
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

.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-right: 20px;
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin-left: 40px;
}

.search-bar {
  width: 96.7%;
  display: flex;
  justify-content: center;
  margin-left: 20px;
  margin-right: 20px;
  height: 37px;
}

.large-rounded-search-input .el-input__inner {
  border-radius: 30px;
  padding: 14px 24px;
  background-color: #f7f9fc;
  border: none;
  font-size: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.large-rounded-search-input .el-input__inner:focus {
  border: none;
  outline: none;
  box-shadow: 0 0 10px rgba(0, 121, 191, 0.2);
}

.search-results {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-left: 20px;
  margin-right: 20px;
}

.el-table th, .el-table td {
  text-align: center;
  vertical-align: middle;
  font-size: 14px;
}

.action-buttons-group {
  display: flex;
  gap: 8px;
  justify-content: space-between
}

.el-button {
  border-radius: 15px;
  padding: 4px 12px;
}

.pagination-center {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>
