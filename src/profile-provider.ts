import type {
  ProfileProvider,
  ClientProfile,
  ClientTier,
} from './bonus-service';

export class HttpProfileProvider implements ProfileProvider {
  constructor(private baseUrl: string) {}

  async getProfile(clientId: string): Promise<ClientProfile> {
    const response = await fetch(`${this.baseUrl}/clients/${clientId}`);
    if (!response.ok) {
      throw new Error('PROFILE_UNAVAILABLE');
    }

    const data = await response.json();

    if (
      !data ||
      typeof data.id !== 'string' ||
      typeof data.name !== 'string' ||
      typeof data.multiplier !== 'number' ||
      typeof data.isActive !== 'boolean'
    ) {
      throw new Error('INVALID_PROFILE_FORMAT');
    }

    return {
      id: data.id,
      name: data.name,
      tier: (data.tier as ClientTier) || 'standard',
      isActive: data.isActive,
      multiplier: data.multiplier,
    };
  }
}
