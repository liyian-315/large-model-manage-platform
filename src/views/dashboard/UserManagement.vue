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
        <el-form-item label="所属企业">
          <el-select v-model="searchForm.department" placeholder="请选择企业" style="width: 180px;">
            <el-option v-for="dept in departments" :key="dept.id" :label="dept.name" :value="dept.id" />
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
        <el-table-column prop="departmentName" label="所属企业" />
        <el-table-column prop="phone" label="手机号码" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-switch v-model="scope.row.status" @change="handleStatusChange(scope.row)" />
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
        <el-form-item label="所属企业" prop="departmentId">
          <el-select v-model="formData.departmentId" placeholder="请选择企业" style="width: 100%;">
            <el-option v-for="dept in departments" :key="dept.id" :label="dept.name" :value="dept.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="手机号码" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入手机号码" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="formData.status" />
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

// 模拟数据
const departments = [
  { id: 1, name: '技术部' },
  { id: 2, name: '产品部' },
  { id: 3, name: '运营部' },
  { id: 4, name: '市场部' },
  { id: 5, name: '财务部' }
];

// 状态管理
const loading = ref(false);
const usersData = ref([]);
const searchForm = reactive({
  username: '',
  department: ''
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
  departmentId: '',
  departmentName: '',
  position: '',
  phone: '',
  email: '',
  status: true
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
  departmentId: [
    { required: true, message: '请选择所属企业', trigger: 'change' }
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
    // 构建查询参数
    const params = {
      page: pagination.currentPage,
      pageSize: pagination.pageSize
    };

    // 添加搜索条件
    if (searchForm.username) {
      params.username = searchForm.username;
    }
    if (searchForm.department) {
      params.departmentId = searchForm.department;
    }

    // 调用API获取用户列表
    const response = await getUserList(params);

    // 假设API返回的格式是 { list: [...], total: ... }
    if (response && Array.isArray(response.list)) {
      usersData.value = response.list;
      pagination.total = response.total || response.list.length;
    } else {
      // 如果API返回格式不符或失败，使用模拟数据作为fallback
      console.warn('API返回格式不符合预期，使用模拟数据');

      // 模拟数据
      const mockData = [
        { id: 1, username: 'admin', realName: '管理员', departmentId: 1, departmentName: '技术部', position: '开发经理', phone: '13800138001', email: 'admin@example.com', status: true, createTime: '2024-01-01 10:00:00' },
        { id: 2, username: 'developer1', realName: '张三', departmentId: 1, departmentName: '技术部', position: '前端开发', phone: '13800138002', email: 'zhangsan@example.com', status: true, createTime: '2024-01-02 10:00:00' },
        { id: 3, username: 'developer2', realName: '李四', departmentId: 1, departmentName: '技术部', position: '后端开发', phone: '13800138003', email: 'lisi@example.com', status: true, createTime: '2024-01-03 10:00:00' },
        { id: 4, username: 'product', realName: '王五', departmentId: 2, departmentName: '产品部', position: '产品经理', phone: '13800138004', email: 'wangwu@example.com', status: true, createTime: '2024-01-04 10:00:00' },
        { id: 5, username: 'operation', realName: '赵六', departmentId: 3, departmentName: '运营部', position: '运营专员', phone: '13800138005', email: 'zhaoliu@example.com', status: false, createTime: '2024-01-05 10:00:00' }
      ];

      // 应用搜索条件
      let filteredData = [...mockData];
      if (searchForm.username) {
        filteredData = filteredData.filter(item => item.username.includes(searchForm.username) || item.realName.includes(searchForm.username));
      }
      if (searchForm.department) {
        filteredData = filteredData.filter(item => item.departmentId === searchForm.department);
      }

      // 应用分页
      const startIndex = (pagination.currentPage - 1) * pagination.pageSize;
      const endIndex = startIndex + pagination.pageSize;
      usersData.value = filteredData.slice(startIndex, endIndex);
      pagination.total = filteredData.length;
    }
  } catch (error) {
    console.error('获取用户列表失败:', error);
    ElMessage.error('获取用户列表失败');

    // 失败时使用模拟数据
    const mockData = [
      { id: 1, username: 'admin', realName: '管理员', departmentId: 1, departmentName: '技术部', position: '开发经理', phone: '13800138001', email: 'admin@example.com', status: true, createTime: '2024-01-01 10:00:00' },
      { id: 2, username: 'developer1', realName: '张三', departmentId: 1, departmentName: '技术部', position: '前端开发', phone: '13800138002', email: 'zhangsan@example.com', status: true, createTime: '2024-01-02 10:00:00' },
      { id: 3, username: 'developer2', realName: '李四', departmentId: 1, departmentName: '技术部', position: '后端开发', phone: '13800138003', email: 'lisi@example.com', status: true, createTime: '2024-01-03 10:00:00' },
      { id: 4, username: 'product', realName: '王五', departmentId: 2, departmentName: '产品部', position: '产品经理', phone: '13800138004', email: 'wangwu@example.com', status: true, createTime: '2024-01-04 10:00:00' },
      { id: 5, username: 'operation', realName: '赵六', departmentId: 3, departmentName: '运营部', position: '运营专员', phone: '13800138005', email: 'zhaoliu@example.com', status: false, createTime: '2024-01-05 10:00:00' }
    ];

    usersData.value = mockData;
    pagination.total = mockData.length;
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
  searchForm.department = '';
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
  // 重置表单数据
  Object.assign(formData, {
    id: '',
    username: '',
    realName: '',
    password: '',
    confirmPassword: '',
    departmentId: '',
    departmentName: '',
    position: '',
    phone: '',
    email: '',
    status: true
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
  // 复制行数据到表单
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

    // 调用API删除用户
    await deleteUser(row.id);

    ElMessage.success('删除成功');
    loadUsers(); // 重新加载数据
  } catch (error) {
    // 用户取消删除操作
    if (error === 'cancel') return;
    console.error('删除用户失败:', error);
    ElMessage.error('删除失败');
  }
};

// 处理状态变化
const handleStatusChange = async (row) => {
  try {
    // 调用API更新用户状态
    await updateUserStatus(row.id, { status: row.status ? 1 : 0 });

    ElMessage.success(`用户「${row.realName}」状态已更新`);
  } catch (error) {
    row.status = !row.status; // 回滚状态
    console.error('更新用户状态失败:', error);
    ElMessage.error('状态更新失败');
  }
};

// 处理表单提交
const handleSubmit = async () => {
  try {
    await userFormRef.value?.validate();

    // 准备表单数据
    const userData = {
      ...formData,
      status: formData.status ? 1 : 0 // 转换为数字状态
    };

    // 根据是否是新增用户调用不同的API
    if (isAddUser.value) {
      // 新增用户
      await createUser(userData);
    } else {
      // 编辑用户
      await updateUser(userData);
    }

    dialogVisible.value = false;
    ElMessage.success(isAddUser.value ? '新增成功' : '编辑成功');
    loadUsers(); // 重新加载数据
  } catch (error) {
    // 表单验证失败或提交出错
    console.error(isAddUser.value ? '新增用户失败:' : '编辑用户失败:', error);
    if (error !== 'cancel') {
      ElMessage.error(isAddUser.value ? '新增失败' : '编辑失败');
    }
  }
};

// 组件挂载时加载数据
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
