import { config } from '@/server/config';
import { errorHandler, sendError } from '@/server/lib/api';
import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { minify } from 'uglify-js';

const router = createRouter<NextApiRequest, NextApiResponse>();

router.get((req, res) => {
  const { id } = req.query;

  if (typeof id !== 'string') {
    return sendError(res, 'BadRequest', { message: 'Missing id' });
  }

  res.setHeader('content-type', 'text/javascript');

  const loader = `
  (async () => {
    window.neutekLocatorId = '${id}';

    const filesUrl = '${config.WIDGET_BASE_URL}/files.txt';
    let filesResponse;
    let filesText;
    try {
      filesResponse = await fetch(filesUrl);
      if (!filesResponse.ok) {
        throw new Error('Failed response');
      }
      filesText = await filesResponse.text();
    } catch (err) {
      const errorElement = document.createElement('div');
      errorElement.innerText = 'Failed to load locator';
      document.querySelector('#NeutekLocator')?.appendChild(errorElement);
      return;
    }

    const files = filesText.split('\\n').filter((file) => !!file);

    files.forEach((fileWithType) => {
      const [type, file] = fileWithType.split(':');
      const src = '${config.WIDGET_BASE_URL}' + \`/static/\${type}/\${file}\`;

      if (type === 'js') {
        const script = document.createElement('script');
        script.src = src;
        document.body.appendChild(script);
      } else if (type === 'css') {
        const link = document.createElement('link');
        link.href = src;
        link.rel = 'stylesheet';
        document.body.appendChild(link);
      }
    });
  })();
`;

  return res.send(minify(loader).code);
});

export default router.handler({
  onError: errorHandler,
});
