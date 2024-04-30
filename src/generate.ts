import * as fs from 'fs';
import {parseString, parseStringPromise} from 'xml2js';
import type {
    ComplexTypeNode,
    ComplexTypeNodeWithComplexContent,
    NodeWithAttributes,
    SequenceNode,
    SimpleTypeNode,
    ComplexTypeNodeWithSequence,
    ElementNode,
    DefinitionsNode,
} from './types';

const wsdlFolder = './resources';
const outputFolder = './output';

const reservedWords = ['abstract',
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
    'yield'];

fs.readdirSync(wsdlFolder).forEach(
   async (wsdlFile) => {
        console.dir(wsdlFile);

        const fileName = wsdlFile.split('.')[0];
        const extension = wsdlFile.split('.')[1];

        if (extension === 'wsdl') {
            const wsdl = fs.readFileSync(wsdlFolder + '/' + wsdlFile, 'utf-8');
            const ts = convertWsdlToTypescript(wsdl);
            fs.writeFileSync(outputFolder + '/' + fileName + '.d.ts', ts);
        }
    },
);

function convertWsdlToTypescript(wsdl: string): string {
    let output = '';

    parseString(wsdl
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
        const arr = toArray((result.definitions as DefinitionsNode).types.schema);

        output += treatComplexTypeNode([
            ...arr.flatMap(a => a.simpleType).filter(x=>x),
            ...arr.flatMap(a => a.element).filter(x=>x),
            ...arr.flatMap<ComplexTypeNode>(a => a.complexType).filter(x=>x)
        ])
        },
    );

    return output;
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

function treatComplexTypeNode(complexTypeNodes: ComplexTypeNode[]): string {
    let complexNodeOutput = '';

    const typeMap = new Map<string, {parents:string[], fields: SequenceNode[]}>();

    complexTypeNodes.map(type => {
        const key = treatTypeName(type.$?.name??'')
        if(!typeMap.has(key)){
            if((type as ComplexTypeNodeWithComplexContent).complexContent){
                // complex content case
                const t = type as ComplexTypeNodeWithComplexContent;
                typeMap.set(key, {parents: [t.complexContent.extension.$.base], fields: toArray(t.complexContent.extension.sequence?.element ?? []) as SequenceNode[]})
            }else{
                typeMap.set(key, {
                    parents: [], fields: toArray((type as ComplexTypeNodeWithSequence).sequence?.element as SequenceNode[] ??
                        // handle simple types here - adding enum values to fields
                        // @ts-ignore
                        toArray(type.restriction?.enumeration ?? []))
                })
            }
        } else {
            // we have this key, update it - use ! because we just ensured the map has it
            const currValue = typeMap.get(key)!
            if((type as ComplexTypeNodeWithComplexContent).complexContent){
                // complex content case
                const t = type as ComplexTypeNodeWithComplexContent;
                currValue.parents.push(t.complexContent.extension.$.base)
                currValue.fields.push(...toArray(t.complexContent.extension.sequence?.element) as SequenceNode[])
            }else{
                // @ts-ignore
                currValue.fields.concat((type as ComplexTypeNodeWithSequence).sequence?.element ?? type.restriction.enumeration)
            }
            typeMap.set(key, currValue)
        }
    })

    typeMap.forEach((info, type)=>{
        if(info.fields.every(f=> 'value' in f.$)){
            // we have an enum type
            complexNodeOutput+= 'export type ' + type + ' = '
            if(info.fields.length===0) complexNodeOutput+='string'
            complexNodeOutput+= info.fields.map(f => '\''+f.$.value+'\''  ).join('\n      |')
            complexNodeOutput+='\n\n'
        } else {
            complexNodeOutput += 'export type ' + type + ' = '
            complexNodeOutput += info.parents.map(p => treatTypeName(p)).join(' & ')
            if(info.parents.length){
                complexNodeOutput+= ' & {\n'
            }else {
                complexNodeOutput += '{\n'
            }
            // there's a duplciate field on UIObjectRelationConfig - with potentially more to come, filter out the duplicate
            // as well as fields that shouldn't be here !('value' in n.$')
            info.fields.filter((n, i) => info.fields.map(f=>f.$.name).indexOf(n.$.name)===i && !('value' in n.$) ).map(f => {
                complexNodeOutput+= treatAttribute(f)
            })
            complexNodeOutput+= '}\n\n'
        }
    })

    return complexNodeOutput

}

function treatAttribute(elementNode: NodeWithAttributes): string {
    let attributeOutput = '';

    const {name: fieldName, type: fieldTypeXml, minOccurs, maxOccurs, nillable} = elementNode.$;

    console.assert(fieldName !== undefined, 'A field name is undefined', elementNode.$);
    console.assert(fieldTypeXml !== undefined, 'A field type is undefined');

    const optional = (minOccurs === '0' || nillable === 'true') ? '?' : '';
    attributeOutput += '    ' + fieldName + optional + ': ';

    const fieldType = translateTypeName(fieldTypeXml ?? '') ?? 'any';

    if (maxOccurs === 'unbounded') {
        attributeOutput += fieldType + ' | ' + fieldType + '[]';
    } else {
        attributeOutput += fieldType;
    }

    attributeOutput += ';\n';

    return attributeOutput;
}

function translateTypeName(fieldTypeXml: string): string {
    let fieldType = '';

    switch (fieldTypeXml) {
        case 'boolean': {
            fieldType = 'boolean';
            break;
        }
        case 'base64Binary':
        case 'string': {
            fieldType = 'string';
            break;
        }

        case 'double':
        case 'long':
        case 'int': {
            fieldType = 'number';
            break;
        }

        case 'dateTime':
        case 'time':
        case 'date': {
            fieldType = 'Date';
            break;
        }

        case 'anyType': {
            fieldType = 'any';
            break;
        }

        default: {
            if (fieldTypeXml?.startsWith('tns_')) {
                fieldType = fieldTypeXml?.replace('tns_', '');
            } else if (fieldTypeXml?.startsWith('ens_')) {
                fieldType = fieldTypeXml?.replace('ens_', '');
            } else if (fieldTypeXml?.startsWith('mns_')) {
                fieldType = fieldTypeXml?.replace('mns_', '');
            } else if (fieldTypeXml?.startsWith('fns_')) {
                fieldType = fieldTypeXml?.replace('fns_', '');
            } else {
                fieldType = 'any';
            }
        }
    }

    return fieldType;
}

function treatTypeName(str: string): string {
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
