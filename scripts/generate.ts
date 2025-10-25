/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as fs from 'node:fs';
import { convertMapToInterface, convertMapToTypescript, convertWsdlToMap } from './parse';

const wsdlFolder = './resources';
const outputFolder = './src';

fs.readdirSync(wsdlFolder).forEach((wsdlFile) => {
  console.dir(wsdlFile);

  const [fileName, extension] = wsdlFile.split('.');

  if (extension === 'wsdl') {
    const wsdl = fs.readFileSync(`${wsdlFolder}/${wsdlFile}`, 'utf-8');
    const map = convertWsdlToMap(wsdl);
    const ts = convertMapToTypescript(map);
    fs.writeFileSync(`${outputFolder}/${fileName}.ts`, ts);
    const js = convertMapToInterface(map);
    fs.writeFileSync(`${outputFolder}/${fileName}.itf.ts`, js);
  }
});
