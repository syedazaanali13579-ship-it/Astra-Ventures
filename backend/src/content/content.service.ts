import { BadRequestException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { writeJsonAtomically } from '../json-storage';
import { TeamMember } from '../team-member';

@Injectable()
export class ContentService implements OnModuleInit {
  private readonly filePath = join(process.cwd(), 'data', 'content.json');
  private writeQueue: Promise<void> = Promise.resolve();

  async onModuleInit(): Promise<void> {
    await mkdir(join(process.cwd(), 'data'), { recursive: true });
    try {
      await readFile(this.filePath, 'utf8');
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
      await writeFile(this.filePath, '{}', 'utf8');
    }
  }

  async getAll(): Promise<Record<string, unknown>> {
    return this.readContent();
  }

  async update(key: string, value: unknown): Promise<Record<string, unknown>> {
    if (!/^[a-zA-Z0-9_-]+$/.test(key) || value === undefined) {
      throw new BadRequestException('Provide a valid content key and value.');
    }
    if (key === 'teamMembers') this.validateTeamMembers(value);
    let updated: Record<string, unknown> = {};
    const operation = this.writeQueue.then(async () => {
      const content = await this.readContent();
      if (!(key in content)) throw new NotFoundException(`Content key "${key}" does not exist.`);
      updated = { ...content, [key]: value };
      await writeJsonAtomically(this.filePath, updated);
    });
    this.writeQueue = operation.catch(() => undefined);
    await operation;
    return updated;
  }

  private validateTeamMembers(value: unknown): asserts value is TeamMember[] {
    if (!Array.isArray(value)) throw new BadRequestException('Team members must be an array.');
    const ids = new Set<string>();
    for (const member of value) {
      if (!member || typeof member !== 'object' || Array.isArray(member)) {
        throw new BadRequestException('Each team member must be an object.');
      }
      const candidate = member as Partial<TeamMember>;
      if (typeof candidate.id !== 'string' || !candidate.id.trim() || ids.has(candidate.id) ||
          typeof candidate.name !== 'string' || !candidate.name.trim() || candidate.name.length > 120 ||
          typeof candidate.role !== 'string' || !candidate.role.trim() || candidate.role.length > 120 ||
          typeof candidate.bio !== 'string' || !candidate.bio.trim() || candidate.bio.length > 2000 ||
          !Array.isArray(candidate.affiliations) ||
          !candidate.affiliations.every((affiliation) => typeof affiliation === 'string' && affiliation.trim().length > 0 && affiliation.length <= 100) ||
          typeof candidate.linkedinUrl !== 'string') {
        throw new BadRequestException('Team member fields are invalid.');
      }
      if (candidate.linkedinUrl) {
        let url: URL;
        try {
          url = new URL(candidate.linkedinUrl);
        } catch {
          throw new BadRequestException('LinkedIn links must be valid HTTPS URLs.');
        }
        if (url.protocol !== 'https:' || url.hostname !== 'www.linkedin.com') {
          throw new BadRequestException('LinkedIn links must use https://www.linkedin.com.');
        }
      }
      ids.add(candidate.id);
    }
  }

  private async readContent(): Promise<Record<string, unknown>> {
    const raw: unknown = JSON.parse(await readFile(this.filePath, 'utf8'));
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      throw new Error('Content storage must contain a JSON object.');
    }
    return raw as Record<string, unknown>;
  }
}
