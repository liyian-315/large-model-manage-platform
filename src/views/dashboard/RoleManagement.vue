<template>
  <div class="role-management-container">
    <!-- 搜索区域 -->
    <el-form :inline="true" :model="searchForm" class="mb-4">
      <el-form-item label="角色名称">
        <el-input v-model="searchForm.roleName" placeholder="请输入角色名称" />
      </el-form-item>
      <el-form-item label="角色编码">
        <el-input v-model="searchForm.roleCode" placeholder="请输入角色编码" />
      </el-form-item>
      <el-form-item label="创建时间">
        <el-date-picker
            v-model="searchForm.createTime"
            type="daterange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="fetchRoles">搜索</el-button>
        <el-button icon="RefreshRight" @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作按钮区域 -->
    <div class="operation-buttons mb-4">
      <el-button type="primary" icon="Plus" @click="handleAdd">新增</el-button>
      <el-button type="success" icon="Edit" :disabled="selectedRoles.length !== 1" @click="handleEdit">修改</el-button>
      <el-button type="danger" icon="Delete" :disabled="selectedRoles.length === 0" @click="handleDelete">删除</el-button>
      <el-button type="warning" icon="Download" @click="handleExport">导出</el-button>
    </div>

    <!-- 角色表格 -->
    <el-table
        :data="roleList"
        border
        stripe
        @selection-change="handleSelectionChange"
        style="width: 100%"
        v-loading="tableLoading"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="id" label="角色编号" width="100" align="center" />
      <el-table-column prop="roleName" label="角色名称" align="center" />
      <el-table-column prop="roleCode" label="角色编码" align="center" />
      <el-table-column prop="createTime" label="创建时间" align="center" />
      <el-table-column label="操作" width="200" align="center">
        <template #default="scope">
          <el-button type="text" @click="handleEdit(scope.row)">修改</el-button>
          <el-button type="text" @click="handleDelete([scope.row.id])">删除</el-button>
          <el-button type="text" @click="handleMore(scope.row)">更多</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[10, 20, 50]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        class="mt-4"
    />

    <!-- 新增/编辑角色弹窗 -->
    <el-dialog
        v-model="dialogVisible"
        :title="dialogType === 'add' ? '新增角色' : '编辑角色'"
        :width="500"
        draggable
    >
      <el-form
          ref="roleForm"
          :model="formData"
          :rules="formRules"
          label-width="100px"
          class="role-form"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="formData.roleName" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色编码" prop="roleCode">
          <el-input v-model="formData.roleCode" placeholder="请输入角色编码" :disabled="dialogType === 'edit'" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, getCurrentInstance } from 'vue';
import { ElMessage, ElMessageBox, ElNotification} from 'element-plus';
import {
  getRolePage,
  addRole,
  updateRole,
  deleteRole,
  getRoleById
} from '@/api/role';

// 搜索表单数据
const searchForm = reactive({
  roleName: '',
  roleCode: '',
  createTime: []
});

// 表格数据
const roleList = ref([]);
const selectedRoles = ref([]);
const tableLoading = ref(false);

// 分页参数
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 弹窗相关
const dialogVisible = ref(false);
const dialogType = ref('add'); // 'add' 或 'edit'
const formData = reactive({
  id: '',
  roleName: '',
  roleCode: ''
});

// 表单验证规则
const formRules = reactive({
  roleName: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 2, max: 20, message: '角色名称长度在2-20个字符之间', trigger: 'blur' }
  ],
  roleCode: [
    { required: true, message: '请输入角色编码', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '角色编码只能包含字母、数字和下划线', trigger: 'blur' }
  ]
});

// 获取组件实例（用于表单验证）
const { proxy } = getCurrentInstance();

// 获取角色列表
const fetchRoles = async () => {
  try {
    tableLoading.value = true;
    const params = {
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      roleName: searchForm.roleName || undefined
    };
    const response = await getRolePage(params);
    console.log("角色列表数据",response);
    if (response.code === 200) {
      roleList.value = response.data.records|| [];
      total.value = response.data.total || 0;
    } else {
      ElMessage.error(response.msg || '获取角色列表失败');
    }
  } catch (error) {
    ElMessage.error('获取角色列表异常，请重试');
    console.error('获取角色列表错误:', error);
  } finally {
    tableLoading.value = false;
  }
};

// 重置搜索表单
const resetForm = () => {
  searchForm.roleName = '';
  searchForm.roleCode = '';
  searchForm.createTime = [];
  currentPage.value = 1;
  fetchRoles();
};

// 表格选择变化
const handleSelectionChange = (selected) => {
  selectedRoles.value = selected;
};

// 新增角色
const handleAdd = () => {
  dialogType.value = 'add';
  // 重置表单
  formData.id = '';
  formData.roleName = '';
  formData.roleCode = '';
  // 重置表单验证
  proxy.$refs.roleForm && proxy.$refs.roleForm.resetFields();
  dialogVisible.value = true;
};

// 编辑角色
const handleEdit = async (row) => {
  const targetRow = row || (selectedRoles.value.length === 1 ? selectedRoles.value[0] : null);

  if (!targetRow) {
    ElMessage.warning('请选择一条数据进行修改');
    return;
  }

  try {
    tableLoading.value = true;
    console.log("点击的行",targetRow);
    const response = await getRoleById(targetRow.id);
    console.log("获取角色详情", response);
    if (response.code === 200 && response.data) {
      dialogType.value = 'edit';
      formData.id = response.data.id;
      formData.roleName = response.data.roleName;
      formData.roleCode = response.data.roleCode;
      dialogVisible.value = true;
    } else {
      ElMessage.error(response.msg || '获取角色详情失败');
    }
  } catch (error) {
    ElMessage.error('获取角色详情异常，请重试');
    console.error('获取角色详情错误:', error);
  } finally {
    tableLoading.value = false;
  }
};

// 删除角色
const handleDelete = async (ids) => {
  const targetIds = Array.isArray(ids) ? ids : selectedRoles.value.map(role => role.id);

  if (targetIds.length === 0) {
    ElMessage.warning('请选择要删除的角色');
    return;
  }

  try {
    await ElMessageBox.confirm(
        '确定要删除选中的角色吗？删除后不可恢复',
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
    );

    // 批量删除（实际项目中如果后端支持批量删除可以优化为一次请求）
    for (const id of targetIds) {
      const response = await deleteRole(id);
      if (response.code !== 200) {
        ElMessage.error(`删除角色ID:${id} 失败: ${response}`);
        return;
      }
    }

    ElMessage.success('删除成功');
    // 重新加载列表
    fetchRoles();
    // 清空选中状态
    selectedRoles.value = [];
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败，请重试');
      console.error('删除角色错误:', error);
    }
  }
};

// 导出角色
const handleExport = () => {
  // 实际项目中调用导出接口
  ElMessage.info('导出功能开发中...');
};

// 提交表单（新增/编辑）
const handleSubmit = async () => {
  try {
    // 表单验证
    await proxy.$refs.roleForm.validate();
    console.log(dialogType.value)
    if (dialogType.value === 'add') {
      // 新增角色
      const response = await addRole(formData);
      if (response) {
        ElMessage.success('新增角色成功');
        dialogVisible.value = false;
        fetchRoles();
      } else {
        ElMessage.error(response.msg || '新增角色失败');
      }
    } else {
      // 编辑角色
      const response = await updateRole(formData);
      if (response.code === 200) {
        ElMessage.success('更新角色成功');
        dialogVisible.value = false;
        fetchRoles();
      } else {
        ElMessage.error(response.msg || '更新角色失败');
      }
    }
  } catch (error) {
    // 表单验证失败不处理
    if (error.name !== 'Error') {
      console.error('表单提交错误:', error);
    }
  }
};

// 分页-每页条数变化
const handleSizeChange = (val) => {
  pageSize.value = val;
  currentPage.value = 1;
  fetchRoles();
};

// 分页-当前页变化
const handleCurrentChange = (val) => {
  currentPage.value = val;
  fetchRoles();
};

// 更多操作
const handleMore = (row) => {
  ElMessage.info(`角色ID: ${row.id} 的更多操作`);
  // 可扩展：角色授权、详情查看等功能
};

// 页面挂载时加载数据
onMounted(() => {
  fetchRoles();
});
</script>

<style scoped>
.role-management-container {
  padding: 20px;
  background-color: #f5f7fa;
  height: 100%;
  overflow-y: auto;
}

.operation-buttons {
  display: flex;
  gap: 10px;
}

.role-form {
  margin-top: 15px;
}
</style>
