/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { parseString } from 'xml2js';
import {
  ComplexTypeNode,
  ComplexTypeNodeWithComplexContent,
  ComplexTypeNodeWithSequence,
  DefinitionsNode,
  ElementNode,
  NodeWithAttributes,
  SequenceNode,
  SimpleTypeNode,
} from './types';

const reservedWords = [
  'abstract',
  'arguments',
  'await',
  'boolean',
  'break',
  'byte',
  'case',
  'catch',
  'char',
  'class',
  'const',
  'continue',
  'debugger',
  'default',
  'delete',
  'do',
  'double',
  'else',
  'enum',
  'eval',
  'export',
  'extends',
  'false',
  'final',
  'finally',
  'float',
  'for',
  'function',
  'goto',
  'if',
  'implements',
  'import',
  'in',
  'instanceof',
  'int',
  'interface',
  'let',
  'long',
  'native',
  'new',
  'null',
  'package',
  'private',
  'protected',
  'public',
  'return',
  'short',
  'static',
  'super',
  'switch',
  'synchronized',
  'this',
  'throw',
  'throws',
  'transient',
  'true',
  'try',
  'typeof',
  'var',
  'void',
  'volatile',
  'while',
  'with',
  'yield',
];
export function convertWsdlToMap(wsdl: string): Map<string, { parents: string[]; fields: SequenceNode[] | NodeWithAttributes[] }> {
  let output: Map<string, { parents: string[]; fields: SequenceNode[] | NodeWithAttributes[] }> = new Map;

  parseString(
    wsdl
      // Remove the xsd namespace prefix, because partner.wsdl does not use it.
      .replaceAll('xsd:', '')
      // Transform the namespace prefixes, to make them Typescript friendly.
      .replaceAll('tns:', 'tns_')
      .replaceAll('ens:', 'ens_')
      .replaceAll('mns:', 'mns_')
      .replaceAll('fns:', 'fns_')
      .replaceAll('soap:', 'soap_')
      .replaceAll('xmlns:', 'xmlns_'),
    {
      explicitArray: false,
      mergeAttrs: false,
      explicitChildren: false,
      explicitCharkey: true,
    },
    (err, result) => {
      const arr = toArray((result as { definitions: DefinitionsNode }).definitions.types.schema);

      output = treatComplexTypeNode([
        ...arr.flatMap((a) => a.simpleType).filter((x) => x),
        ...arr.flatMap((a) => a.element).filter((x) => x),
        ...arr.flatMap<ComplexTypeNode>((a) => a.complexType).filter((x) => x),
      ]);
    }
  );

  return output;
}
export function convertMapToTypescript(map: Map<string, { parents: string[]; fields: SequenceNode[] | NodeWithAttributes[] }>): string {
  return writeTypeMap(map);
}
export function convertMapToInterface(map: Map<string, { parents: string[]; fields: SequenceNode[] | NodeWithAttributes[] }>): string {
  return writeInterfaceMap(map);
}

/*
*********************
* SIMPLE TYPE NODES *
*********************

* Simple types are either enums or primitives
    * Example of a simple type as an enum:
        <simpleType name="DeployProblemType">
            <restriction base="string">
                <enumeration value="Warning"/>
                <enumeration value="Error"/>
                <enumeration value="Info"/>
            </restriction>
        </simpleType>

    * Examples of a simple type as a primitive, with and without additional restrictions, respectively:
        <simpleType name="ID">
            <restriction base="string">
                <length value="18"/>
                <pattern value="[a-zA-Z0-9]{18}"/>
            </restriction>
        </simpleType>
        <simpleType name="PlatformSchemaContentType">
            <restriction base="string"/>
        </simpleType>

* Note that restrictions like length and pattern are not taken into account while building the Typescript type.
*/

/*
**********************
* COMPLEX TYPE NODES *
**********************

* Complex type nodes contain either a sequence block with a number of element nodes representing attributes or a complex content block.
    * Example of a complex type node with a sequence:
        <xsd:complexType name="CompileAndTestRequest">
            <xsd:sequence>
                <xsd:element name="checkOnly" type="xsd:boolean"/>
                <xsd:element name="classes" minOccurs="0" maxOccurs="unbounded" type="xsd:string"/>
                <xsd:element name="deleteClasses" minOccurs="0" maxOccurs="unbounded" type="xsd:string"/>
                <xsd:element name="deleteTriggers" minOccurs="0" maxOccurs="unbounded" type="xsd:string"/>
                <xsd:element name="runTestsRequest" minOccurs="0" type="tns:RunTestsRequest"/>
                <xsd:element name="triggers" minOccurs="0" maxOccurs="unbounded" type="xsd:string"/>
            </xsd:sequence>
        </xsd:complexType>

    * Example of a complex type node with a complex content:
        <xsd:complexType name="AIApplication">
            <xsd:complexContent>
                <xsd:extension base="tns:Metadata">
                    <xsd:sequence>
                        <xsd:element name="developerName" type="xsd:string"/>
                        <xsd:element name="masterLabel" minOccurs="0" type="xsd:string"/>
                        <xsd:element name="predictionDefinitions" minOccurs="0" maxOccurs="unbounded" type="tns:AIPredictionDefinition"/>
                        <xsd:element name="status" type="tns:AIApplicationStatus"/>
                        <xsd:element name="type" type="tns:AIApplicationType"/>
                    </xsd:sequence>
                </xsd:extension>
            </xsd:complexContent>
        </xsd:complexType>
*/

function treatComplexTypeNode(
  source: Array<SimpleTypeNode | ComplexTypeNode | ElementNode>
): Map<string, { parents: string[]; fields: SequenceNode[] | NodeWithAttributes[] }> {
  const typeMap = new Map<string, { parents: string[]; fields: SequenceNode[] | NodeWithAttributes[] }>();

  source.map((type) => {
    const key = treatTypeName(type.$?.name ?? '');
    if (!typeMap.has(key)) {
      if ((type as ComplexTypeNodeWithComplexContent).complexContent) {
        // complex content case
        const t = type as ComplexTypeNodeWithComplexContent;
        typeMap.set(key, {
          parents: [t.complexContent.extension.$.base],
          fields: toArray(t.complexContent.extension.sequence?.element ?? []) as SequenceNode[],
        });
      } else if ((type as ElementNode).complexType) {
        typeMap.set(key, {
          parents: [],
          fields: toArray((type as ElementNode).complexType?.sequence?.element ?? []) as SequenceNode[]
        });
      } else {
        typeMap.set(key, {
          parents: [],
          fields: toArray(
            ((type as ComplexTypeNodeWithSequence).sequence?.element as SequenceNode[]) ??
              // handle simple types here - adding enum values to fields
              toArray((type as SimpleTypeNode).restriction?.enumeration ?? [])
          ),
        });
      }
    } else {
      // we have this key, update it - use ! because we just ensured the map has it
      const currValue = typeMap.get(key)!;
      if ((type as ComplexTypeNodeWithComplexContent).complexContent) {
        // complex content case
        const t = type as ComplexTypeNodeWithComplexContent;
        currValue.parents.push(t.complexContent.extension.$.base);
        currValue.fields.push(...(toArray(t.complexContent.extension.sequence?.element) as SequenceNode[]));
      } else if ((type as ElementNode).complexType) {
        typeMap.set(key, {
          parents: [],
          fields: toArray((type as ElementNode).complexType?.sequence?.element ?? []) as SequenceNode[]
        });
        currValue.fields.concat(
          ((type as ElementNode).complexType?.sequence?.element as SequenceNode[])
        );
      } else {
        currValue.fields.concat(
          ((type as ComplexTypeNodeWithSequence).sequence?.element as SequenceNode[]) ??
            ((type as SimpleTypeNode).restriction.enumeration as SequenceNode[])
        );
      }
      typeMap.set(key, currValue);
    }
  });

  return typeMap;
}

function writeTypeMap(
  typeMap: Map<string, { parents: string[]; fields: SequenceNode[] | NodeWithAttributes[] }>
): string {
  let output = '';

  typeMap.forEach((info, type) => {
    if (info.parents.length) {
      output += `export type ${type} = `;
      output += info.parents.map((p) => treatTypeName(p)).join(' & ');
      if (info.fields.length){
        output += ' & {\n';
        // there's a duplciate field on UIObjectRelationConfig - with potentially more to come, filter out the duplicate
        // as well as fields that shouldn't be here !('value' in n.$')
        info.fields
          .filter((n, i) => info.fields.map((f) => f.$.name).indexOf(n.$.name) === i && !('value' in n.$))
          .map((f) => {
            output += treatAttribute(f);
          });
        output += '}';
      }
      output += '\n\n';
    } else
    if (info.fields.every((f) => 'value' in f.$)) {
      // we have an enum type
      output += `export type ${type} = `;
      if (info.fields.length === 0) output += 'string';
      output += info.fields.map((f) => `'${f.$.value}'`).join('\n      |');
      output += '\n\n';
    } else {
      output += `export type ${type} = `;
      // output += info.parents.map((p) => treatTypeName(p)).join(' & ');
      // if (info.parents.length) {
      //   output += ' & {\n';
      // } else {
        output += '{\n';
      // }
      // there's a duplciate field on UIObjectRelationConfig - with potentially more to come, filter out the duplicate
      // as well as fields that shouldn't be here !('value' in n.$')
      info.fields
        .filter((n, i) => info.fields.map((f) => f.$.name).indexOf(n.$.name) === i && !('value' in n.$))
        .map((f) => {
          output += treatAttribute(f);
        });
      output += '}\n\n';
    }
  });

  // write the ApiSchemaTypes type - everything below this can be removed if we deem it not necessary
  // this is something jsforce was doing, that might make the transition away from types in jsforce easier

  output += 'export type ApiSchemaTypes = {\n';

  typeMap.forEach((info, type) => {
    output += `\t${type}: ${type};\n`;
  });
  output += '}\n';

  // remove to here

  return output;
}

function writeInterfaceMap(
  typeMap: Map<string, { parents: string[]; fields: SequenceNode[] | NodeWithAttributes[] }>
): string {
  let output = '';

  typeMap.forEach((info, type) => {
    // if (type === 'upsertMetadataResponse') {console.log('ici interface upsertMetadataResponse');console.dir(info, {depth:null})}
    if (info.parents.length) {
      output += `export interface ${type} extends `;
      output += info.parents.map((p) => treatTypeName(p)).join(', ');
      output += ' {';
      if (info.fields.length){
        output += '\n';
        // there's a duplicate field on UIObjectRelationConfig - with potentially more to come, filter out the duplicate
        // as well as fields that shouldn't be here !('value' in n.$')
        info.fields
          .filter((n, i) => info.fields.map((f) => f.$.name).indexOf(n.$.name) === i && !('value' in n.$))
          .map((f) => {
            output += treatAttribute(f);
          });
        // output += '}';
      }
      output += '}\n\n';
    } else
    if (info.fields.length !== 0 &&info.fields.every((f) => 'value' in f.$)) {
      // we have an enum type
      output += `export enum ${type} {`;
      if (info.fields.length === 0) output += 'string';
      output += info.fields.map((f) => `'${f.$.value}'`).join(',\n      ');
      output += '}\n\n';
    } else {
      output += `export interface ${type} `;
      // output += info.parents.map((p) => treatTypeName(p)).join(' & ');
      // if (info.parents.length) {
      //   output += ' & {\n';
      // } else {
        output += '{\n';
      // }
      // there's a duplicate field on UIObjectRelationConfig - with potentially more to come, filter out the duplicate
      // as well as fields that shouldn't be here !('value' in n.$')
      info.fields
        .filter((n, i) => info.fields.map((f) => f.$.name).indexOf(n.$.name) === i && !('value' in n.$))
        .map((f) => {
          output += treatAttribute(f);
        });
      output += '}\n\n';
    }
  });

  // write the ApiSchemaTypes type - everything below this can be removed if we deem it not necessary
  // this is something jsforce was doing, that might make the transition away from types in jsforce easier

  output += 'export interface ApiSchemaTypes {\n';

  typeMap.forEach((info, type) => {
    output += `\t${type}: ${type};\n`;
  });
  output += '}\n';

  // remove to here

  return output;
}

function treatAttribute(elementNode: NodeWithAttributes): string {
  let attributeOutput = '';

  const { name: fieldName, type: fieldTypeXml, minOccurs, maxOccurs, nillable } = elementNode.$;

  console.assert(fieldName !== undefined, 'A field name is undefined', elementNode.$);
  console.assert(fieldTypeXml !== undefined, 'A field type is undefined');

  const isArray = maxOccurs === 'unbounded';
  const optional = (!isArray && minOccurs === '0') || nillable ? '?' : '';
  attributeOutput += `    ${fieldName}${optional}: `;

  const fieldType = translateTypeName(fieldTypeXml ?? '') ?? 'any';

  if (isArray) {
    attributeOutput += `${fieldType}[]`;
  } else {
    attributeOutput += fieldType;
  }

  attributeOutput += ';\n';

  return attributeOutput;
}

function translateTypeName(fieldTypeXml: string): string {
  switch (fieldTypeXml) {
    case 'boolean': {
      return 'boolean';
    }
    case 'base64Binary':
    case 'string': {
      return 'string';
    }

    case 'double':
    case 'long':
    case 'int': {
      return 'number';
    }

    case 'dateTime':
    case 'time':
    case 'date': {
      return 'Date';
    }

    case 'anyType': {
      return 'any';
    }

    default: {
      if (fieldTypeXml?.startsWith('tns_')) {
        return fieldTypeXml?.replace('tns_', '');
      } else if (fieldTypeXml?.startsWith('ens_')) {
        return fieldTypeXml?.replace('ens_', '');
      } else if (fieldTypeXml?.startsWith('mns_')) {
        return fieldTypeXml?.replace('mns_', '');
      } else if (fieldTypeXml?.startsWith('fns_')) {
        return fieldTypeXml?.replace('fns_', '');
      } else {
        return 'any';
      }
    }
  }
}

function treatTypeName(s: string): string {
  let str = s;
  if (reservedWords.includes(str)) {
    str += '_';
  }

  if (str?.startsWith('tns_')) {
    str = str?.replace('tns_', '');
  } else if (str?.startsWith('ens_')) {
    str = str?.replace('ens_', '');
  } else if (str?.startsWith('mns_')) {
    str = str?.replace('mns_', '');
  } else if (str?.startsWith('fns_')) {
    str = str?.replace('fns_', '');
  }

  return str;
}

function toArray<Type>(input: Type | Type[] | undefined): Type[] {
  if (input === undefined) {
    return [];
  }

  return Array.isArray(input) ? input : [input];
}
