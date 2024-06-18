import { DateTime } from 'luxon';
import { singleton } from 'tsyringe';

@singleton()
export class BillingService {
  /**
   * Get the number of trial days remaining given the length of a full trial and
   * last trial date.
   */
  public getTrialDays({
    fullTrialDays,
    lastTrialAt,
  }: {
    fullTrialDays: number;
    lastTrialAt: null | Date;
  }) {
    if (!lastTrialAt) {
      return fullTrialDays;
    }
    const daysSinceLastTrial = Math.abs(
      DateTime.fromJSDate(lastTrialAt).diffNow('days').days,
    );
    if (daysSinceLastTrial > 90) {
      return fullTrialDays;
    }
    if (daysSinceLastTrial < fullTrialDays) {
      return Math.floor(fullTrialDays - daysSinceLastTrial);
    }
    return 0;
  }
}
