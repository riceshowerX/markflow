// 文档类型定义
export interface Document {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  isFavorite: boolean;
  tags: string[];
  wordCount: number;
}

// 文档管理类
class DocumentManager {
  private readonly STORAGE_KEY = 'markdown-documents';
  private documents: Map<string, Document> = new Map();
  private currentDocumentId: string | null = null;

  constructor() {
    this.loadFromStorage();
  }

  // 从 localStorage 加载文档
  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        const docs = JSON.parse(data) as Document[];
        docs.forEach(doc => {
          this.documents.set(doc.id, doc);
        });
      }
      
      const currentId = localStorage.getItem('current-document-id');
      if (currentId && this.documents.has(currentId)) {
        this.currentDocumentId = currentId;
      }
    } catch (e) {
      console.error('Failed to load documents:', e);
    }
  }

  // 保存到 localStorage
  private saveToStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const docs = Array.from(this.documents.values());
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(docs));
      if (this.currentDocumentId) {
        localStorage.setItem('current-document-id', this.currentDocumentId);
      }
    } catch (e) {
      console.error('Failed to save documents:', e);
    }
  }

  // 生成唯一 ID
  private generateId(): string {
    return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 创建新文档
  createDocument(title: string = '无标题文档', content: string = ''): Document {
    const now = Date.now();
    const doc: Document = {
      id: this.generateId(),
      title,
      content,
      createdAt: now,
      updatedAt: now,
      isFavorite: false,
      tags: [],
      wordCount: content.trim() ? content.trim().split(/\s+/).length : 0,
    };
    
    this.documents.set(doc.id, doc);
    this.currentDocumentId = doc.id;
    this.saveToStorage();
    return doc;
  }

  // 获取文档
  getDocument(id: string): Document | undefined {
    return this.documents.get(id);
  }

  // 获取当前文档
  getCurrentDocument(): Document | undefined {
    if (!this.currentDocumentId) {
      // 如果没有当前文档，创建一个新的
      return this.createDocument();
    }
    return this.documents.get(this.currentDocumentId);
  }

  // 更新文档
  updateDocument(id: string, updates: Partial<Document>): Document | undefined {
    const doc = this.documents.get(id);
    if (!doc) return undefined;
    
    const updatedDoc: Document = {
      ...doc,
      ...updates,
      updatedAt: Date.now(),
      wordCount: updates.content !== undefined 
        ? (updates.content.trim() ? updates.content.trim().split(/\s+/).length : 0)
        : doc.wordCount,
    };
    
    this.documents.set(id, updatedDoc);
    this.saveToStorage();
    return updatedDoc;
  }

  // 删除文档
  deleteDocument(id: string): boolean {
    if (!this.documents.has(id)) return false;
    
    this.documents.delete(id);
    if (this.currentDocumentId === id) {
      this.currentDocumentId = null;
    }
    this.saveToStorage();
    return true;
  }

  // 复制文档
  duplicateDocument(id: string): Document | undefined {
    const doc = this.documents.get(id);
    if (!doc) return undefined;
    
    return this.createDocument(`${doc.title} (副本)`, doc.content);
  }

  // 设置当前文档
  setCurrentDocument(id: string): Document | undefined {
    if (!this.documents.has(id)) return undefined;
    this.currentDocumentId = id;
    this.saveToStorage();
    return this.documents.get(id);
  }

  // 获取所有文档
  getAllDocuments(): Document[] {
    return Array.from(this.documents.values())
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }

  // 获取收藏的文档
  getFavoriteDocuments(): Document[] {
    return this.getAllDocuments().filter(doc => doc.isFavorite);
  }

  // 切换收藏状态
  toggleFavorite(id: string): Document | undefined {
    const doc = this.documents.get(id);
    if (!doc) return undefined;
    
    return this.updateDocument(id, { isFavorite: !doc.isFavorite });
  }

  // 搜索文档
  searchDocuments(query: string): Document[] {
    const lowerQuery = query.toLowerCase();
    return this.getAllDocuments().filter(doc => 
      doc.title.toLowerCase().includes(lowerQuery) ||
      doc.content.toLowerCase().includes(lowerQuery) ||
      doc.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  // 添加标签
  addTag(id: string, tag: string): Document | undefined {
    const doc = this.documents.get(id);
    if (!doc) return undefined;
    
    if (!doc.tags.includes(tag)) {
      return this.updateDocument(id, { tags: [...doc.tags, tag] });
    }
    return doc;
  }

  // 移除标签
  removeTag(id: string, tag: string): Document | undefined {
    const doc = this.documents.get(id);
    if (!doc) return undefined;
    
    return this.updateDocument(id, { 
      tags: doc.tags.filter(t => t !== tag) 
    });
  }

  // 获取统计信息
  getStats(): { totalDocs: number; totalWords: number; totalChars: number } {
    let totalWords = 0;
    let totalChars = 0;
    
    this.documents.forEach(doc => {
      totalWords += doc.wordCount;
      totalChars += doc.content.length;
    });
    
    return {
      totalDocs: this.documents.size,
      totalWords,
      totalChars,
    };
  }

  // 导出所有文档
  exportAllDocuments(): string {
    const docs = Array.from(this.documents.values());
    return JSON.stringify(docs, null, 2);
  }

  // 导入文档
  importDocuments(jsonData: string): number {
    try {
      const docs = JSON.parse(jsonData) as Document[];
      let imported = 0;
      
      docs.forEach(doc => {
        if (doc.id && doc.title && doc.content !== undefined) {
          // 为导入的文档生成新 ID，避免冲突
          const newDoc: Document = {
            ...doc,
            id: this.generateId(),
            createdAt: doc.createdAt || Date.now(),
            updatedAt: Date.now(),
          };
          this.documents.set(newDoc.id, newDoc);
          imported++;
        }
      });
      
      this.saveToStorage();
      return imported;
    } catch (e) {
      console.error('Failed to import documents:', e);
      return 0;
    }
  }

  // 清空所有文档
  clearAllDocuments(): void {
    this.documents.clear();
    this.currentDocumentId = null;
    this.saveToStorage();
  }
}

// 导出单例
export const documentManager = new DocumentManager();
