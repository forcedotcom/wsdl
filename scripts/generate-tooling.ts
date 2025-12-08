/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as fs from 'node:fs';
import { convertWsdlToTypescript } from './parse';

const wsdl = fs.readFileSync('./resources/tooling.wsdl', 'utf-8');
const ts = convertWsdlToTypescript(wsdl);
fs.writeFileSync('./src/tooling.ts', ts);
