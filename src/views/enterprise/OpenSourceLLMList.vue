<template>
  <div class="model-list-page">
    <!-- 顶部区域：模型统计、搜索框、筛选下拉 -->
    <div class="top-bar">
      <div class="model-count">
        <el-icon class="model-icon"><Collection /></el-icon>
        模型 <span class="count">136</span>
      </div>
      <div class="search-area">
        <el-input
            placeholder="模型名称"
            prefix-icon="Search"
            style="width: 300px;"
        />
      </div>
      <div class="filter-area">
        <el-select v-model="selectedFilter" placeholder="请选择">
          <el-option label="最近更新" value="recent" />
          <el-option label="下载热度" value="download" />
          <el-option label="收藏量" value="collection" />
        </el-select>
      </div>
    </div>

    <!-- 模型卡片列表：栅格布局 -->
    <el-row :gutter="20" class="card-list">
      <el-col :span="12" v-for="(model, index) in modelList" :key="index">
        <el-card class="model-card">
          <!-- 卡片头部：模型名 + 私有标签（若有） -->
          <div class="card-header">
            <h3 class="model-name">{{ model.modelName }}</h3>
            <el-tag v-if="model.isPrivate" type="info" size="small">Private</el-tag>
          </div>
          <!-- 卡片描述 -->
          <div class="card-desc">{{ model.description }}</div>
          <!-- 卡片元信息：标签、更新时间、下载热度、收藏量 -->
          <div class="card-meta">
            <span class="meta-item">
              <el-icon class="meta-icon"><Picture /></el-icon>
              {{ model.tag }}
            </span>
            <span class="meta-item">更新时间：{{ model.updateTime }}</span>
            <span class="meta-item">下载热度：{{ model.downloadHeat }}</span>
            <span class="meta-item">收藏量：{{ model.collection }}</span>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref } from 'vue'
// 导入需要的Element Plus图标
import { Collection, Search, Picture } from '@element-plus/icons-vue'

// 模拟模型数据
const modelList = ref([
  {
    modelName: 'internlm/浦语·灵笔2-视觉问答-7B',
    isPrivate: false,
    description: 'Lorem ipsum dolor sit amet consectetur. Eget nam auctor eget ut nibh suspendisse purus eu.amet consectetur dolor sit nam...',
    tag: '图像分类',
    updateTime: '2023.11.26',
    downloadHeat: 64,
    collection: 92,
  },
  {
    modelName: 'jina/Ai文本向量模型v2-base-中英双语',
    isPrivate: true,
    description: 'Lorem ipsum dolor sit amet consectetur. Eget nam auctor eget ut nibh suspendisse purus eu.amet conse...',
    tag: '图像分类',
    updateTime: '2023.11.26',
    downloadHeat: 1121,
    collection: 92,
  },
  {
    modelName: 'internlm/浦语·灵笔2-7B',
    isPrivate: false,
    description: 'Lorem ipsum dolor sit amet consectetur. Eget nam auctor eget ut nibh suspendisse purus eu.amet consectetur dolor sit nam...',
    tag: '图像分类',
    updateTime: '2023.11.26',
    downloadHeat: 64,
    collection: 92,
  },
  {
    modelName: 'Orion/猎户星空-14B-Base',
    isPrivate: false,
    description: 'Lorem ipsum dolor sit amet consectetur. Eget nam auctor eget ut nibh suspendisse purus eu.amet consectetur dolor sit nam...',
    tag: '图像分类',
    updateTime: '2023.11.26',
    downloadHeat: 64,
    collection: 92,
  },
  {
    modelName: 'cv_portrait_model/人物AIGC基础模型',
    isPrivate: false,
    description: 'Lorem ipsum dolor sit amet consectetur. Eget nam auctor eget ut nibh suspendisse purus eu.amet consectetur dolor sit nam...',
    tag: '图像分类',
    updateTime: '2023.11.26',
    downloadHeat: 64,
    collection: 92,
  },
  {
    modelName: 'iic/CT-Transformer标点-中文-通用-pytorch',
    isPrivate: false,
    description: 'Lorem ipsum dolor sit amet consectetur. Eget nam auctor eget ut nibh suspendisse purus eu.amet consectetur dolor sit nam...',
    tag: '图像分类',
    updateTime: '2023.11.26',
    downloadHeat: 64,
    collection: 92,
  },
  {
    modelName: '通义实验室/人脸属性识别模型FairFace',
    isPrivate: false,
    description: 'Lorem ipsum dolor sit amet consectetur. Eget nam auctor eget ut nibh suspendisse purus eu.amet consectetur dolor sit nam...',
    tag: '图像分类',
    updateTime: '2023.11.26',
    downloadHeat: 64,
    collection: 92,
  },
  {
    modelName: 'thuuj12/基于FST的中文ITN',
    isPrivate: false,
    description: 'Lorem ipsum dolor sit amet consectetur. Eget nam auctor eget ut nibh suspendisse purus eu.amet consectetur dolor sit nam...',
    tag: '图像分类',
    updateTime: '2023.11.26',
    downloadHeat: 64,
    collection: 92,
  },
  {
    modelName: '通义实验室/OPEN人像修复增强',
    isPrivate: false,
    description: 'Lorem ipsum dolor sit amet consectetur. Eget nam auctor eget ut nibh suspendisse purus eu.amet consectetur dolor sit nam...',
    tag: '图像分类',
    updateTime: '2023.11.26',
    downloadHeat: 64,
    collection: 92,
  },
  {
    modelName: '通义实验室/卡证监测矫正模型',
    isPrivate: false,
    description: 'Lorem ipsum dolor sit amet consectetur. Eget nam auctor eget ut nibh suspendisse purus eu.amet consectetur dolor sit nam...',
    tag: '图像分类',
    updateTime: '2023.11.26',
    downloadHeat: 64,
    collection: 92,
  },
])

// 筛选下拉的默认值
const selectedFilter = ref('recent')
</script>

<style scoped>
.model-list-page {
  padding: 20px;
}

.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.model-count {
  display: flex;
  align-items: center;
  font-size: 18px;
}

.model-icon {
  margin-right: 8px;
}

.count {
  font-weight: bold;
}

.search-area,
.filter-area {
  display: flex;
  align-items: center;
}

.filter-area .el-select {
  width: 200px;
}

.card-list {
  margin-top: 20px;
}

.model-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.model-name {
  font-size: 16px;
  font-weight: 500;
}

.card-desc {
  flex: 1;
  margin-bottom: 8px;
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}

.card-meta {
  font-size: 13px;
  color: #999;
}

.meta-item {
  margin-right: 12px;
}

.meta-icon {
  margin-right: 4px;
}
</style>
