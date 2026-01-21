// 本地任务队列实现

import { EventEmitter } from 'events';

export interface Job<T> {
  id: string;
  data: T;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
  error?: Error;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export class LocalQueue<T> extends EventEmitter {
  private jobs: Map<string, Job<T>> = new Map();
  private queue: string[] = [];
  private concurrency: number;
  private running: number = 0;
  private processor?: (data: T) => Promise<any>;

  constructor(concurrency: number = 3) {
    super();
    this.concurrency = concurrency;
  }

  setProcessor(fn: (data: T) => Promise<any>) {
    this.processor = fn;
  }

  async add(data: T): Promise<string> {
    const id = crypto.randomUUID();
    const job: Job<T> = {
      id,
      data,
      status: 'pending',
      createdAt: new Date(),
    };

    this.jobs.set(id, job);
    this.queue.push(id);
    this.process();

    return id;
  }

  private async process() {
    if (this.running >= this.concurrency || this.queue.length === 0) {
      return;
    }

    const jobId = this.queue.shift();
    if (!jobId) return;

    const job = this.jobs.get(jobId);
    if (!job) return;

    this.running++;
    job.status = 'running';
    job.startedAt = new Date();
    this.emit('active', job);

    try {
      if (!this.processor) {
        throw new Error('No processor set for queue');
      }

      job.result = await this.processor(job.data);
      job.status = 'completed';
      job.completedAt = new Date();
      this.emit('completed', job);
    } catch (error) {
      job.status = 'failed';
      job.error = error as Error;
      job.completedAt = new Date();
      this.emit('failed', job, error);
    } finally {
      this.running--;
      this.process();
    }
  }

  getJob(id: string): Job<T> | undefined {
    return this.jobs.get(id);
  }

  getAllJobs(): Job<T>[] {
    return Array.from(this.jobs.values());
  }

  clear() {
    this.jobs.clear();
    this.queue = [];
  }
}

// 翻译任务队列数据类型
export interface TranslationJobData {
  taskId: string;
  userId: string;
  repositoryId: string;
  targetLanguages: string[];
}

// 创建全局翻译队列实例
export const translationQueue = new LocalQueue<TranslationJobData>(3);
