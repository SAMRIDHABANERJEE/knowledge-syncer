/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import app from '../server';

export default function handler(req: any, res: any) {
  return app(req, res);
}
