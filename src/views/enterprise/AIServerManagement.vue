<template>
  <div class="ai-server-management-container">
    <!-- 搜索区域 -->
    <el-form :inline="true" :model="searchForm" class="mb-4">
      <el-form-item label="服务器名称">
        <el-input v-model="searchForm.serverName" placeholder="请输入服务器名称" />
      </el-form-item>
      <el-form-item label="IP地址">
        <el-input v-model="searchForm.ipAddress" placeholder="请输入IP地址" />
      </el-form-item>
      <el-form-item label="服务器类型">
        <el-select v-model="searchForm.serverType" placeholder="请选择服务器类型">
          <el-option label="GPU服务器" value="gpu" />
          <el-option label="CPU服务器" value="cpu" />
          <el-option label="混合服务器" value="hybrid" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="searchForm.status" placeholder="请选择状态">
          <el-option label="运行中" value="running" />
          <el-option label="已停止" value="stopped" />
          <el-option label="维护中" value="maintenance" />
          <el-option label="异常" value="error" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="fetchServers">搜索</el-button>
        <el-button icon="RefreshRight" @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作按钮区域 -->
    <div class="operation-buttons mb-4">
      <el-button type="primary" icon="Plus" @click="handleAdd">新增</el-button>
      <el-button type="success" icon="Edit" :disabled="selectedServers.length !== 1" @click="handleEdit">修改</el-button>
      <el-button type="danger" icon="Delete" :disabled="selectedServers.length === 0" @click="handleDelete">删除</el-button>
      <el-button type="warning" icon="Download" @click="handleExport">导出</el-button>
    </div>

    <!-- 服务器表格 -->
    <el-table
        :data="serverList"
        border
        stripe
        @selection-change="handleSelectionChange"
        style="width: 100%"
        v-loading="tableLoading"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="id" label="服务器ID" width="100" align="center" />
      <el-table-column prop="serverName" label="服务器名称" align="center" />
      <el-table-column prop="ipAddress" label="IP地址" align="center" />
      <el-table-column prop="serverType" label="服务器类型" align="center">
        <template #default="scope">
          <el-tag :type="serverTypeTagType(scope.row.serverType)">
            {{ serverTypeText(scope.row.serverType) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" align="center">
        <template #default="scope">
          <el-tag :type="statusTagType(scope.row.status)">
            {{ statusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" align="center" />
      <el-table-column label="操作" width="200" align="center">
        <template #default="scope">
          <el-button type="text" @click="handleEdit(scope.row)">修改</el-button>
          <el-button type="text" @click="handleDelete([scope.row.id])">删除</el-button>
          <el-button
              type="text"
              :class="scope.row.status === 'running' ? 'text-danger' : 'text-success'"
              @click="handleStatusChange(scope.row)"
          >
            {{ scope.row.status === 'running' ? '停止' : '启动' }}
          </el-button>
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

    <!-- 新增/编辑服务器弹窗 -->
    <el-dialog
        v-model="dialogVisible"
        :title="dialogType === 'add' ? '新增AI服务器' : '编辑AI服务器'"
        :width="500"
        draggable
    >
      <el-form
          ref="serverForm"
          :model="formData"
          :rules="formRules"
          label-width="100px"
          class="server-form"
      >
        <el-form-item label="服务器名称" prop="serverName">
          <el-input v-model="formData.serverName" placeholder="请输入服务器名称" />
        </el-form-item>
        <el-form-item label="IP地址" prop="ipAddress">
          <el-input v-model="formData.ipAddress" placeholder="请输入IP地址" />
        </el-form-item>
        <el-form-item label="服务器类型" prop="serverType">
          <el-select v-model="formData.serverType" placeholder="请选择服务器类型">
            <el-option label="GPU服务器" value="gpu" />
            <el-option label="CPU服务器" value="cpu" />
            <el-option label="混合服务器" value="hybrid" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="formData.status" placeholder="请选择状态">
            <el-option label="运行中" value="running" />
            <el-option label="已停止" value="stopped" />
            <el-option label="维护中" value="maintenance" />
            <el-option label="异常" value="error" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注信息">
          <el-input v-model="formData.remark" placeholder="请输入备注信息" type="textarea" :rows="3" />
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
import { ElMessage, ElMessageBox } from 'element-plus';
// 假设导入服务器相关API
import {
  getServerPage,
  addServer,
  updateServer,
  deleteServer,
  getServerById,
  updateServerStatus
} from '@/api/server';

// 搜索表单数据
const searchForm = reactive({
  serverName: '',
  ipAddress: '',
  serverType: '',
  status: ''
});

// 表格数据
const serverList = ref([]);
const selectedServers = ref([]);
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
  serverName: '',
  ipAddress: '',
  serverType: '',
  status: '',
  remark: ''
});

// 表单验证规则
const formRules = reactive({
  serverName: [
    { required: true, message: '请输入服务器名称', trigger: 'blur' },
    { min: 2, max: 50, message: '服务器名称长度在2-50个字符之间', trigger: 'blur' }
  ],
  ipAddress: [
    { required: true, message: '请输入IP地址', trigger: 'blur' },
    {
      pattern: /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/,
      message: '请输入正确的IP地址格式',
      trigger: 'blur'
    }
  ],
  serverType: [
    { required: true, message: '请选择服务器类型', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
});

// 获取组件实例（用于表单验证）
const { proxy } = getCurrentInstance();

// 服务器类型文本转换
const serverTypeText = (type) => {
  const map = {
    'gpu': 'GPU服务器',
    'cpu': 'CPU服务器',
    'hybrid': '混合服务器'
  };
  return map[type] || type;
};

// 服务器类型标签样式
const serverTypeTagType = (type) => {
  const map = {
    'gpu': 'primary',
    'cpu': 'success',
    'hybrid': 'warning'
  };
  return map[type] || 'info';
};

// 状态文本转换
const statusText = (status) => {
  const map = {
    'running': '运行中',
    'stopped': '已停止',
    'maintenance': '维护中',
    'error': '异常'
  };
  return map[status] || status;
};

// 状态标签样式
const statusTagType = (status) => {
  const map = {
    'running': 'success',
    'stopped': 'info',
    'maintenance': 'warning',
    'error': 'danger'
  };
  return map[status] || 'info';
};

// 获取服务器列表
const fetchServers = async () => {
  try {
    tableLoading.value = true;
    const params = {
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      serverName: searchForm.serverName || undefined,
      ipAddress: searchForm.ipAddress || undefined,
      serverType: searchForm.serverType || undefined,
      status: searchForm.status || undefined
    };
    const response = await getServerPage(params);
    console.log("服务器列表数据", response);
    if (response.code === 200) {
      serverList.value = response.data.records || [];
      total.value = response.data.total || 0;
    } else {
      ElMessage.error(response.msg || '获取服务器列表失败');
    }
  } catch (error) {
    ElMessage.error('获取服务器列表异常，请重试');
    console.error('获取服务器列表错误:', error);
  } finally {
    tableLoading.value = false;
  }
};

// 重置搜索表单
const resetForm = () => {
  searchForm.serverName = '';
  searchForm.ipAddress = '';
  searchForm.serverType = '';
  searchForm.status = '';
  currentPage.value = 1;
  fetchServers();
};

// 表格选择变化
const handleSelectionChange = (selected) => {
  selectedServers.value = selected;
};

// 新增服务器
const handleAdd = () => {
  dialogType.value = 'add';
  // 重置表单
  formData.id = '';
  formData.serverName = '';
  formData.ipAddress = '';
  formData.serverType = '';
  formData.status = '';
  formData.remark = '';
  // 重置表单验证
  proxy.$refs.serverForm && proxy.$refs.serverForm.resetFields();
  dialogVisible.value = true;
};

// 编辑服务器
const handleEdit = async (row) => {
  const targetRow = row || (selectedServers.value.length === 1 ? selectedServers.value[0] : null);

  if (!targetRow) {
    ElMessage.warning('请选择一条数据进行修改');
    return;
  }

  try {
    tableLoading.value = true;
    console.log("点击的行", targetRow);
    const response = await getServerById(targetRow.id);
    console.log("获取服务器详情", response);
    if (response.code === 200 && response.data) {
      dialogType.value = 'edit';
      formData.id = response.data.id;
      formData.serverName = response.data.serverName;
      formData.ipAddress = response.data.ipAddress;
      formData.serverType = response.data.serverType;
      formData.status = response.data.status;
      formData.remark = response.data.remark || '';
      dialogVisible.value = true;
    } else {
      ElMessage.error(response.msg || '获取服务器详情失败');
    }
  } catch (error) {
    ElMessage.error('获取服务器详情异常，请重试');
    console.error('获取服务器详情错误:', error);
  } finally {
    tableLoading.value = false;
  }
};

// 删除服务器
const handleDelete = async (ids) => {
  const targetIds = Array.isArray(ids) ? ids : selectedServers.value.map(server => server.id);

  if (targetIds.length === 0) {
    ElMessage.warning('请选择要删除的服务器');
    return;
  }

  try {
    await ElMessageBox.confirm(
        '确定要删除选中的服务器吗？删除后不可恢复',
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
    );

    // 批量删除
    for (const id of targetIds) {
      const response = await deleteServer(id);
      if (response.code !== 200) {
        ElMessage.error(`删除服务器ID:${id} 失败: ${response.msg || '未知错误'}`);
        return;
      }
    }

    ElMessage.success('删除成功');
    // 重新加载列表
    fetchServers();
    // 清空选中状态
    selectedServers.value = [];
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败，请重试');
      console.error('删除服务器错误:', error);
    }
  }
};

// 导出服务器
const handleExport = () => {
  // 实际项目中调用导出接口
  ElMessage.info('导出功能开发中...');
};

// 切换服务器状态
const handleStatusChange = async (row) => {
  try {
    const newStatus = row.status === 'running' ? 'stopped' : 'running';
    const confirmText = row.status === 'running' ? '确定要停止该服务器吗？' : '确定要启动该服务器吗？';

    await ElMessageBox.confirm(
        confirmText,
        '操作确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info'
        }
    );

    const response = await updateServerStatus(row.id, { status: newStatus });
    if (response.code === 200) {
      ElMessage.success(`服务器已${newStatus === 'running' ? '启动' : '停止'}`);
      fetchServers();
    } else {
      ElMessage.error(response.msg || '状态更新失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败，请重试');
      console.error('服务器状态更新错误:', error);
    }
  }
};

// 提交表单（新增/编辑）
const handleSubmit = async () => {
  try {
    // 表单验证
    await proxy.$refs.serverForm.validate();

    if (dialogType.value === 'add') {
      // 新增服务器
      const response = await addServer(formData);
      if (response.code === 200) {
        ElMessage.success('新增服务器成功');
        dialogVisible.value = false;
        fetchServers();
      } else {
        ElMessage.error(response.msg || '新增服务器失败');
      }
    } else {
      // 编辑服务器
      const response = await updateServer(formData);
      if (response.code === 200) {
        ElMessage.success('更新服务器成功');
        dialogVisible.value = false;
        fetchServers();
      } else {
        ElMessage.error(response.msg || '更新服务器失败');
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
  fetchServers();
};

// 分页-当前页变化
const handleCurrentChange = (val) => {
  currentPage.value = val;
  fetchServers();
};

// 页面挂载时加载数据
onMounted(() => {
  fetchServers();
});
</script>

<style scoped>
.ai-server-management-container {
  padding: 20px;
}

.operation-buttons {
  display: flex;
  gap: 10px;
}

.server-form {
  margin-top: 15px;
}
</style>

