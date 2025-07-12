<template>
  <div class="image-gallery">
    <!-- 分类筛选 -->
    <div class="filters">
      <select v-model="selectedCategory" @change="filterImages">
        <option value="all">全部</option>
        <option v-for="cat in uniqueCategories" :key="cat" :value="cat">
          {{ cat }}
        </option>
      </select>
      
      <input 
        type="text" 
        v-model="searchQuery" 
        placeholder="搜索图片描述..."
        @input="filterImages"
      >
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="error-message">{{ error }}</div>

    <!-- 图片网格 -->
    <div v-else-if="filteredFiles.length" class="file-grid">
      <div 
        v-for="file in paginatedFiles" 
        :key="file.id" 
        class="file-card"
      >
        <!-- 媒体容器 - 统一图片和视频的容器样式 -->
        <div class="media-container">
          <img 
            v-if="file.type === 'image'"
            :src="file.url" 
            :alt="file.description" 
            class="gallery-media"
            @click="openLightbox(file)"
          >
          <video 
            v-else-if="file.type === 'video'"
            :src="file.url" 
            :alt="file.description" 
            class="gallery-media"
            @click="openLightbox(file)"
            poster
          >
          </video>
          <div v-if="file.type === 'video'" class="play-overlay" @click.stop="openLightbox(file)">
            <div class="play-icon">▶</div>
          </div>
          <div class="file-type-badge">{{ file.type === 'image' ? '图片' : '视频' }}</div>
        </div>

        <div class="file-info">
          <div class="description">{{ file.description }}</div>
          <div class="category">{{ file.category }}</div>
          <div class="user">上传者: {{ file.user }}</div>
        </div>
      </div>
    </div>
    
    <!-- 无结果提示 -->
    <div v-else class="no-results">
      未找到匹配的图片
    </div>

    <!-- 分页控件 -->
    <div v-if="!loading && !error && totalPages > 1" class="pagination">
      <button 
        :disabled="currentPage === 1" 
        @click="currentPage--"
      >
        &laquo; 上一页
      </button>
      
      <span class="page-info">
        第 {{ currentPage }} 页 / 共 {{ totalPages }} 页
      </span>
      
      <button 
        :disabled="currentPage >= totalPages" 
        @click="currentPage++"
      >
        下一页 &raquo;
      </button>
    </div>
    
    <!-- 图片预览弹窗 -->
    <div v-if="lightboxVisible" class="lightbox" @click.self="closeLightbox">
      <div class="lightbox-content">
        <!-- 图片预览 -->
        <img 
          v-if="currentFile.type === 'image'"
          :src="currentFile.url" 
          :alt="currentFile.description"
          class="lightbox-media"
        >
    
        <!-- 视频预览 -->
        <video 
          v-else-if="currentFile.type === 'video'"
          :src="currentFile.url" 
          :alt="currentFile.description"
          class="lightbox-media"
          controls
        >
          您的浏览器不支持视频播放
        </video>
    
        <div class="lightbox-info">
          <h3>{{ currentFile.description }}</h3>
          <p>类型: {{ currentFile.type === 'image' ? '图片' : '视频' }}</p>
          <p>分类: {{ currentFile.category }}</p>
          <p>上传者: {{ currentFile.user }}</p>
          <button @click="closeLightbox">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import apiService from '../services/api';

export default {
  data() {
    return {
      files: [], // 重命名为更通用的files数组
      selectedCategory: 'all',
      searchQuery: '',
      currentPage: 1,
      pageSize: 12,
      lightboxVisible: false,
      currentFile: null, // 重命名为currentFile
      loading: true,
      error: null
    };
  },
  computed: {
    uniqueCategories() {
      return [...new Set(this.files.map(file => file.category))];
    },
    
    filteredFiles() {
      return this.files.filter(file => {
        const categoryMatch = this.selectedCategory === 'all' || 
                             file.category === this.selectedCategory;
        
        const searchMatch = this.searchQuery === '' || 
                           file.description.toLowerCase().includes(this.searchQuery.toLowerCase());
        
        return categoryMatch && searchMatch;
      });
    },
    
    paginatedFiles() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.filteredFiles.slice(start, end);
    },
    
    totalPages() {
      return Math.ceil(this.filteredFiles.length / this.pageSize);
    }
  },
  methods: {
    filterImages() {
      this.currentPage = 1;
    },
    
    openLightbox(file) {
      this.currentFile = file; // Fixed: changed from currentImage to currentFile
      this.lightboxVisible = true;
      document.body.style.overflow = 'hidden';
    },
    
    closeLightbox() {
      this.lightboxVisible = false;
      document.body.style.overflow = '';
    },
    
    // 新增：从API获取图片数据
    async fetchImages() {
      try {
        this.loading = true;
        const response = await apiService.getFiles();
        // 处理文件数据，添加类型判断
        this.files = (response.data.results || response.data).map(file => {
          // 根据URL扩展名判断文件类型
          const ext = file.url.split('.').pop().toLowerCase();
          const videoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'];
          return {
            ...file,
            type: videoExtensions.includes(ext) ? 'video' : 'image'
          };
        });
        this.error = null;
      } catch (err) {
        console.error('获取图片失败:', err);
        // 显示详细错误信息
        this.error = `获取图片列表失败: ${err.response?.data?.detail || err.message}`;
        this.images = [];
      } finally {
        this.loading = false;
      }
    }
  },
  watch: {
    currentPage() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  },
  // 组件创建时获取数据
  created() {
    this.fetchImages();
  }
};
</script>

<style scoped>
.image-gallery {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.filters {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.filters select, .filters input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.filters input {
  flex: 1;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.file-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 24px;
}

.media-container {
  position: relative;
  width: 100%;
  border-radius: 8px 8px 0 0;
  overflow: hidden;
  background-color: #f5f5f5;
}

.gallery-media {
  width: 100%;
  aspect-ratio: 4/3;
  object-fit: cover;
  display: block;
  cursor: pointer;
}

/* 响应式调整 */
@media (max-width: 1024px) {
  .file-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .file-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 16px;
  }
}

@media (max-width: 480px) {
  .file-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
  }
}

.media-container {
  position: relative;
  width: 100%;
  height: auto;
}

.gallery-image, .gallery-video {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
  cursor: pointer;
  border-bottom: none;
}

/* 视频播放覆盖层 */
.play-overlay {
  position: absolute;
  top: 0;
  left: 1;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0 , 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.play-icon {
  color: white;
  font-size: 40px;
}

/* 文件类型标签 */
.file-type-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0,0,0,0.7);
  color: white;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.8em;
}

/* 预览弹窗媒体样式 */
.lightbox-media {
  max-height: 80vh;
  max-width: 70%;
  object-fit: contain;
}
.image-card {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  background: white;
}

.image-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.gallery-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
  cursor: pointer;
  border-bottom: 1px solid #eee;
}

.image-info {
  padding: 12px;
}

.description {
  font-weight: bold;
  margin-bottom: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.category {
  display: inline-block;
  background: #f0f7ff;
  color: #1a73e8;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.85em;
  margin-top: 5px;
}

.user {
  color: #666;
  font-size: 0.9em;
  margin-top: 8px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 30px;
  gap: 15px;
}

.pagination button {
  padding: 8px 16px;
  background: #f8f9fa;
  border: 1px solid #dadce0;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination button:not(:disabled):hover {
  background: #e8eaed;
}

.page-info {
  font-size: 0.95em;
  color: #5f6368;
}

.lightbox {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.lightbox-content {
  display: flex;
  max-width: 90%;
  max-height: 90%;
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.lightbox-content img {
  max-height: 80vh;
  max-width: 70%;
  object-fit: contain;
}

.lightbox-info {
  padding: 20px;
  width: 300px;
  display: flex;
  flex-direction: column;
}

.lightbox-info h3 {
  margin-top: 0;
  margin-bottom: 15px;
}

.lightbox-info p {
  margin: 5px 0;
  color: #555;
}

.lightbox-info button {
  margin-top: auto;
  padding: 10px;
  background: #1a73e8;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.no-results {
  text-align: center;
  padding: 40px;
  font-size: 18px;
  color: #666;
}

/* 添加加载状态样式 */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #42b983;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 错误提示样式 */
.error-message {
  color: #ff4444;
  text-align: center;
  padding: 20px;
  background-color: #ffebee;
  border-radius: 4px;
  margin-bottom: 20px;
}
</style>
