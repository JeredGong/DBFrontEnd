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
      <div class="Return-Upload">
        <el-button type="primary" @click="showBorrowedBooks">查看已借阅书目</el-button>
        <el-button type="primary" @click="ClickBook">上传图书信息</el-button>
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

  <el-dialog
  title="上传图书信息"
  v-model="BookDialogVisible"
  width="50%"
  :before-close="closeEditDialog"
  custom-class="custom-dialog"
  :visible.sync="BookDialogVisible"
>
  <!-- 美化标题 -->
  <div class="dialog-header">
    <h2 class="dialog-title">上传图书信息</h2>
  </div>

  <el-form :model="editingDocument" ref="formRef" label-width="120px">
    <el-form-item
      label="标题"
      prop="title"
      :rules="[{ required: true, message: '请输入标题', trigger: 'blur' }]"
    >
      <el-input
        v-model="editingDocument.title"
        placeholder="请输入标题"
        class="custom-input"
      ></el-input>
    </el-form-item>
    <el-form-item
      label="作者"
      prop="author"
      :rules="[{ required: true, message: '请输入作者', trigger: 'blur' }]"
    >
      <el-input
        v-model="editingDocument.author"
        placeholder="请输入作者"
        class="custom-input"
      ></el-input>
    </el-form-item>
    <el-form-item
      label="出版时间"
      prop="publishDate"
      :rules="[{ required: true, message: '请选择时间', trigger: 'change' }]"
    >
      <el-date-picker
        v-model="editingDocument.publishDate"
        type="date"
        placeholder="选择出版时间"
        format="YYYY-MM-DD"
        class="custom-datepicker"
      ></el-date-picker>
    </el-form-item>
  </el-form>

  <template #footer>
    <span class="dialog-footer">
      <el-button @click="closeEditDialog" class="custom-button">取消</el-button>
      <el-button
        type="primary"
        @click="submitEdit"
        class="custom-button"
      >
        提交
      </el-button>
    </span>
  </template>
</el-dialog>
</template>



<script lang="ts" setup>
import { ref, computed, watch,reactive} from 'vue';
import { Message, House, Search, Upload } from '@element-plus/icons-vue';
import { defineEmits } from 'vue';
import { ElMessage } from 'element-plus';
import { debounce } from 'lodash';
import axios from 'axios';  // 引入axios
axios.defaults.baseURL ='http://localhost:9876'
// 使用 defineEmits 来定义触发的事件
const emit = defineEmits(); 
const jwtToken = localStorage.getItem('authToken'); // 存储在 localStorage
const BookDialogVisible = ref(false);  // 控制上传图书信息对话框的显示
const ClickBook = ()=>
{
  BookDialogVisible.value = true;
}

const editingDocument = reactive({
  id: 0,
  title: '',
  author: '',
  docType: '',
  publishDate: new Date() // ISO 字符串日期
});
const editFileList = ref([]); // 文件列表用于编辑上传
// 提交编辑文档的逻辑
const submitEdit = async () => {
  if (!editingDocument.title || !editingDocument.author || !editingDocument.publishDate) {
    ElMessage.error('请填写完整的文档信息');
    return;
  }

  try {
    const jwtToken = localStorage.getItem('authToken');
    if (!jwtToken) {
      ElMessage.error('请先登录');
      return;
    }

    // 创建一个 JSON 对象
    const documentData = {
      title: editingDocument.title,
      author: editingDocument.author,
      bookType: "book",
      publishDate: handleDateChange(editingDocument.publishDate),
    };
    console.log(documentData.publishDate);
    // 发送 PUT 请求，上传 JSON 数据
    const response = await axios.post(`/book`, documentData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`,
      },
    });
    if(response.status == 200){
      ElMessage.success('图书上传成功');
    }
    else{
      ElMessage.error('图书上传失败，请稍后重试');
      console.log('图书上传失败:', response.data);
    }
  } catch (error) {
    ElMessage.error('图书上传失败，请稍后重试');
    console.log('图书上传失败:', error);
  }
};
const closeEditDialog = () =>{
  // 关闭界面
  BookDialogVisible.value = false;
}

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
const borrowDialogVisible = ref(false);           // 控制借阅对话框的显示
const currentPage = ref(1);                       // 当前页码
const pageSize = ref(10);                         // 每页显示的数据条数
const availableCurrentPage = ref(1);              // 可借阅书籍的当前页码
const availablePageSize = ref(10);                // 可借阅书籍每页显示的数据条数

// 创建防抖函数，延迟 500 毫秒发起请求
const debouncedFetchBooks = debounce(async (query) => {
  if (query.trim()) {
    try {
      const response = await axios.get(`/book/search/${query}`, {
        headers: { Authorization:`Bearer ${jwtToken}`}
      });

      // 处理返回数据
      availableBooks.value = response.data;
      availableBooks.value.map((book) => {
        if (book.publishDate == null) {
          book.publishDate = '未知';
        } else {
          const [year, dayOfYear] = book.publishDate.toString().split(',').map(Number);
          book.publishDate = handleDateReverse(year, dayOfYear);
        }
      });

      totalAvailableBooks.value = response.data.length;
    } catch (error) {
      console.error('Error fetching books:', error);
      ElMessage.error('Failed to fetch books');
    }
  } else {
    availableBooks.value = [];
    totalAvailableBooks.value = 0;
  }
}, 200); // 500 毫秒防抖延时

// 使用 watch 监听查询输入的变化
watch(borrowSearchQuery, (newQuery) => {
  debouncedFetchBooks(newQuery);  // 调用防抖函数
});

// 处理借阅书籍的请求
const borrowBook = async (book) => {
  if(book.remain > 0) {
   try{
    // 得到book.id 数组的第一个元素

      const response = await axios.post(`/book/borrow/${book.idList[0]}`, {}, {
      headers: { Authorization: `Bearer ${jwtToken}` },
    });
    if(response.status === 200) {
      ElMessage.success('Book borrowed successfully');
      // 重新拉取可借阅书籍的数据
      debouncedFetchBooks(borrowSearchQuery.value);
    }
   } catch (error) {
      console.error('Error borrowing book:', error);
      ElMessage.error('Failed to borrow book');
    }
  } else {
    ElMessage.error('Book is not available for borrowing');
  }
}


// 请求已借阅的图书
const fetchBorrowedBooks = async () => {
  // 清空数据
  returnBorrowedBooks.value = [];
  try {
    // 获取借阅的书籍列表
    const response = await axios.get(`/book/borrowings`, {
      headers: { Authorization: `Bearer ${jwtToken}` }
    });
    borrowedBooks.value = response.data;  // 更新已借阅书籍的数据

    // 对于 borrowings 中的每一本书，请求书籍的详细信息，利用 bookID 来请求
    const bookDetailsPromises = borrowedBooks.value.map(async (book) => {
      try {
        const bookDetailResponse = await axios.get(`/book/${book.bookID}`, {
          headers: { Authorization: jwtToken ? `Bearer ${jwtToken}` : '' },
        });
        // 假设返回的数据包含书籍的详细信息
        const bookDetails = bookDetailResponse.data;
        if(bookDetails.publishDate == null){
          bookDetails.publishDate = '未知';
        }
        else{
          const [year, dayOfYear] = bookDetails.publishDate.toString().split(',').map(Number);
          bookDetails.publishDate = handleDateReverse(year, dayOfYear);
        }
        if(book.borrowedAt == null){
          book.borrowedAt = '未知';
        }
        else{
          const [year, dayOfYear] = book.borrowedAt.toString().split(',').map(Number);
          book.borrowedAt = handleDateReverse(year, dayOfYear);
        }
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
    ElMessage.error('Failed to fetch borrowed books');
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
    const response = await axios.post(`/book/return/${book.id}`, {}, {
      headers: { Authorization: jwtToken ? `Bearer ${jwtToken}` : '' },
    });

    if (response.status === 200) {
      // 成功归还书籍
      ElMessage.success('Book returned successfully');  // 提示归还成功
      // 退出对话框
      borrowDialogVisible.value = false;
    }
  } catch (error) {
    console.error('Error returning book:', error);
    ElMessage.error('Failed to return the book');  // 提示归还失败
  }
};

// Navigate to home route
const goHome = () => {
  emit('goHome','Home');
  console.log('Go Home');
};

const handleDateChange = (date) => {
  // 获取年份
  const year = date.getFullYear();

  // 获取该日期的当年第一天
  const firstDayOfYear = new Date(year, 0, 1);

  // 计算该日期是该年中的第几天
  const dayOfYear = Math.floor((date.getTime() - firstDayOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  // 返回结果：[年份, 第X天]
  return [year, dayOfYear];
};

const handleDateReverse = (year, dayOfYear) => {
  // 创建一个该年份1月1日的日期对象
  const date = new Date(year, 0, 1);  // 0代表1月，1代表日期
  // 在1月1日的基础上，添加天数（减去1，因为1月1日是第1天）
  date.setDate(date.getDate() + dayOfYear - 1);

  // 获取日期的YYYY-MM-DD格式
  const yearFormatted = date.getFullYear();
  const monthFormatted = (date.getMonth() + 1).toString().padStart(2, '0');
  const dayFormatted = date.getDate().toString().padStart(2, '0');
  
  return `${yearFormatted}-${monthFormatted}-${dayFormatted}`;
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

.Return-Upload {
    display: flex;
    gap: 15px; /* 添加间隔 */
    align-items: center; /* 垂直居中 */
    margin-right: 20px;
}

.dialog-header {
  text-align: center;
  margin-bottom: 20px;
}

.dialog-title {
  font-size: 24px;
  font-weight: bold;
  color: #1e90ff;
  margin-bottom: 8px;
}

.custom-button {
  border-radius: 20px;
  padding: 8px 24px;
  font-size: 14px;
  transition: all 0.2s ease;
}

.custom-button:hover {
  background-color: #1e90ff;
  color: white;
}

.custom-dialog {
  border-radius: 20px;
  background-color: #ffffff;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  padding: 20px;
}

.custom-datepicker .el-date-editor:focus {
  border-color: #1e90ff;
  box-shadow: 0 0 8px rgba(30, 144, 255, 0.3);
}

.custom-input .el-input__inner::placeholder,
.custom-select .el-select__inner::placeholder {
  color: #bfbfbf;
  font-size: 13px;
}

</style>