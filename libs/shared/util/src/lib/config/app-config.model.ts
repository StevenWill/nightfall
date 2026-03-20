export interface AppConfig {
  tenantId: string;
  tenantName: string;
  apiBaseUrl: string;
  features: {
    investments: boolean;
    userProfile: boolean;
  };
}
