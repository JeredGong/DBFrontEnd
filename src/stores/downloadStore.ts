// src/stores/downloadStore.ts
import { defineStore } from 'pinia';

// 定义下载记录的数据结构
interface DownloadRecord {
  title: string;
  link: string;
  url: string; // 用于保存 Blob URL
}

const MAX_SIZE = 10;  // 队列的最大大小

// 使用 defineStore 定义一个 Pinia store
export const useDownloadStore = defineStore('downloadStore', {
  state: () => ({
    // downloads 数组存储 DownloadRecord 类型的对象
    downloads: [] as DownloadRecord[],
  }),

  actions: {
    // 添加新的下载记录
    addDownload(title: string, link: string, url: string) {
      // 先检查是否有重复的 title
      const existingIndex = this.downloads.findIndex(record => record.title === title);
      
      if (existingIndex !== -1) {
        // 如果找到了重复的 title，移到队列的第一位
        const existingRecord = this.downloads.splice(existingIndex, 1)[0];
        this.downloads.unshift(existingRecord); // 将记录放到队列的最前面
      } else {
        // 如果没有重复的 title，正常添加新的记录
        if (this.downloads.length >= MAX_SIZE) {
          // 队列满了时，移除最早的记录，并清理其 URL
          const removedRecord = this.downloads.shift();
          if (removedRecord) {
            window.URL.revokeObjectURL(removedRecord.url); // 清理 URL
          }
        }
        // 将新的下载记录添加到队列末尾
        this.downloads.push({ title, link, url });
      }
    },
  },

  getters: {
    // 获取所有下载记录
    getDownloads(state): DownloadRecord[] {
      return state.downloads;
    },
  },
});
