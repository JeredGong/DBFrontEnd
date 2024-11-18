<template>
    <div class="schedule-container">

        <div class="header-container">
            <div class="header-left">
                <div class="overview-title">
                    <span>图书借阅系统</span>
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
            <!--Search1-->
            <div class="Search1">
                <el-input 
                    v-model="borrowSearchQuery"
                    placeholder="输入以查询书目"
                    clearable
                    :prefix-icon="Search"
                    class="search-input"
                ></el-input>
            </div>

            <!--Return Button-->
            <div class="Return">
                <el-button type="primary" @click="borrowDialogVisible = true">查看已借阅书目</el-button>
            </div>
        </div>

        <!--Borrow Table-->
        <div class="borrow-table">
            <el-table :data="filteredAvailableBooks" style="width: 100%; display: flex; justify-content: space-between;">
                <el-table-column type="selection" width="55"></el-table-column>
                <el-table-column prop="title" label="书名" width="300"></el-table-column>
                <el-table-column prop="author" label="作者" width="300"></el-table-column>
                <el-table-column prop="publishDate" label="出版日期" width="300" sortable></el-table-column>
                <el-table-column label="Actions">
                    <template v-slot="scope">
                        <el-button type="primary" @click="borrowBook(scope.row)">借阅</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <el-pagination
                background
                layout="prev, pager, next"
                :total="totalAvailableBooks"
                :page-size="availablePageSize"
                v-model:current-page="availableCurrentPage"
                @current-change="handleAvailablePageChange"
                class="pagination-center"
            ></el-pagination>
        </div>
    </div>


    <el-dialog v-model="borrowDialogVisible" title="Borrowed Book" width="1150" :visible.sync="borrowDialogVisible">
            <el-input v-model="searchQuery" placeholder="查询已借阅的图书" class="search-input" clearable :prefix-icon="Search"/>
            <el-table :data="filteredBooks" style="width: 100%">
                <el-table-column prop="title" label="书名" width="200"></el-table-column>
                <el-table-column prop="author" label="作者" width="200"></el-table-column>
                <el-table-column prop="publishDate" label="出版日期" width="200" sortable></el-table-column>
                <el-table-column prop="borrowDate" label="借阅日期" width="200" sortable></el-table-column>
                <el-table-column label="Actions">
                    <template v-slot="scope">
                        <el-button type="primary" @click="returnBook(scope.row)">归还</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <el-pagination
                background
                layout="prev, pager, next"
                :total="totalBooks"
                :page-size="pageSize"
                v-model:current-page="currentPage"
                @current-change="handlePageChange"
                class="pagination-center"
            ></el-pagination>
    </el-dialog>


</template>



<script lang="ts" setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { Message, House, Search } from '@element-plus/icons-vue';

// Navigate to home route
const goHome = () => {
  router.push('/');
};

// Initialize router
const router = useRouter();
interface Document {
  title: string;
  type: string;
  author: string;
  publishDate: string;
  // 其他属性
}

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

const searchQuery = ref('');
const borrowDialogVisible = ref(false);
const borrowSearchQuery = ref('');
const currentPage = ref(1);
const pageSize = ref(10);
const availableCurrentPage = ref(1);
const availablePageSize = ref(10);

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

// Handle dropdown commands (click event for individual notifications)
const handleNotificationCommand = (notification) => {
  console.log('Notification clicked:', notification);
  console.log('Selected rows:', selectedRows.value);
  return selectedRows
};

const borrowedBooks = ref([
    { title: 'Book 1', author: 'Author 1', publishDate: '2020-01-01', borrowDate: '2023-01-01' },
    { title: 'Book 2', author: 'Author 2', publishDate: '2019-01-01', borrowDate: '2023-02-01' },
    // Add more borrowed books here
]);

const availableBooks = ref([
    { title: 'Book A', author: 'Author A', publishDate: '2021-01-01' },
    { title: 'Book B', author: 'Author B', publishDate: '2018-01-01' },
    // Add more available books here
]);

const filteredBooks = computed(() => {
    return borrowedBooks.value.filter(book => book.title.toLowerCase().includes(searchQuery.value.toLowerCase()));
});

const filteredAvailableBooks = computed(() => {
    return availableBooks.value.filter(book => book.title.toLowerCase().includes(borrowSearchQuery.value.toLowerCase()));
});

const totalBooks = computed(() => filteredBooks.value.length);
const totalAvailableBooks = computed(() => filteredAvailableBooks.value.length);

const handlePageChange = (page) => {
    currentPage.value = page;
};

const handleAvailablePageChange = (page) => {
    availableCurrentPage.value = page;
};

const returnBook = (book) => {
    borrowedBooks.value = borrowedBooks.value.filter(b => b !== book);
    borrowDialogVisible.value = false;
    Message.success('Book returned successfully');
};

const borrowBook = (book) => {
    borrowedBooks.value.push({ ...book, borrowDate: new Date().toISOString().split('T')[0] });
    Message.success('Book borrowed successfully');
};



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


.search-input {
    width: 400px;
}

.pagination-center {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.after-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
}

.Search1 {
  width: 96.7%;
  display: flex;
  justify-content: left;
  margin-left: 20px;
  margin-right: 20px;
  height: 37px;
}

.borrow-table {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-left: 20px;
  margin-right: 20px;
}

.Return {
  display: flex;
  justify-content: right;
  margin-left: 20px;
  margin-right: 20px;
  height: 37px;
}

</style>

