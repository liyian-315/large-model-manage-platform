<template>
  <div class="enterprise-user-management-container">
    <div class="page-header">
      <h2>企业用户管理</h2>
      <el-button type="primary" @click="handleAddUser" :icon="Plus">新增用户</el-button>
    </div>

    <!-- 搜索条件 -->
    <div class="search-form">
      <el-form :model="searchForm" inline>
        <el-form-item label="用户名">
          <el-input v-model="searchForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="searchForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.userStatus" placeholder="请选择状态" style="width: 160px;">
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch" :icon="Search">搜索</el-button>
          <el-button @click="handleReset" :icon="Refresh">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 用户列表 -->
    <div class="user-table">
      <el-table
          v-loading="loading"
          :data="usersData"
          style="width: 100%"
          @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="用户ID" width="80" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="realName" label="真实姓名" />
        <el-table-column prop="enterpriseName" label="所属企业" />
        <el-table-column prop="roleName" label="角色" />
        <el-table-column prop="phone" label="手机号码" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="userStatus" label="状态" width="100">
          <template #default="scope">
            <el-switch
                v-model="scope.row.userStatus"
                :active-value="1"
                :inactive-value="0"
                @change="handleStatusChange(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleEditUser(scope.row)" :icon="Edit" />
            <el-button type="danger" size="small" @click="handleDeleteUser(scope.row)" :icon="Delete" />
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
      />
    </div>

    <!-- 新增/编辑用户对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="700px">
      <el-form ref="userFormRef" :model="formData" :rules="rules" label-width="120px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="formData.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="formData.realName" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item label="密码" v-if="isAddUser" prop="password">
          <el-input v-model="formData.password" type="password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item label="确认密码" v-if="isAddUser" prop="confirmPassword">
          <el-input v-model="formData.confirmPassword" type="password" placeholder="请确认密码" />
        </el-form-item>
        <el-form-item label="手机号码" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入手机号码" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="formData.userStatus" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue';
import {
  Plus,
  Search,
  Refresh,
  Edit,
  Delete
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  getUserList,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus
} from '@/api/user.js';

// 状态管理
const loading = ref(false);
const usersData = ref([]);
const searchForm = reactive({
  username: '',
  email: '',
  userStatus: null
});
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
});
const selectedUsers = ref([]);
const dialogVisible = ref(false);
const dialogTitle = ref('新增用户');
const isAddUser = ref(true);
const userFormRef = ref();

// 表单数据
const formData = reactive({
  id: '',
  username: '',
  realName: '',
  password: '',
  confirmPassword: '',
  phone: '',
  email: '',
  userStatus: 1
});

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== formData.password) {
          callback(new Error('两次输入的密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ],
  phone: [
    {
      pattern: /^1[3-9]\d{9}$/,
      message: '请输入正确的手机号码格式',
      trigger: 'blur'
    }
  ],
  email: [
    {
      pattern: /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
      message: '请输入正确的邮箱格式',
      trigger: 'blur'
    }
  ]
};

// 加载用户数据
const loadUsers = async () => {
  loading.value = true;
  try {
    const params = {
      pageNum: pagination.currentPage,
      pageSize: pagination.pageSize,
      username: searchForm.username || undefined,
      email: searchForm.email || undefined,
      userStatus: searchForm.userStatus !== null ? searchForm.userStatus : undefined
    };

    const response = await getUserList(params);
    if (response && response.data) {
      usersData.value = response.data.records || [];
      pagination.total = response.data.total || 0;
    }
  } catch (error) {
    console.error('获取用户列表失败:', error);
    ElMessage.error('获取用户列表失败');
  } finally {
    loading.value = false;
  }
};

// 处理搜索
const handleSearch = () => {
  pagination.currentPage = 1;
  loadUsers();
};

// 处理重置
const handleReset = () => {
  searchForm.username = '';
  searchForm.email = '';
  searchForm.userStatus = null;
  pagination.currentPage = 1;
  loadUsers();
};

// 处理分页大小变化
const handleSizeChange = (size) => {
  pagination.pageSize = size;
  loadUsers();
};

// 处理当前页变化
const handleCurrentChange = (current) => {
  pagination.currentPage = current;
  loadUsers();
};

// 处理选择变化
const handleSelectionChange = (selection) => {
  selectedUsers.value = selection;
};

// 处理新增用户
const handleAddUser = () => {
  isAddUser.value = true;
  dialogTitle.value = '新增用户';
  Object.assign(formData, {
    id: '',
    username: '',
    realName: '',
    password: '',
    confirmPassword: '',
    phone: '',
    email: '',
    userStatus: 1
  });
  dialogVisible.value = true;
  nextTick(() => {
    userFormRef.value?.resetFields();
  });
};

// 处理编辑用户
const handleEditUser = (row) => {
  isAddUser.value = false;
  dialogTitle.value = '编辑用户';
  Object.assign(formData, {
    ...row,
    confirmPassword: ''
  });
  dialogVisible.value = true;
};

// 处理删除用户
const handleDeleteUser = async (row) => {
  try {
    await ElMessageBox.confirm(
        `确定要删除用户「${row.realName}」吗？`,
        '删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
    );
    await deleteUser(row.id);
    ElMessage.success('删除成功');
    loadUsers();
  } catch (error) {
    if (error === 'cancel') return;
    console.error('删除用户失败:', error);
    ElMessage.error('删除失败');
  }
};

// 处理状态变化
const handleStatusChange = async (row) => {
  try {
    await updateUserStatus(row.id, { userStatus: row.userStatus });
    ElMessage.success(`用户「${row.realName}」状态已更新`);
  } catch (error) {
    row.userStatus = row.userStatus === 1 ? 0 : 1; // 回滚
    console.error('更新用户状态失败:', error);
    ElMessage.error('状态更新失败');
  }
};

// 处理表单提交
const handleSubmit = async () => {
  try {
    await userFormRef.value?.validate();
    const userData = { ...formData };
    if (isAddUser.value) {
      await createUser(userData);
    } else {
      await updateUser(userData);
    }
    dialogVisible.value = false;
    ElMessage.success(isAddUser.value ? '新增成功' : '编辑成功');
    loadUsers();
  } catch (error) {
    console.error(isAddUser.value ? '新增用户失败:' : '编辑用户失败:', error);
    if (error !== 'cancel') {
      ElMessage.error(isAddUser.value ? '新增失败' : '编辑失败');
    }
  }
};

onMounted(() => {
  loadUsers();
});
</script>

<style scoped>
.enterprise-user-management-container {
  padding: 20px;
  background-color: #f5f7fa;
  height: 100%;
  overflow-y: auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 500;
  color: #1f2937;
}

.search-form {
  background-color: #ffffff;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.user-table {
  background-color: #ffffff;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
