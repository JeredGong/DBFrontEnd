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
          <el-button type="primary" :icon="House" circle size="large"  @click="goHome"/>
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
              <h3>图书借阅一览</h3>
            </div>
            <div class="table-container">
              <table class="paper-table">
                <thead>
                  <tr>
                    <th>图书唯一标识符</th>
                    <th>图书名称</th>
                    <th>作者</th>
                    <th>借阅者</th>
                    <th>借阅时间</th>
                    <th>余量</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(request, index) in allBorrowRequests" :key="index">
                    <td>{{ request.id }}</td>
                    <td>{{ request.title }}</td>
                    <td>{{ request.author }}</td>
                    <td>{{ request.username }}</td>
                    <td>{{ request.borrowedAt }}</td>
                    <td>{{ request.status }}</td>
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
                    <th>文档标题</th>
                    <th>作者</th>
                    <th>文档类型</th>
                    <th>出版日期</th>
                    <th>上传者</th>
                    <th>上传日期</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(file, index) in fileUploads" :key="index">
                    <td>{{ file.title }}</td>
                    <td>{{ file.author }}</td>
                    <td>{{ file.docType }}</td>
                    <td>{{ file.publishDate }}</td>
                    <td>{{ file.uploadedBy }}</td>
                    <td>{{ file.upload_date }}</td>

                    <td>
                      <el-button
                        size="small"
                        type="info"
                        @click="confirmFile(file.id)"
                      >确认文件</el-button>
                      <el-button
                        size="small"
                        type="info"
                        @click="refuseFile(file)"
                      >拒绝文件</el-button>
                      <el-button
                        size="small"
                        type="primary"
                        @click="GetFile(file)"
                      >查看文件</el-button>
                      <el-button
                        size="small"
                        type="primary"
                        @click="openEditDialog(file)"
                      >编辑文件</el-button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </el-card>
        </div>
      </div>
    </div>
    <el-dialog
  title="编辑文档"
  v-model="editDialogVisible"
  width="50%"
  :before-close="closeEditDialog"
  custom-class="custom-dialog"
>
  <!-- 美化标题 -->
  <div class="dialog-header">
    <h2 class="dialog-title">编辑文档信息</h2>
    <p class="dialog-subtitle">请修改文档信息后提交</p>
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
      label="类型"
      prop="docType"
      :rules="[{ required: true, message: '请选择类型', trigger: 'change' }]"
    >
      <el-select
        v-model="editingDocument.docType"
        placeholder="请选择类型"
        class="custom-select"
      >
        <el-option label="图书" value="Book"></el-option>
        <el-option label="论文" value="Paper"></el-option>
      </el-select>
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

    <!-- 新增上传文档 -->
    <el-form-item label="上传新文档">
      <el-upload
        class="upload-demo"
        drag
        action="https://jsonplaceholder.typicode.com/posts/"
        :limit="1"
        :on-exceed="handleEditFileExceed"
        multiple
        :file-list="editFileList"
        list-type="text"
        :on-change="handleEditFileChange"
        :on-remove="handleEditFileRemove"
        :auto-upload="false"
      >
        <div class="drag-upload-box">
          <i class="el-icon-upload"></i>
          <div class="upload-text">将文件拖拽至此处，或点击上传</div>
          <div class="upload-tip">最多上传 1 个文件</div>
        </div>
      </el-upload>
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
  import { ref, computed,reactive,onMounted } from 'vue';
  import { Message, House } from '@element-plus/icons-vue';
  import { defineEmits } from 'vue';
  import axios from 'axios';
// 使用 defineEmits 来定义触发的事件
const emit = defineEmits();
const jwtToken = localStorage.getItem('authToken'); // JWT存储在 localStorage
// 定义图书借阅查看
interface BorrowRequest {
  id: number;
  userID : number;
  bookID : number;
  borrowedAt : string;
  returnedAt : string;
  remain     : number;
}
interface  AllBorrowRequest {
  id: number;
  username : string;
  title : string;
  author : string;
  borrowedAt : string;
  returnedAt : string;
  remain     : number;
}
  // 定义图书借阅查看的响应式数据
  const borrowRequests = ref<BorrowRequest[]>([]);
  const allBorrowRequests = ref<AllBorrowRequest[]>([]);
    // 向后端请求数据
    const fetchBorrowRequests = async () => {
  try {
    const response = await axios.get(`/book/borrowings/all`, {
      headers: {
        Authorization: `Bearer ${jwtToken}`, // 添加 JWT Token
      },
    });

    if (response.status === 200 && response.data) {
      borrowRequests.value = response.data;
      const bookDetailsPromises = borrowRequests.value.map(async (borrow) => {
        // 对于每一本书，请求书籍详情
        const bookResponse = await axios.get(`/book/${borrow.bookID}`, {
          headers: {
            Authorization: `Bearer ${jwtToken}`, // 添加 JWT Token
          },
        });

        // 请求用户详情
        const userResponse = await axios.get(`/user/${borrow.userID}`, {
          headers: {
            Authorization: `Bearer ${jwtToken}`, // 添加 JWT Token
          },
        });

        if (bookResponse.status === 200 && bookResponse.data && userResponse.status === 200 && userResponse.data) {
          const alldata: AllBorrowRequest = {
            id: borrow.id,
            username: userResponse.data.username,
            title: bookResponse.data.title,
            author: bookResponse.data.author,
            borrowedAt: borrow.borrowedAt,
            returnedAt: borrow.returnedAt,
            remain: borrow.remain,
          };
          allBorrowRequests.value.push(alldata);
        }
      });
      await Promise.all(bookDetailsPromises);
      console.log('All Borrow Requests:', allBorrowRequests.value);
    }
  } catch (error) {
    console.error('Error fetching borrow requests:', error);
  }
};
  


  // 定义上传文件查看与编辑、批准的逻辑在这里

  // 请求上传文件的接口
  interface FileUpload {
    id: number;
    title: string;
    author: string;
    docType: string;
    publishDate: string;
    uploadedBy: string;
    upload_date: string;
    download_count: number;
  }

  // 定义上传文件查看与编辑、批准的响应式数据
  const fileUploads = ref<FileUpload[]>([]);
  // 更新状态并排序
  const fetchfileUploads = async () => {
    try {
      const response = await axios.get(`/docs/buffer`, {
        headers: {
          Authorization: `Bearer ${jwtToken}`, // 添加 JWT Token
        },
      });
      fileUploads.value = response.data;
    } catch (error) {
      console.error('Error fetching file uploads:', error);
    }
  };
  
  // 确认文件的逻辑
  const confirmFile = async (fileid:number) => {
    try {
      const response = await axios.post(`/docs/buffer/${fileid}`, {
        headers: {
          Authorization: `Bearer ${jwtToken}`, // 添加 JWT Token
        },
      });
      if(response.status === 200){
        Message.success('文件已确认成功');
      }
    } catch (error) {
      console.error('Error fetching file uploads:', error);
      Message.error('文件确认失败,错误信息：'+error);
    }
  };
  // 查看文件的逻辑
  const GetFile = async (file) => {
  try {
    const response = await axios.get(`/docs/buffer/${file.id}`, {
      headers: {
        Authorization: `Bearer ${jwtToken}`, // 添加 JWT Token
      },
      responseType: 'blob', // 确保响应类型为 blob
    });
    if (response.status === 200) {
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${file.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      Message.success('文件已查看成功');
    }
  } catch (error) {
    console.error('Error fetching file uploads:', error);
    Message.error('文件查看失败,错误信息：' + error);
  }
};
  // 拒绝文件的逻辑
  const refuseFile = async (fileid:number) => {
    try {
      const response = await axios.delete(`/docs/buffer/${fileid}`, {
        headers: {
          Authorization: `Bearer ${jwtToken}`, // 添加 JWT Token
        },
      });
      if(response.status === 200){
        Message.success('文件已拒绝成功');
      }
    } catch (error) {
      console.error('Error fetching file uploads:', error);
      Message.error('文件拒绝失败,错误信息：'+error);
    }
  };
  // 编辑文件的逻辑
  const editDialogVisible = ref(false); // 控制编辑弹出框可见性
  const editingDocument = reactive({
  id: null,
  title: '',
  author: '',
  docType: '',
  publishDate: '', // ISO 字符串日期
  pdfContent: '', // 编辑的新文件 Base64 字符串
});
  const editFileList = ref([]); // 文件列表用于编辑上传
  // 打开编辑弹出框并初始化信息
const openEditDialog = (doc) => {
  editingDocument.id = doc.id;
  editingDocument.title = doc.title || ''; // 初始化标题
  editingDocument.author = doc.author || ''; // 初始化作者
  editingDocument.docType = doc.docType || ''; // 初始化类型
  editingDocument.publishDate = doc.publishDate || ''; // 初始化出版时间
  editingDocument.pdfContent = ''; // 清空之前的上传文件
  editFileList.value = []; // 清空文件列表
  editDialogVisible.value = true;
};

// 关闭编辑弹出框
const closeEditDialog = () => {
  editFileList.value = []; // 关闭时清空文件列表
  editingDocument.id = null; // 清空 ID
  editingDocument.title = ''; // 清空标题
  editingDocument.author = ''; // 清空作者
  editingDocument.docType = ''; // 清空类型
  editingDocument.publishDate = ''; // 清空出版时间
  editingDocument.pdfContent = ''; // 清空文件内容
  editDialogVisible.value = false;
};

// 处理文件超出限制
const handleEditFileExceed = (files, fileList) => {
  if (files.length + fileList.length > 1) {
    Message.warning(`最多上传 1 个文件，当前已选择 ${fileList.length} 个文件`);
  }
};

// 处理文件变更，读取 Base64 数据
const handleEditFileChange = (file, fileList) => {
  editFileList.value = fileList;

  const reader = new FileReader();
  reader.onload = (event) => {
    let result = event.target?.result as string;

    // 移除 `data:<MIME>;base64,` 前缀
    if (result?.startsWith("data:")) {
      const base64StartIndex = result.indexOf("base64,") + 7;
      result = result.substring(base64StartIndex);
    }

    editingDocument.pdfContent = result; // 存储 Base64 数据
    console.log("上传的新文件 Base64:", editingDocument.pdfContent);
  };

  reader.readAsDataURL(file.raw);
};

// 删除上传文件
const handleEditFileRemove = (file) => {
  editingDocument.pdfContent = ''; // 移除文件时清空 Base64 数据
  Message.warning(`文件 ${file.name} 已移除`);
};

// 提交编辑文档的逻辑
const submitEdit = async () => {
  if (!editingDocument.title || !editingDocument.author || !editingDocument.docType || !editingDocument.publishDate) {
    Message.error('请填写完整的文档信息');
    return;
  }

  try {
    const jwtToken = localStorage.getItem('authToken');
    if (!jwtToken) {
      Message.error('请先登录');
      return;
    }

    const response = await axios.put(`/docs/buffer/${editingDocument.id}`, editingDocument, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwtToken}`,
      },
    });
    if(response.status === 200){
      Message.success('文档编辑成功');
      closeEditDialog();
    }
  } catch (error) {
    Message.error('文档编辑失败，请稍后重试');
  }
};

 // 模拟通知数据
 const notifications = ref([
  { message: '您有一条新消息：Dr. Alice Smith' },
  { message: '您的论文《AI与伦理》已被下载5次' },
  { message: '新粉丝：Dr. Bob Brown关注了您' },
]);
const formattedDate = computed(() => {
    const currentDate = new Date();
    const day = currentDate.getDate();
    const month = currentDate.toLocaleString('zh-CN', { month: 'long' });
    const year = currentDate.getFullYear();
    return `${year}年${month}${day}日`;
  });
// 处理通知点击事件
const handleNotificationCommand = (notification) => {
  console.log('Notification clicked:', notification);
};

// Navigate to home route
const goHome = () => {
  emit('goHome','Home');
  console.log('Go Home');
};
onMounted(() => {
  fetchBorrowRequests();
  fetchfileUploads();
});
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
  .dialog-subtitle {
  font-size: 14px;
  color: #8c8c8c;
}
.custom-input .el-input__inner,
.custom-select .el-select__inner,
.custom-datepicker .el-date-editor {
  border-radius: 30px;
  padding: 12px 15px;
  font-size: 14px;
  border: 1px solid #d9d9d9;
  background-color: #f5f5f5;
  transition: all 0.3s ease;
}
/* 上传区域 */
.drag-upload-box {
  border: 2px dashed #cfd8e3;
  border-radius: 15px;
  padding: 40px;
  text-align: center;
  color: #606266;
  background-color: #f0f5ff;
  transition: border-color 0.3s ease;
}

.drag-upload-box:hover {
  border-color: #1e90ff;
}

.drag-upload-box i {
  font-size: 32px;
  color: #1e90ff;
  margin-bottom: 10px;
}
.custom-dialog {
  border-radius: 20px;
  background-color: #ffffff;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  padding: 20px;
}
/* 按钮样式 */
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
  </style>