import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SiteConfig } from './entities/site-config.entity';
import { UpdateSiteConfigDto } from './dto/update-site-config.dto';

/** Default site configuration — matches the frontend SiteConfigEditor defaults. */
const DEFAULT_CONFIG: Record<string, any> = {
  home: {
    heroHeadline: 'Your Pathway to Australian Migration',
    heroSubtext:
      'Navigate the 2026 migration landscape with expert-led strategy tools and real-time points optimization.',
    heroImage: '',
    primaryCta: 'Get Started',
    secondaryCta: 'Check My Points',
    outlookTitle: '2026 Migration Outlook',
    outlookDescription:
      'Australia is shifting toward a skills-first model. The new Skills in Demand (SID) visa offers a 2-year pathway to PR for eligible professionals.',
    processingTimeHealthcare: '7 Days',
    processingTimeTech: '14 Days',
    benefits: [
      'MARA Registered Agents',
      '2026 Priority Lists',
      'Real-Time Points Optimizer',
    ],
  },
  student: {
    heroHeadline: 'Study Your Way to Australian PR',
    heroSubtext:
      'Strategic course selection that maximizes your points and accelerates your permanent residency pathway.',
    heroImage: '',
    primaryCta: 'Find Your Course',
    secondaryCta: 'Calculate Points',
    benefits: [
      'Regional Study Bonus',
      'Post-Study Work Rights',
      'Direct PR Pathways',
    ],
  },
  skilled: {
    heroHeadline: 'Skilled Migration Made Simple',
    heroSubtext:
      'Expert guidance for 189, 190, and 491 visa pathways. Real-time state nomination insights.',
    heroImage: '',
    primaryCta: 'Check Eligibility',
    secondaryCta: 'State Requirements',
    benefits: [
      'EOI Optimization',
      'State Priority Matching',
      'Skills Assessment Support',
    ],
  },
  partner: {
    heroHeadline: 'Partner Visa Pathways',
    heroSubtext:
      'Comprehensive support for partner and prospective marriage visa applications.',
    heroImage: '',
    primaryCta: 'Start Application',
    secondaryCta: 'Evidence Checklist',
    benefits: [
      'Evidence Planning',
      'Timeline Management',
      'Relationship Documentation',
    ],
  },
  onshore: {
    heroHeadline: 'Onshore to PR Strategy',
    heroSubtext:
      'Transform your temporary visa into permanent residency with our strategic audit and planning tools.',
    heroImage: '',
    primaryCta: 'Get Strategy Audit',
    secondaryCta: 'Calculate My Points',
    benefits: [
      'Visa Bridge Planning',
      'Work Experience Tracking',
      'Points Optimization',
    ],
  },
  footer: {
    maraStatement:
      'MigrationPath is operated by registered migration agents. MARA Registration: XXXXXX',
    quickLinks: ['Home', 'Points Calculator', 'News', 'Contact'],
    resourceLinks: [
      '2026 Priority Occupation List',
      'State Nomination Requirements',
      'Processing Times',
    ],
  },
};

const CONFIG_KEY = 'site_config';

@Injectable()
export class SiteConfigService {
  private readonly logger = new Logger(SiteConfigService.name);

  constructor(
    @InjectRepository(SiteConfig)
    private readonly repo: Repository<SiteConfig>,
  ) {}

  /**
   * Return the current site configuration.
   * Falls back to the built-in default if no row exists yet.
   */
  async getConfig(): Promise<Record<string, any>> {
    const row = await this.repo.findOne({ where: { configKey: CONFIG_KEY } });
    if (row) {
      return row.configData;
    }
    this.logger.log('No site_config row found — returning built-in defaults');
    return DEFAULT_CONFIG;
  }

  /**
   * Upsert the full site configuration.
   * Creates the row on first save, updates on subsequent saves.
   */
  async updateConfig(
    dto: UpdateSiteConfigDto,
    userId?: string,
  ): Promise<Record<string, any>> {
    let row = await this.repo.findOne({ where: { configKey: CONFIG_KEY } });

    if (row) {
      row.configData = dto as any;
      row.updatedBy = userId ?? null;
    } else {
      row = this.repo.create({
        configKey: CONFIG_KEY,
        configData: dto as any,
        updatedBy: userId ?? null,
      });
    }

    const saved = await this.repo.save(row);
    this.logger.log(`Site config updated by user ${userId ?? 'unknown'}`);
    return saved.configData;
  }
}
