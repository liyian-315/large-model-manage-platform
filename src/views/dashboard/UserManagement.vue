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
          <el-input v-model="searchForm.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="searchForm.email" placeholder="请输入邮箱"></el-input>
        </el-form-item>
        <el-form-item label="用户状态">
          <el-select v-model="searchForm.userStatus" placeholder="请选择状态">
            <el-option label="启用" value="1"></el-option>
            <el-option label="禁用" value="0"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="所属企业">
          <el-select v-model="searchForm.enterpriseId" placeholder="请选择企业" style="width: 180px;">
            <el-option v-for="dept in departments" :key="dept.id" :label="dept.name" :value="dept.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="用户角色">
          <el-select v-model="searchForm.roleId" placeholder="请选择角色">
            <el-option v-for="role in roleList" :key="role.id" :label="role.roleName" :value="role.id"></el-option>
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
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="id" label="用户ID" width="80" align="center"></el-table-column>
        <el-table-column prop="username" label="用户名" align="center"></el-table-column>
        <el-table-column prop="realName" label="真实姓名" align="center"></el-table-column>
        <el-table-column prop="enterpriseName" label="所属企业" align="center"></el-table-column>
        <el-table-column prop="roleName" label="用户角色" align="center"></el-table-column>
        <el-table-column prop="phone" label="手机号码" align="center"></el-table-column>
        <el-table-column prop="email" label="邮箱" align="center"></el-table-column>
        <el-table-column prop="userStatus" label="状态" width="100" align="center">
          <template #default="scope">
            <el-switch
                v-model="scope.row.userStatus"
                active-value="1"
                inactive-value="0"
                @change="handleStatusChange(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" align="center"></el-table-column>
        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleEditUser(scope.row)" :icon="Edit"></el-button>
            <el-button type="danger" size="small" @click="handleDeleteUser(scope.row)" :icon="Delete"></el-button>
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
      ></el-pagination>
    </div>

    <!-- 新增/编辑用户对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="700px" draggable>
      <el-form ref="userFormRef" :model="formData" :rules="rules" label-width="120px" class="user-form">
        <el-form-item label="用户角色" prop="roleId">
          <el-select v-model="formData.roleId" placeholder="请选择用户角色" style="width: 100%;">
            <el-option
                v-for="role in roleList"
                :key="role.id"
                :label="role.roleName"
                :value="role.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="formData.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="formData.realName" placeholder="请输入真实姓名"></el-input>
        </el-form-item>
        <el-form-item label="密码" v-if="isAddUser" prop="password">
          <el-input v-model="formData.password" type="password" placeholder="请输入密码"></el-input>
        </el-form-item>
        <el-form-item label="确认密码" v-if="isAddUser" prop="confirmPassword">
          <el-input v-model="formData.confirmPassword" type="password" placeholder="请确认密码"></el-input>
        </el-form-item>
        <el-form-item label="所属企业" prop="enterpriseId">
          <el-select v-model="formData.enterpriseId" placeholder="请选择企业" style="width: 100%;">
            <el-option v-for="dept in departments" :key="dept.id" :label="dept.name" :value="dept.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="手机号码" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入手机号码"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" placeholder="请输入邮箱"></el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch
              v-model="formData.userStatus"
              active-value="1"
              inactive-value="0"
          ></el-switch>
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
} from '@/api/user.js';

import {
  getAccessibleRoles,
  getAllRoles
} from '@/api/role';

// 角色列表
const roleList = ref([])
// 企业列表
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
  email: '',
  userStatus: '',
  enterpriseId: '',
  roleId: ''
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
  enterpriseId: '',
  phone: '',
  email: '',
  userStatus: '1',
  roleId: '',
});

// 获取角色列表
const fetchRoles = async () => {
  try {
    const response = await getAccessibleRoles();
    if (response.code === 200) {
      roleList.value = response.data || [];
    } else {
      ElMessage.error(response.msg || '获取角色列表失败');
    }
  } catch (error) {
    ElMessage.error('获取角色列表异常，请重试');
    console.error('获取角色列表错误:', error);
  }
};

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' }
  ],
  roleId: [
    { required: true, message: '请选择用户角色', trigger: 'change' }
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
  enterpriseId: [
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
    const params = {
      pageNum: pagination.currentPage,
      pageSize: pagination.pageSize,
      username: searchForm.username || undefined,
      email: searchForm.email || undefined,
      userStatus: searchForm.userStatus || undefined,
      roleId: searchForm.roleId || undefined,
      enterpriseId: searchForm.enterpriseId || undefined
    };

    const response = await getUserList(params);

    if (response.code === 200 && response.data) {
      usersData.value = response.data.records.map(user => ({
        ...user,
        userStatus: user.userStatus?.toString() || '0'
      }));
      pagination.total = response.data.total || 0;
    } else {
      ElMessage.error(response.msg || '获取用户列表失败');
      usersData.value = [];
      pagination.total = 0;
    }
  } catch (error) {
    console.error('获取用户列表失败:', error);
    ElMessage.error('获取用户列表异常，请重试');
    usersData.value = [];
    pagination.total = 0;
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
  searchForm.userStatus = '';
  searchForm.enterpriseId = '';
  searchForm.roleId = '';
  pagination.currentPage = 1;
  loadUsers();
};

// 处理分页大小变化
const handleSizeChange = (size) => {
  pagination.pageSize = size;
  pagination.currentPage = 1;
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
    enterpriseId: '',
    phone: '',
    email: '',
    userStatus: '1',
    roleId: ''
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
    id: row.id,
    username: row.username,
    realName: row.realName,
    enterpriseId: row.enterpriseId,
    phone: row.phone,
    email: row.email,
    userStatus: row.userStatus || '1',
    roleId: row.roleId || '',
    password: '',
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

    const response = await deleteUser(row.id);
    if (response.code === 200) {
      ElMessage.success('删除成功');
      loadUsers();
    } else {
      ElMessage.error(response.msg || '删除失败');
    }
  } catch (error) {
    if (error === 'cancel') return;
    console.error('删除用户失败:', error);
    ElMessage.error('删除失败，请重试');
  }
};

// 处理状态变化
const handleStatusChange = async (row) => {
  try {
    const response = await updateUserStatus(row.id, {
      userStatus: row.userStatus === '1' ? 0 : 1
    });

    if (response.code === 200) {
      ElMessage.success(`用户「${row.realName}」状态已更新`);
    } else {
      row.userStatus = row.userStatus === '1' ? '0' : '1';
      ElMessage.error(response.msg || '状态更新失败');
    }
  } catch (error) {
    row.userStatus = row.userStatus === '1' ? '0' : '1';
    console.error('更新用户状态失败:', error);
    ElMessage.error('状态更新失败，请重试');
  }
};

// 处理表单提交
const handleSubmit = async () => {
  try {
    await userFormRef.value?.validate();

    const userData = {
      id: formData.id,
      username: formData.username,
      realName: formData.realName,
      enterpriseId: formData.enterpriseId,
      phone: formData.phone,
      email: formData.email,
      userStatus: parseInt(formData.userStatus, 10),
      roleId: formData.roleId,
      ...(isAddUser.value && { password: formData.password })
    };

    let response;
    if (isAddUser.value) {
      response = await createUser(userData);
    } else {
      response = await updateUser(userData);
    }

    if (response.code === 200) {
      dialogVisible.value = false;
      ElMessage.success(isAddUser.value ? '新增成功' : '编辑成功');
      loadUsers();
    } else {
      ElMessage.error(response.msg || (isAddUser.value ? '新增失败' : '编辑失败'));
    }
  } catch (error) {
    if (error.name !== 'Error') {
      console.error(isAddUser.value ? '新增用户失败:' : '编辑用户失败:', error);
    }
  }
};

// 组件挂载时加载数据
onMounted(() => {
  loadUsers();
  fetchRoles();
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

.user-form {
  margin-top: 15px;
}
</style>
