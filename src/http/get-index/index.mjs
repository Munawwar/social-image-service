import htm from 'htm';
import satori from 'satori';
import { promises } from 'node:fs';
import path, { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { WIDTH, HEIGHT } from './constants.mjs';
import getOpenGraphJsx from './get-open-graph-jsx.mjs';
import jsxToObject from './jsxToObject.mjs';

let Resvg;

if (process.env.ARC_ENV === 'production') {
  let imports = await import('./@resvg/resvg-js/index.js');
  Resvg = imports.Resvg;
} else {
  let imports = await import('@resvg/resvg-js');
  Resvg = imports.Resvg;
}
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const html = htm.bind(jsxToObject);

const openSansRegularFilePath = join(
  __dirname,
  './open-sans/static/OpenSans/OpenSans-Regular.ttf'
);
const openSansSemiBoldFilePath = join(
  __dirname,
  './open-sans/static/OpenSans/OpenSans-SemiBold.ttf'
);
const openSansBoldFilePath = join(
  __dirname,
  './open-sans/static/OpenSans/OpenSans-Bold.ttf'
);
let openSansRegularBuffer;
let openSansSemiBoldBuffer;
let openSansBoldBuffer;

// learn more abo∏ut HTTP functions here: https://arc.codes/http
/**
 * 
 * @param {import('@types/aws-lambda').APIGatewayProxyEventV2} req 
 * @returns 
 */
export async function handler (req) {
  console.log(req);
  if (req.rawPath !== '/') {
    return { statusCode: 404, body: '' };
  }
  const params = new URLSearchParams(req.rawQueryString);
  if (!params.has('title')) {
    return { statusCode: 400, body: 'Please specify title to render' };
  }

  if (!openSansRegularBuffer) {
    openSansRegularBuffer = await promises.readFile(openSansRegularFilePath);
    openSansSemiBoldBuffer = await promises.readFile(openSansSemiBoldFilePath);
    openSansBoldBuffer = await promises.readFile(openSansSemiBoldFilePath);
  }

  const t = performance.now();
  const svg = await satori(
    getOpenGraphJsx(
      html,
      decodeURIComponent(params.get('title')).replace(/\+/g, ' '),
      (params.getAll('tag') || [])
        .map(v => decodeURIComponent(v).trim())
        .filter(Boolean),
    ),
    {
      width: WIDTH,
      height: HEIGHT,
      fonts: [
        {
          name: 'Open Sans',
          data: openSansRegularBuffer,
          weight: 400,
          style: 'normal',
        },
        {
          name: 'Open Sans',
          data: openSansSemiBoldBuffer,
          weight: 600,
          style: 'normal',
        },
        {
          name: 'Open Sans',
          data: openSansBoldBuffer,
          weight: 700,
          style: 'normal',
        },
      ],
    },
  );

  const resvg = new Resvg(svg, {
    background: 'rgba(238, 235, 230, .9)',
    fitTo: {
      mode: 'width',
      value: WIDTH,
    },
    // Load custom fonts.
    font: {
      fontFiles: [
        openSansRegularFilePath,
        openSansSemiBoldFilePath,
        openSansBoldFilePath,
      ],
      loadSystemFonts: false, // It will be faster to disable loading system fonts.
      defaultFontFamily: 'Open Sans',
    },
    // imageRendering: 1,
    shapeRendering: 2,
    // logLevel: 'debug', // Default Value: error
  });
  const pngData = resvg.render();
  const pngBase64 = pngData.asPng().toString('base64');

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
      'Content-Disposition': 'inline; filename="share.png"'
    },
    body: pngBase64,
    isBase64Encoded: true,
  }
};