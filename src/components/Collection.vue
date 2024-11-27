<template>
  <div class="document-search-container">
    <!-- Header -->
    <div class="header-container">
      <div class="header-left">
        <div class="overview-title">
          <span>文档查询与上传</span>
        </div>
        <div class="formatted-date">
          <span>{{ formattedDate }}</span>
        </div>
      </div>
      <div class="header-right">
        <el-button type="primary" :icon="House" circle size="large" @click="goHome()" />
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
      <el-button type="primary" :icon="Upload" @click="openDialog">上传文档</el-button>
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
              <el-button size="small" type="success" icon="el-icon-download" @click="downloadDocument(scope.row.id)">下载</el-button>
              <el-button size="small" type="danger" icon="el-icon-delete" @click="deleteDocument(scope.row.id)" v-if="Role == 0">删除</el-button>
              <el-button size="small" type="warning" icon="el-icon-edit" @click="openEditDialog(scope.row)" v-if="Role == 0">编辑</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <el-pagination
        background
        layout="prev, pager, next"
        :total="documents.values.length"
        :page-size="pageSize"
        v-model:current-page="currentPage"
        @current-change="handlePageChange"
        class="pagination-center"
      ></el-pagination>
    </div>
  </div>
  <el-dialog
  title=""
  v-model="dialogVisible"
  width="50%"
  :before-close="handleDialogClose"
  custom-class="custom-dialog"
>
  <!-- 美化标题 -->
  <div class="dialog-header">
    <h2 class="dialog-title">上传文档</h2>
    <p class="dialog-subtitle">请按照步骤填写信息并上传文件</p>
  </div>

  <!-- 步骤导航 -->
  <el-steps
    :active="currentStep"
    align-center
    finish-status="success"
    class="steps-container"
  >
    <el-step title="填写文档信息"></el-step>
    <el-step title="上传文档"></el-step>
  </el-steps>

  <!-- 第一步：填写文档基本信息 -->
  <div v-if="currentStep === 1" class="step-content">
    <el-form :model="documentForm" ref="formRef" label-width="120px">
      <el-form-item
        label="标题"
        prop="title"
        :rules="[{ required: true, message: '请输入标题', trigger: 'blur' }]"
      >
        <el-input
          v-model="documentForm.title"
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
          v-model="documentForm.author"
          placeholder="请输入作者"
          class="custom-input"
        ></el-input>
      </el-form-item>
      <el-form-item
        label="类型"
        prop="docType"
        :rules="[{ required: true, message: '请选择类型', trigger: 'change' }]"
      >
        <el-select v-model="documentForm.docType" placeholder="请选择类型" class="custom-select">
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
          v-model="documentForm.publishDate"
          type="date"
          placeholder="选择出版时间"
          format="YYYY-MM-DD"
          class="custom-datepicker"
        ></el-date-picker>
      </el-form-item>
    </el-form>
  </div>

  <!-- 第二步：上传文档 -->
  <div v-if="currentStep === 2" class="step-content">
    <el-upload
      class="upload-demo"
      drag
      action="https://jsonplaceholder.typicode.com/posts/"
      :limit="1"
      :on-exceed="handleExceed"
      multiple
      :file-list="fileList"
      list-type='text'
      :on-preview="handlePreview"
      :on-remove="handleRemove"
      :on-change="handleFileChange"
      :auto-upload="false" 
    >
      <div class="drag-upload-box">
        <i class="el-icon-upload"></i>
        <div class="upload-text">将文件拖拽至此处，或点击上传</div>
        <div class="upload-tip">最多上传 1 个文件</div>
      </div>
    </el-upload>
  </div>

  <!-- 对话框底部 -->
  <template #footer>
    <span class="dialog-footer">
      <el-button v-if="currentStep > 1" @click="prevStep" class="custom-button">上一步</el-button>
      <el-button v-if="currentStep === 1" @click="nextStep" type="primary" class="custom-button">下一步</el-button>
      <el-button
        v-if="currentStep === 2"
        type="primary"
        @click="submitUpload"
        class="custom-button"
      >
        提交
      </el-button>
      <el-button @click="dialogVisible = false" class="custom-button">取消</el-button>
    </span>
  </template>
</el-dialog>

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
import { ref, computed } from 'vue';
import { reactive } from 'vue';
import { Message, House, Search,Upload,Download} from '@element-plus/icons-vue';
import { ElMessageBox } from 'element-plus';
import type { FormInstance } from 'element-plus';
import { ElMessage } from 'element-plus';
import axios from 'axios';
import { useUserStore } from '../stores/user';
import { defineEmits } from 'vue';

// 使用 defineEmits 来定义触发的事件
const emit = defineEmits();
const BatchDowload = ref('info');
const jwtToken = localStorage.getItem('authToken'); // 存储在 localStorage
const userStore = useUserStore();           // 引入用户状态
const Role = userStore.user.Role;
// 第一部分：搜索文档的逻辑处理
interface Document {
  id: number;
  title: string;
  type: string;
  author: string;
  publishDate: string;
  upload_date: string;
  download_count: number;
}  // 定义文档类型

const searchQuery = ref('');            // 搜索关键字

const documents = ref<Document[]>([
  {
    id: 1,
    title: 'Test',
    type: 'Paper',
    author: 'Test',
    publishDate: '2021-09-01',
    upload_date: '2021-09-01',
    download_count: 10,
  }
]);  // 搜索结果文档列表

// 搜索文档的逻辑
const searchDocuments = async () => {
  if (!searchQuery.value.trim()) {
    ElMessage.warning('请输入搜索关键词');
    return;
  }

  try {
    // 调用后端搜索接口
    const response = await axios.get(`/docs/search/${encodeURIComponent(searchQuery.value)}`, {
      headers: {
        Authorization: `Bearer ${jwtToken}`, // 添加 JWT Token
      },
    });
    documents.value = response.data;
    console.log('搜索成功:', documents.value);
  } catch (error) {
    console.error('搜索失败:', error);
    ElMessage.error('搜索失败，请稍后重试');
  }
};

// 当前页码和每页显示数量
const currentPage = ref(1);
const pageSize = 5;

// 分页逻辑
const paginatedDocuments = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  const end = start + pageSize;
  return documents.value.slice(start, end);
});

// 处理分页切换
const handlePageChange = (page) => {
  currentPage.value = page;
};

const selectedRows = ref<Document[]>([]); // 存储选中行的数据

// 批量下载逻辑
const handleBatchDownload = async () => {
  if (selectedRows.value.length > 0) {
    try {
      console.log('开始批量下载...');
      await Promise.all(
        selectedRows.value.map(async (row) => {
          await downloadDocument(row.id);
        })
      );
      ElMessage.success('批量下载成功');
    } catch (error) {
      ElMessage.error('批量下载失败，请检查网络或重试');
    }
  } else {
    ElMessage.warning('请先选择要下载的文档');
  }
};

// 选中行变化时，批量下载按钮样式变化
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

// 下载文档的逻辑
const downloadDocument = async (id: number) => {
  try {
    const response = await axios.get(`/docs/${id}`, {
      responseType: 'blob', // 指定返回二进制文件
    });
    if(response.status == 200){
      // 创建 Blob 对象
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);

    // 创建下载链接并触发下载
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `document_${id}.pdf`); // 自定义下载文件名
    document.body.appendChild(link);
    link.click();

    // 清理 URL 对象
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);

    ElMessage.success('文档下载成功！');
    }
    else{
      ElMessage.error('文档下载失败，请稍后重试');
    }
  } catch (error) {
    console.error('文档下载失败:', error);
    ElMessage.error('文档下载失败，请稍后重试');
  }
};

// 删除文档的逻辑
const DeleteDocument = async (id: number) => {
  try {
    const response = await axios.delete(`/docs/${id}`, {
      headers: {
        Authorization: `Bearer ${jwtToken}`, // 添加 JWT Token
      },});
    if(response.status == 200){
      documents.value = documents.value.filter((doc) => doc.id !== id);
      ElMessage.success('文档删除成功！');  
    }
    else{
      ElMessage.error('文档删除失败，请稍后重试');}
    } catch (error) {
    console.error('文档删除失败:', error);
    ElMessage.error('文档删除失败，请稍后重试');}

}
const deleteDocument = (id: number) => {
  ElMessageBox.confirm('此操作将永久删除该文件, 是否继续?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    DeleteDocument(id);
    ElMessage.success('删除成功');
  }).catch(() => {
    ElMessage.info('已取消删除');
  });
};

// 编辑文档的逻辑

// 表单数据，用于编辑文档
// 编辑弹出框相关逻辑
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
  editingDocument.docType = doc.type || ''; // 初始化类型
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
    ElMessage.warning(`最多上传 1 个文件，当前已选择 ${fileList.length} 个文件`);
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
  ElMessage.warning(`文件 ${file.name} 已移除`);
};

// 提交编辑文档的逻辑
const submitEdit = async () => {
  if (!editingDocument.title || !editingDocument.author || !editingDocument.docType || !editingDocument.publishDate) {
    ElMessage.error('请填写完整的文档信息');
    return;
  }

  try {
    const jwtToken = localStorage.getItem('authToken');
    if (!jwtToken) {
      ElMessage.error('请先登录');
      return;
    }

    const response = await axios.put(`/docs/${editingDocument.id}`, editingDocument, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwtToken}`,
      },
    });
    ElMessage.success('文档编辑成功');
    closeEditDialog();
  } catch (error) {
    ElMessage.error('文档编辑失败，请稍后重试');
  }
};


// 第二部分：上传文档的逻辑处理

// 表单数据
const documentForm = reactive({
  title: '',
  author: '',
  docType: '',
  publishDate: '', // ISO 字符串日期
  pdfContent: '', // 文件的 Base64 字符串
});

// 一些状态变量
const dialogVisible = ref(false); // 控制对话框可见性

const fileList = ref([]); // 一个需要维护的文件列表，因为upload组件不会维护文件列表

const formRef = ref<FormInstance | null>(null); // 表单引用

const currentStep = ref(1); // 当前步骤



// 文件上传的逻辑，首先将上传的文件保存到表单
const handleFileChange = (file, fileList) => {
  fileList.value = fileList;

  const reader = new FileReader();
  reader.onload = (event) => {
    let result = event.target?.result as string;

    // 动态移除 `data:<MIME>;base64,` 前缀
    if (result?.startsWith("data:")) {
      const base64StartIndex = result.indexOf("base64,") + 7; // 找到 Base64 数据的起始位置
      result = result.substring(base64StartIndex);
    }

    documentForm.pdfContent = result; // 存储纯 Base64 数据
    console.log("去除前缀后的 Base64 内容:", documentForm.pdfContent);
  };

  // 读取文件为 Base64 数据
  reader.readAsDataURL(file.raw);
};

//文件预览的逻辑
const handlePreview = (file) => {
  const pdfContent = documentForm.pdfContent; // 获取 Base64 内容
  if (!pdfContent) {
    console.error('未找到 PDF 内容');
    return;
  }

  // 将 Base64 转换为 Blob
  const byteCharacters = atob(pdfContent); // 解码 Base64
  const byteNumbers = new Array(byteCharacters.length).fill(0).map((_, i) => byteCharacters.charCodeAt(i));
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: 'application/pdf' });

  // 创建临时 URL
  const url = URL.createObjectURL(blob);

  // 创建一个隐藏的 <a> 元素触发下载
  const link = document.createElement('a');
  link.href = url;
  link.download = file.name || 'document.pdf'; // 设置文件名
  document.body.appendChild(link);
  link.click();

  // 清理
  document.body.removeChild(link);
  URL.revokeObjectURL(url); // 释放 URL
};


// 文件超出限制的逻辑
const handleExceed = (files: any, fileList: any) => {
  if (files.length + fileList.length > 1){
    ElMessage.warning(`最多上传 1 个文件，当前已选择 ${fileList.length} 个文件`);
  }
};

// ----- 步骤导航逻辑 -----

// 打开对话框
const openDialog = () => {dialogVisible.value = true;};

// 关闭对话框
const handleDialogClose = () => {
      fileList.value = []; // 关闭对话框时清空文件列表
      dialogVisible.value = false;
    };

// 上一步
const prevStep = () => {currentStep.value--;};  

// 下一步
const nextStep = () => {
  if (!formRef.value) return; // 确保表单引用已绑定
  formRef.value.validate((valid) => {
    if (valid) {
      currentStep.value++;
    } else {
      ElMessage.error('请填写完整的文档信息');
    }
  });
};

// ----- 步骤导航逻辑 End-----
  

const handleRemove = (file) => {
      ElMessage.warning(`文件 ${file.name} 已移除`);
    };

// 提交上传的逻辑，发送 POST 请求
const submitUpload = async () => {
  if (!documentForm.pdfContent) {
    ElMessage.error('请上传文件');
    return;
  }
  try {
    const jwtToken = localStorage.getItem('authToken'); // 获取 JWT Token
    if(!jwtToken){
      ElMessage.error('请先登录');
      return;
    }
    const response = await axios.post('/docs', documentForm, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwtToken}`,
      },
    });
    ElMessage.success('文档上传成功');
    console.log('服务器响应:', response.data);
  } catch (error) {
    console.error('文档上传失败:', error);
    ElMessage.error('文档上传失败，请稍后重试');
  }
};

// 第三部分：其他逻辑处理

// 计算属性：格式化当前日期
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
  emit('goHome','Home');
  console.log('Go Home');
};

// 待完善：通知相关逻辑
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

/* 步骤导航 */
.steps-container {
  margin-bottom: 20px;
}

/* 表单项 */
.step-content {
  background-color: #ffffff;
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
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

.custom-input .el-input__inner:focus,
.custom-select .el-select__inner:focus,
.custom-datepicker .el-date-editor:focus {
  border-color: #1e90ff;
  box-shadow: 0 0 8px rgba(30, 144, 255, 0.3);
}

.custom-input .el-input__inner::placeholder,
.custom-select .el-select__inner::placeholder {
  color: #bfbfbf;
  font-size: 13px;
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
.custom-dialog {
  border-radius: 20px;
  background-color: #ffffff;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  padding: 20px;
}
</style>