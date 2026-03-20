import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { AppConfig } from './app-config.model';

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private static config: AppConfig | null = null;

  private readonly http = inject(HttpClient);

  load() {
    return this.http
      .get<AppConfig>('/assets/config.json')
      .pipe(tap((config) => (ConfigService.config = config)));
  }

  get<K extends keyof AppConfig>(key: K): AppConfig[K] {
    if (!ConfigService.config) {
      throw new Error('ConfigService: config not loaded yet.');
    }
    return ConfigService.config[key];
  }

  getAll(): AppConfig {
    if (!ConfigService.config) {
      throw new Error('ConfigService: config not loaded yet.');
    }
    return ConfigService.config;
  }
}
