import { singleton } from 'tsyringe';
import got from 'got';
import { config } from '../config';

@singleton()
export class SlackService {
  public async postInstallMessage({
    name,
    domain,
    email,
    ownerName,
  }: {
    name: string;
    domain: string;
    email: string;
    ownerName: string;
  }) {
    await got.post('https://slack.com/api/chat.postMessage', {
      headers: {
        Authorization: `Bearer ${config.SLACK_TOKEN}`,
      },
      json: {
        channel: config.SLACK_INSTALL_CHANNEL,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*New install* :tada:\n*Name:* ${name}\n*Domain:* ${domain}\n*Email:* ${email}\n*Owner name:* ${ownerName}`,
            },
          },
        ],
      },
    });
  }

  public async postUninstallMessage({
    name,
    domain,
    email,
    ownerName,
  }: {
    name: string;
    domain: string;
    email: string;
    ownerName: string;
  }) {
    await got.post('https://slack.com/api/chat.postMessage', {
      headers: {
        Authorization: `Bearer ${config.SLACK_TOKEN}`,
      },
      json: {
        channel: config.SLACK_UNINSTALL_CHANNEL,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*New uninstall* :cry:\n*Name:* ${name}\n*Domain:* ${domain}\n*Email:* ${email}\n*Owner name:* ${ownerName}`,
            },
          },
        ],
      },
    });
  }
}
