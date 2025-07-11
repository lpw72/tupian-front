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

    <!-- 图片网格 -->
    <div v-if="filteredImages.length" class="image-grid">
      <div 
        v-for="image in paginatedImages" 
        :key="image.id" 
        class="image-card"
      >
        <img 
          :src="image.url" 
          :alt="image.description" 
          class="gallery-image"
          @click="openLightbox(image)"
        >
        <div class="image-info">
          <div class="description">{{ image.description }}</div>
          <div class="category">{{ image.category }}</div>
          <div class="user">上传者: {{ image.user }}</div>
        </div>
      </div>
    </div>
    
    <!-- 无结果提示 -->
    <div v-else class="no-results">
      未找到匹配的图片
    </div>

    <!-- 分页控件 -->
    <div v-if="totalPages > 1" class="pagination">
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
        <img :src="currentImage.url" :alt="currentImage.description">
        <div class="lightbox-info">
          <h3>{{ currentImage.description }}</h3>
          <p>分类: {{ currentImage.category }}</p>
          <p>上传者: {{ currentImage.user }}</p>
          <button @click="closeLightbox">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 原始图片数据
      images: [
        {id: 3, description: '人物2.jpg', url: 'http://syr2tubvx.hn-bkt.clouddn.com/人物2.jpg', user: 'admin', category: '人物'},
        {id: 4, description: '人物3.jpg', url: 'http://syr2tubvx.hn-bkt.clouddn.com/人物3.jpg', user: 'admin', category: '人物'},
        {id: 6, description: '人物5.png', url: 'http://syr2tubvx.hn-bkt.clouddn.com/人物5.png', user: 'admin', category: '人物'},
        {id: 7, description: '人物6.jpg', url: 'http://syr2tubvx.hn-bkt.clouddn.com/人物6.jpg', user: 'admin', category: '人物'},
        {id: 8, description: '其他1.jpg', url: 'http://syr2tubvx.hn-bkt.clouddn.com/其他1.jpg', user: 'admin', category: '其他'},
        {id: 9, description: '其他2.jpg', url: 'http://syr2tubvx.hn-bkt.clouddn.com/其他2.jpg', user: 'admin', category: '其他'},
        {id: 10, description: '其他3.jpg', url: 'http://syr2tubvx.hn-bkt.clouddn.com/其他3.jpg', user: 'admin', category: '其他'},
        {id: 11, description: '其他4.jpg', url: 'http://syr2tubvx.hn-bkt.clouddn.com/其他4.jpg', user: 'admin', category: '其他'},
        {id: 12, description: '文字1.jpg', url: 'http://syr2tubvx.hn-bkt.clouddn.com/文字1.jpg', user: 'admin', category: '文字'},
        {id: 13, description: '文字2.jpg', url: 'http://syr2tubvx.hn-bkt.clouddn.com/文字2.jpg', user: 'admin', category: '文字'},
        {id: 14, description: '文字3.jpg', url: 'http://syr2tubvx.hn-bkt.clouddn.com/文字3.jpg', user: 'admin', category: '文字'},
        {id: 15, description: '文字4.jpg', url: 'http://syr2tubvx.hn-bkt.clouddn.com/文字4.jpg', user: 'admin', category: '文字'},
        {id: 16, description: '文字5.jpg', url: 'http://syr2tubvx.hn-bkt.clouddn.com/文字5.jpg', user: 'admin', category: '文字'},
        {id: 17, description: '风景1.jpg', url: 'http://syr2tubvx.hn-bkt.clouddn.com/风景1.jpg', user: 'admin', category: '风景'},
        {id: 18, description: '风景2.jpg', url: 'http://syr2tubvx.hn-bkt.clouddn.com/风景2.jpg', user: 'admin', category: '风景'},
        {id: 19, description: '风景3.jpg', url: 'http://syr2tubvx.hn-bkt.clouddn.com/风景3.jpg', user: 'admin', category: '风景'},
        {id: 20, description: '风景4.jpg', url: 'http://syr2tubvx.hn-bkt.clouddn.com/风景4.jpg', user: 'admin', category: '风景'},
        {id: 21, description: '测试文件', url: 'http://syr2tubvx.hn-bkt.clouddn.com/人物/test.jpg', user: 'admin', category: '其他'},
        {id: 22, description: '全球', url: 'http://syr2tubvx.hn-bkt.clouddn.com/太阳.jpg', user: 'admin', category: '风景'},
        {id: 23, description: '呃呃7', url: 'http://syr2tubvx.hn-bkt.clouddn.com/太阳.jpg', user: '李四', category: '其他'},
        {id: 24, description: '呃呃', url: 'http://syr2tubvx.hn-bkt.clouddn.com/0317b2856a0b5e50000017d8957ac7a.jpg@260w_195h_1c_1e_1o_100sh.jpg', user: '李四', category: '风景'}
      ],
      selectedCategory: 'all', // 当前选中的分类
      searchQuery: '',          // 搜索关键词
      currentPage: 1,           // 当前页码
      pageSize: 9,              // 每页显示数量
      lightboxVisible: false,   // 是否显示大图预览
      currentImage: null        // 当前预览的图片
    };
  },
  computed: {
    // 提取唯一分类列表
    uniqueCategories() {
      return [...new Set(this.images.map(img => img.category))];
    },
    
    // 过滤后的图片列表
    filteredImages() {
      return this.images.filter(img => {
        // 分类过滤
        const categoryMatch = this.selectedCategory === 'all' || 
                             img.category === this.selectedCategory;
        
        // 搜索过滤
        const searchMatch = this.searchQuery === '' || 
                          img.description.toLowerCase().includes(this.searchQuery.toLowerCase());
        
        return categoryMatch && searchMatch;
      });
    },
    
    // 分页后的图片列表
    paginatedImages() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.filteredImages.slice(start, end);
    },
    
    // 总页数
    totalPages() {
      return Math.ceil(this.filteredImages.length / this.pageSize);
    }
  },
  methods: {
    // 当筛选条件变化时重置页码
    filterImages() {
      this.currentPage = 1;
    },
    
    // 打开图片预览
    openLightbox(image) {
      this.currentImage = image;
      this.lightboxVisible = true;
      document.body.style.overflow = 'hidden'; // 禁止背景滚动
    },
    
    // 关闭图片预览
    closeLightbox() {
      this.lightboxVisible = false;
      document.body.style.overflow = ''; // 恢复背景滚动
    }
  },
  watch: {
    // 当前页变化时滚动到顶部
    currentPage() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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
</style>