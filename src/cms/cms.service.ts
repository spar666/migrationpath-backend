import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import {
  StrapiBanner,
  StrapiCategory,
  StrapiFaq,
  StrapiGuide,
  StrapiNewsArticle,
  StrapiSuccessStory,
  StrapiPaginatedResponse,
  StrapiSingleResponse,
} from './interfaces/strapi-content.interface';
import { STRAPI_MESSAGES } from '../common/constants/strapi.constants';

@Injectable()
export class CmsService {
  private readonly logger = new Logger(CmsService.name);
  private readonly baseUrl: string;
  private readonly apiToken: string;

  constructor(private configService: ConfigService) {
    this.baseUrl =
      this.configService.get<string>('strapi.url') || 'http://localhost:1337';
    this.apiToken = this.configService.get<string>('strapi.apiToken') || '';
  }

  private get headers() {
    return this.apiToken ? { Authorization: `Bearer ${this.apiToken}` } : {};
  }

  private async fetchList<T>(
    endpoint: string,
    params?: Record<string, any>,
  ): Promise<StrapiPaginatedResponse<T>> {
    try {
      const { data } = await axios.get<StrapiPaginatedResponse<T>>(
        `${this.baseUrl}/api/${endpoint}`,
        { headers: this.headers, params },
      );
      return data;
    } catch (error: any) {
      this.handleError(error, endpoint);
    }
  }

  private async fetchOne<T>(
    endpoint: string,
    params?: Record<string, any>,
  ): Promise<StrapiSingleResponse<T>> {
    try {
      const { data } = await axios.get<StrapiSingleResponse<T>>(
        `${this.baseUrl}/api/${endpoint}`,
        { headers: this.headers, params },
      );
      return data;
    } catch (error: any) {
      this.handleError(error, endpoint);
    }
  }

  private handleError(error: any, entity: string): never {
    const status = error.response?.status;
    const entityName = entity.replace(/^\//, '');

    if (status === 403) {
      throw new HttpException(
        STRAPI_MESSAGES.FORBIDDEN(entityName),
        HttpStatus.FORBIDDEN,
      );
    }
    if (status === 401) {
      throw new HttpException(
        STRAPI_MESSAGES.UNAUTHORIZED(),
        HttpStatus.UNAUTHORIZED,
      );
    }
    if (status === 404) {
      throw new HttpException(
        STRAPI_MESSAGES.NOT_FOUND(entityName),
        HttpStatus.NOT_FOUND,
      );
    }
    if (status && status >= 500) {
      throw new HttpException(
        STRAPI_MESSAGES.SERVER_ERROR(entityName),
        HttpStatus.BAD_GATEWAY,
      );
    }

    this.logger.error(STRAPI_MESSAGES.FETCH_ERROR(entityName, error.message));
    throw new HttpException(
      STRAPI_MESSAGES.FETCH_ERROR(entityName, error.message),
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }

  async getBanners(params?: Record<string, any>) {
    const result = await this.fetchList<StrapiBanner>('banners', params);
    return result;
  }

  async getBanner(id: number) {
    return this.fetchOne<StrapiBanner>(`banners/${id}`);
  }

  async getFaqs(params?: Record<string, any>) {
    return this.fetchList<StrapiFaq>('faqs', params);
  }

  async getFaq(id: number) {
    return this.fetchOne<StrapiFaq>(`faqs/${id}`);
  }

  async getGuides(params?: Record<string, any>) {
    return this.fetchList<StrapiGuide>('guides', params);
  }

  async getGuide(id: number) {
    return this.fetchOne<StrapiGuide>(`guides/${id}`);
  }

  async getNewsArticles(params?: Record<string, any>) {
    return this.fetchList<StrapiNewsArticle>('news-articles', params);
  }

  async getNewsArticle(id: number) {
    return this.fetchOne<StrapiNewsArticle>(`news-articles/${id}`);
  }

  async getNewsArticleBySlug(slug: string) {
    const result = await this.fetchList<StrapiNewsArticle>('news-articles', {
      'filters[slug][$eq]': slug,
    });
    if (!result.data || result.data.length === 0) {
      throw new HttpException(
        `News article with slug "${slug}" not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    return { data: result.data[0], meta: result.meta };
  }

  async getSuccessStories(params?: Record<string, any>) {
    return this.fetchList<StrapiSuccessStory>('success-stories', params);
  }

  async getSuccessStory(id: number) {
    return this.fetchOne<StrapiSuccessStory>(`success-stories/${id}`);
  }

  async getCategories(params?: Record<string, any>) {
    return this.fetchList<StrapiCategory>('categories', params);
  }

  async getCategory(id: number) {
    return this.fetchOne<StrapiCategory>(`categories/${id}`);
  }

  async health() {
    try {
      const { data } = await axios.get(`${this.baseUrl}/api/banners`, {
        headers: this.headers,
        params: { 'pagination[pageSize]': 1 },
      });
      return {
        connected: true,
        message: 'Successfully connected to Strapi CMS',
        contentTypes: {
          banners: data.meta?.pagination?.total ?? 0,
        },
      };
    } catch (error: any) {
      return {
        connected: false,
        message: `Failed to connect to Strapi CMS: ${error.message}`,
      };
    }
  }
}
