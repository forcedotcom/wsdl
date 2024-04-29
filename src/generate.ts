import * as fs from 'fs';
import {parseString} from 'xml2js';
import type {
    ComplexTypeNode,
    ComplexTypeNodeWithComplexContent,
    NodeWithAttributes,
    SequenceNode,
    SimpleTypeNode,
    ComplexTypeNodeWithSequence,
    ElementNode,
    DefinitionsNode,
    SchemaNode,
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
    (wsdlFile) => {
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
            toArray((result.definitions as DefinitionsNode).types.schema).forEach(

                (schema) => {
                    toArray(schema.simpleType).forEach(
                        (simpleTypeNode) => {
                            output += treatSimpleTypeNode(simpleTypeNode);
                        },
                    );

                    toArray(schema.complexType).forEach(
                        (complexTypeNode) => {
                            output += treatComplexTypeNode(complexTypeNode);
                        },
                    );

                    toArray(schema.element).forEach(
                        (elementNode) => {
                            output += treatElementNode(elementNode);
                        },
                    );
                },
            );
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

function treatSimpleTypeNode(simpleTypeNode: SimpleTypeNode): string {
    let simpleNodeOutput = '';

    const typeName = treatTypeName(simpleTypeNode.$.name );
    const typePrimitive = simpleTypeNode.restriction.$.base ;

    if (typePrimitive === 'string') {
        simpleNodeOutput += 'export type ' + typeName + ' = ';

        const enumerations: NodeWithAttributes[] = simpleTypeNode.restriction.enumeration as NodeWithAttributes[];

        if (enumerations && enumerations.length > 0) {
            const enumerationValues= enumerations.map(
                enumeration => enumeration.$.value || '',
            );

            simpleNodeOutput += '\'' + enumerationValues.join('\' \n      | \'') + '\'';
        } else { // Not an enumeration
            simpleNodeOutput += 'string';
        }
    } else {
        simpleNodeOutput += 'export type ' + typeName + ' = ' + translateTypeName(typePrimitive);
    }

    simpleNodeOutput += ';\n\n';

    return simpleNodeOutput;
}

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

function treatComplexTypeNode(complexTypeNode: ComplexTypeNode): string {
    let complexNodeOutput = '';

    const typeName = treatTypeName(complexTypeNode.$?.name ?? '');
    let sequenceNode: SequenceNode | string | undefined;
    let typeStructure: string;

    if ((complexTypeNode as ComplexTypeNodeWithComplexContent).complexContent) {
        typeStructure = 'complexContent';
    } else {
        typeStructure = 'sequence';
    }

    complexNodeOutput += 'export type ' + typeName;

    switch (typeStructure) {
        case 'complexContent': {
            const updatedComplexTypeNode = complexTypeNode as ComplexTypeNodeWithComplexContent;
            const parentType: string | undefined = updatedComplexTypeNode.complexContent.extension.$.base?.replace('tns_', '');
            complexNodeOutput += parentType ? ' = ' + treatTypeName(parentType) + ' & {\n' : '';
            sequenceNode = updatedComplexTypeNode.complexContent.extension.sequence;
            break;
        }

        case 'sequence': {
            const updatedComplexTypeNode = complexTypeNode as ComplexTypeNodeWithSequence;
            sequenceNode = updatedComplexTypeNode.sequence;
            complexNodeOutput += ' = {\n';
            break;
        }

        default:
            complexNodeOutput += ' = {\n';
    }



    if (sequenceNode && sequenceNode !== '') {
        toArray((sequenceNode as SequenceNode).element).forEach(
            elementNode => {
                complexNodeOutput += treatAttribute(elementNode);
            },
        );
    }

    complexNodeOutput += '}\n\n';

    return complexNodeOutput;
}

function treatElementNode(elementNode: ElementNode): string {
    let elementNodeOutput = '';

    const typeName = treatTypeName(elementNode.$?.name || '');
    const sequenceNode = elementNode.complexType?.sequence;
    if (sequenceNode) {
    elementNodeOutput += 'export type ' + typeName + '= {\n';

        toArray((sequenceNode as SequenceNode).element).forEach(
            subElementNode => {
                elementNodeOutput += treatAttribute(subElementNode);
            },
        );


    elementNodeOutput += '}\n\n';
    }
    return elementNodeOutput;
}

function treatAttribute(elementNode: NodeWithAttributes): string {
    let attributeOutput = '';

    const {name: fieldName, type: fieldTypeXml, minOccurs, maxOccurs, nillable} = elementNode.$;

    console.assert(fieldName !== undefined, 'A field name is undefined');
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
