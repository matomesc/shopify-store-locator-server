import { singleton } from 'tsyringe';
import { prisma } from '../lib/prisma';

@singleton()
export class SettingsService {
  public async upsertSettings({
    shopId,
    googleMapsApiKey,
    timezone,
  }: {
    shopId: string;
    googleMapsApiKey: string;
    timezone: string;
  }) {
    return prisma.settings.upsert({
      where: {
        shopId,
      },
      create: {
        shopId,
        googleMapsApiKey,
        timezone,
      },
      update: {
        googleMapsApiKey,
        timezone,
      },
    });
  }
}
