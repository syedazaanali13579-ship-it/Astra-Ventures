import { Injectable, OnModuleInit } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { CreateSubmissionDto } from './create-submission.dto';
import { StoredSubmission } from './submissions.controller';
import { CreateLpSubmissionDto, StoredLpSubmission } from './create-lp-submission.dto';
import { writeJsonAtomically } from '../json-storage';

@Injectable()
export class SubmissionsService implements OnModuleInit {
  private readonly filePath = join(process.cwd(), 'data', 'submissions.json');
  private readonly lpFilePath = join(process.cwd(), 'data', 'lp-submissions.json');
  private writeQueue: Promise<void> = Promise.resolve();
  private lpWriteQueue: Promise<void> = Promise.resolve();

  async onModuleInit(): Promise<void> {
    await mkdir(join(process.cwd(), 'data'), { recursive: true });
    try {
      await readFile(this.filePath, 'utf8');
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
      await writeFile(this.filePath, '[]', 'utf8');
    }
    try {
      await readFile(this.lpFilePath, 'utf8');
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
      await writeFile(this.lpFilePath, '[]', 'utf8');
    }
  }

  async create(submission: CreateSubmissionDto): Promise<{ id: string; createdAt: string }> {
    const stored: StoredSubmission = {
      ...submission,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
    };
    const operation = this.writeQueue.then(async () => {
      const submissions = await this.readSubmissions();
      submissions.push(stored);
      await writeJsonAtomically(this.filePath, submissions);
    });
    this.writeQueue = operation.catch(() => undefined);
    await operation;
    return { id: stored.id, createdAt: stored.createdAt };
  }

  async getAll(): Promise<StoredSubmission[]> {
    return this.readSubmissions();
  }

  async createLpInquiry(submission: CreateLpSubmissionDto): Promise<{ id: string; createdAt: string }> {
    const stored: StoredLpSubmission = {
      ...submission,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
    };
    const operation = this.lpWriteQueue.then(async () => {
      const inquiries = await this.readLpInquiries();
      inquiries.push(stored);
      await writeJsonAtomically(this.lpFilePath, inquiries);
    });
    this.lpWriteQueue = operation.catch(() => undefined);
    await operation;
    return { id: stored.id, createdAt: stored.createdAt };
  }

  async getLpInquiries(): Promise<StoredLpSubmission[]> {
    return this.readLpInquiries();
  }

  private async readSubmissions(): Promise<StoredSubmission[]> {
    const raw: unknown = JSON.parse(await readFile(this.filePath, 'utf8'));
    if (!Array.isArray(raw)) throw new Error('Submission storage must contain a JSON array.');
    return raw as StoredSubmission[];
  }

  private async readLpInquiries(): Promise<StoredLpSubmission[]> {
    const raw: unknown = JSON.parse(await readFile(this.lpFilePath, 'utf8'));
    if (!Array.isArray(raw)) throw new Error('LP inquiry storage must contain a JSON array.');
    return raw as StoredLpSubmission[];
  }
}
