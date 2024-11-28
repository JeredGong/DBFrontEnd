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
                <el-button type="primary" @click="showBorrowedBooks">查看已借阅书目</el-button>
            </div>
        </div>

        <!--Borrow Table-->
        <div class="borrow-table">
            <el-table :data="availableBooks" style="width: 100%; display: flex; justify-content: space-between;">
                <el-table-column type="selection" width="55"></el-table-column>
                <el-table-column prop="title" label="书名" width="300"></el-table-column>
                <el-table-column prop="author" label="作者" width="300"></el-table-column>
                <el-table-column prop="publishDate" label="出版日期" width="300" sortable></el-table-column>
                <el-table-column label="操作" align="center">
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


    <el-dialog v-model="borrowDialogVisible" title="您已借阅的书籍" width="1150" :visible.sync="borrowDialogVisible">
            <el-input v-model="searchQuery" placeholder="查询已借阅的图书" class="search-input" clearable :prefix-icon="Search"/>
            <el-table :data="returnBorrowedBooks" style="width: 100%; display: flex; justify-content: space-between;">
                <el-table-column prop="title" label="书名" width="200"></el-table-column>
                <el-table-column prop="author" label="作者" width="200"></el-table-column>
                <el-table-column prop="publishDate" label="出版日期" width="200" sortable></el-table-column>
                <el-table-column prop="borrowedAt" label="借阅日期" width="200" sortable></el-table-column>
                <el-table-column label="操作">
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
import { ref, computed, watch } from 'vue';
import { Message, House, Search } from '@element-plus/icons-vue';
import { defineEmits } from 'vue';
import axios from 'axios';  // 引入axios
axios.defaults.baseURL ='http://localhost:9876'
// 使用 defineEmits 来定义触发的事件
const emit = defineEmits(); 


// 定义返回的数据类型

// 定义可借阅书籍的数据类型
interface Document {
  idList: number[];
  title: string;
  author: string;
  type: string;
  publishDate: string;  // 使用 string 类型，这样便于前端显示
  remain: number;
}

// 定义已借阅书籍的数据类型

interface BorrowedBook {
  id: number;
  userID: number;
  bookID: number;
  borrowedAt: string;
  returnedAt: string;
}
interface ReturnBorrowedBook {
  id: number;
  title: string;
  author: string;
  bookType: string;
  publishDate: string;
  borrowedAt: string;
}        
const availableBooks = ref<Document[]>([]);       // 存储可借阅书籍的数据
const totalAvailableBooks = ref(0);               // 存储可借阅书籍的总数
const borrowedBooks = ref<BorrowedBook[]>([]);    // 请求1已借阅书籍的列表
const returnBorrowedBooks = ref<ReturnBorrowedBook[]>([]);    // 详细的已借阅书籍的列表
const borrowSearchQuery = ref('');                // 存储查询要借阅书籍的关键字
const searchQuery = ref('');                      // 存储查询已借阅书籍的关键字
const token = localStorage.getItem('jwtToken');   // 从 localStorage 获取JWT令牌
const borrowDialogVisible = ref(false);           // 控制借阅对话框的显示
const currentPage = ref(1);                       // 当前页码
const pageSize = ref(10);                         // 每页显示的数据条数
const availableCurrentPage = ref(1);              // 可借阅书籍的当前页码
const availablePageSize = ref(10);                // 可借阅书籍每页显示的数据条数

// 监听 borrowSearchQuery 的变化，当关键字发生变化时，发送请求获取数据。
watch(borrowSearchQuery, async (newQuery) => {
  if (newQuery.trim()) {
    try {
      const response = await axios.get(`/book/search/${newQuery}`, {
      headers: { Authorization: token ? `Bearer ${token}` : '',  },
      });
      availableBooks.value = response.data;  // 更新可借阅书籍的数据
      totalAvailableBooks.value = response.data.length;  // 更新总书籍数
    } catch (error) {
      console.error('Error fetching books:', error);
      Message.error('Failed to fetch books');
    }
  } else {
    availableBooks.value = [];
    totalAvailableBooks.value = 0;
  }
});

// 处理借阅书籍的请求
const borrowBook = async (book) => {
  if(book.remain > 0) {
   try{
      const response = await axios.post(`/book/borrow/${book.id}`, {}, {
      headers: { Authorization: token ? `Bearer ${token}` : '',  },
    });
    if(response.status === 200) {
      Message.success('Book borrowed successfully');
    }
   } catch (error) {
      console.error('Error borrowing book:', error);
      Message.error('Failed to borrow book');
    }
  } else {
    Message.error('Book is not available for borrowing');
  }
}


// 请求已借阅的图书
const fetchBorrowedBooks = async () => {
  try {
    // 获取借阅的书籍列表
    const response = await axios.get('/book/borrowings', {
      headers: { Authorization: token ? `Bearer ${token}` : '' },
    });
    borrowedBooks.value = response.data;  // 更新已借阅书籍的数据

    // 对于 borrowings 中的每一本书，请求书籍的详细信息，利用 bookID 来请求
    const bookDetailsPromises = borrowedBooks.value.map(async (book) => {
      try {
        const bookDetailResponse = await axios.get(`/book/${book.bookID}`, {
          headers: { Authorization: token ? `Bearer ${token}` : '' },
        });

        // 假设返回的数据包含书籍的详细信息
        const bookDetails = bookDetailResponse.data;
        // 创建一个新的对象，类型为ReturnBorrowedBook
        const returnBorrowedBookIns: ReturnBorrowedBook = {
          id: book.id,
          title: bookDetails.title,
          author: bookDetails.author,
          bookType: bookDetails.bookType,
          publishDate: bookDetails.publishDate,
          borrowedAt: book.borrowedAt}
        returnBorrowedBooks.value.push(returnBorrowedBookIns);
      } catch (error) {
        console.error(`Error fetching details for book ID ${book.bookID}:`, error);
      }
    });

    // 等待所有详细信息请求完成
    await Promise.all(bookDetailsPromises);

  } catch (error) {
    console.error('Error fetching borrowed books:', error);
    Message.error('Failed to fetch borrowed books');
  }
};


// 显示已借阅书籍
const showBorrowedBooks = () => {
  borrowDialogVisible.value = true;
  fetchBorrowedBooks();  // 请求已借阅书籍数据
};








const handlePageChange = (page) => {
    currentPage.value = page;
};

const handleAvailablePageChange = (page) => {
    availableCurrentPage.value = page;
};

// 处理归还书籍的请求
const returnBook = async (book: BorrowedBook) => {
  try {
    // 发送 POST 请求归还书籍
    const response = await axios.post(`/book/return/${book.bookID}`, {}, {
      headers: { Authorization: token ? `Bearer ${token}` : '' },
    });

    if (response.status === 200) {
      // 成功归还书籍
      borrowedBooks.value = borrowedBooks.value.filter(b => b.id !== book.id);  // 从已借阅书籍列表中移除该书
      Message.success('Book returned successfully');  // 提示归还成功
    }
  } catch (error) {
    console.error('Error returning book:', error);
    Message.error('Failed to return the book');  // 提示归还失败
  }
};

// Navigate to home route
const goHome = () => {
  emit('goHome','Home');
  console.log('Go Home');
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

