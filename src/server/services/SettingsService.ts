import { singleton } from 'tsyringe';
import { prisma } from '../lib/prisma';

@singleton()
export class SettingsService {
  public async upsertSettings({
    shopId,
    googleMapsApiKey,
  }: {
    shopId: string;
    googleMapsApiKey: string | null;
  }) {
    return prisma.settings.upsert({
      where: {
        shopId,
      },
      create: {
        googleMapsApiKey,
        shopId,
      },
      update: {
        googleMapsApiKey,
      },
    });
  }
}
