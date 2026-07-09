import { Injectable } from '@nestjs/common';
import { AdminRepository } from './admin.repository';

@Injectable()
export class AdminService {
  constructor(private readonly adminRepository: AdminRepository) {}

  async getDashboardSummary(userId: string) {
    return this.adminRepository.getSummary(userId);
  }

  async getActivityLog(page: number, limit: number) {
    return this.adminRepository.getActivityLogsWithProfiles(page, limit);
  }
}
