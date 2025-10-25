/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect } from 'chai';
import { convertWsdlToMap, convertMapToTypescript } from '../scripts/parse';

const wrapWithDefinitions = (
  type: string
): string => `<definitions targetNamespace="http://soap.sforce.com/2006/08/apex" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns="http://schemas.xmlsoap.org/wsdl/" xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/" xmlns:tns="http://soap.sforce.com/2006/08/apex">
 <types>
  <xsd:schema elementFormDefault="qualified" targetNamespace="http://soap.sforce.com/2006/08/apex">
${type}
</xsd:schema>
</types>
</definitions>
`;

describe('generate', () => {
  it('will generate an enum type', () => {
    const input = wrapWithDefinitions(`
    <xsd:simpleType name="LogCategory">
    <xsd:restriction base="xsd:string">
     <xsd:enumeration value="Db"/>
     <xsd:enumeration value="Workflow"/>
     <xsd:enumeration value="Validation"/>
     <xsd:enumeration value="Callout"/>
     <xsd:enumeration value="Apex_code"/>
     <xsd:enumeration value="Apex_profiling"/>
     <xsd:enumeration value="Visualforce"/>
     <xsd:enumeration value="System"/>
     <xsd:enumeration value="Wave"/>
     <xsd:enumeration value="Nba"/>
     <xsd:enumeration value="All"/>
    </xsd:restriction>
   </xsd:simpleType>
`);
    const output = convertMapToTypescript(convertWsdlToMap(input));
    expect(output).to.equal(`export type LogCategory = 'Db'
      |'Workflow'
      |'Validation'
      |'Callout'
      |'Apex_code'
      |'Apex_profiling'
      |'Visualforce'
      |'System'
      |'Wave'
      |'Nba'
      |'All'

export type ApiSchemaTypes = {
\tLogCategory: LogCategory;
}
`);
  });

  it('will generate a complex type', () => {
    const input = wrapWithDefinitions(`
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
`);

    const output = convertMapToTypescript(convertWsdlToMap(input));
    expect(output).to.equal(
      `export type CompileAndTestRequest = {
    checkOnly: boolean;
    classes: string[];
    deleteClasses: string[];
    deleteTriggers: string[];
    runTestsRequest?: RunTestsRequest;
    triggers: string[];
}

export type ApiSchemaTypes = {
\tCompileAndTestRequest: CompileAndTestRequest;
}
`
    );
  });

  it('will not generate a duplicate field', () => {
    // note duplicate runTestRequest fields below
    const input = wrapWithDefinitions(`
   <xsd:complexType name="CompileAndTestRequest">
    <xsd:sequence>
     <xsd:element name="checkOnly" type="xsd:boolean"/>
     <xsd:element name="classes" minOccurs="0" maxOccurs="unbounded" type="xsd:string"/>
     <xsd:element name="deleteClasses" minOccurs="0" maxOccurs="unbounded" type="xsd:string"/>
     <xsd:element name="deleteTriggers" minOccurs="0" maxOccurs="unbounded" type="xsd:string"/>
     <xsd:element name="runTestsRequest" minOccurs="0" type="tns:RunTestsRequest"/>
     <xsd:element name="runTestsRequest" minOccurs="0" type="xsd:string"/>
     <xsd:element name="triggers" minOccurs="0" maxOccurs="unbounded" type="xsd:string"/>
    </xsd:sequence>
   </xsd:complexType>
`);

    const output = convertMapToTypescript(convertWsdlToMap(input));
    expect(output).to.equal(
      `export type CompileAndTestRequest = {
    checkOnly: boolean;
    classes: string[];
    deleteClasses: string[];
    deleteTriggers: string[];
    runTestsRequest?: RunTestsRequest;
    triggers: string[];
}

export type ApiSchemaTypes = {
\tCompileAndTestRequest: CompileAndTestRequest;
}
`
    );
  });

  it('will extend sObject & Metadata', () => {
    // the PostTemplate type has base Metadata and sObject => expect & Metadata & sObject
    const input = wrapWithDefinitions(`
   <xsd:complexType name="PostTemplate">
    <xsd:complexContent>
     <xsd:extension base="mns:Metadata">
      <xsd:sequence>
       <xsd:element name="default" minOccurs="0" type="xsd:boolean"/>
       <xsd:element name="description" minOccurs="0" type="xsd:string"/>
       <xsd:element name="fields" minOccurs="0" maxOccurs="unbounded" type="xsd:string"/>
       <xsd:element name="label" type="xsd:string"/>
      </xsd:sequence>
     </xsd:extension>
    </xsd:complexContent>
   </xsd:complexType>
   <xsd:complexType name="PostTemplate">
    <xsd:complexContent>
     <xsd:extension base="ens:sObject">
      <xsd:sequence>
       <xsd:element name="CreatedBy" minOccurs="0" type="ens:User" nillable="true"/>
       <xsd:element name="CreatedById" minOccurs="0" type="tns:ID" nillable="true"/>
       <xsd:element name="CreatedDate" minOccurs="0" type="xsd:dateTime" nillable="true"/>
       <xsd:element name="Description" minOccurs="0" type="xsd:string" nillable="true"/>
       <xsd:element name="EntityDefinition" minOccurs="0" type="ens:EntityDefinition" nillable="true"/>
       <xsd:element name="EntityDefinitionId" minOccurs="0" type="xsd:string" nillable="true"/>
       <xsd:element name="LastModifiedBy" minOccurs="0" type="ens:User" nillable="true"/>
       <xsd:element name="LastModifiedById" minOccurs="0" type="tns:ID" nillable="true"/>
       <xsd:element name="LastModifiedDate" minOccurs="0" type="xsd:dateTime" nillable="true"/>
       <xsd:element name="Name" minOccurs="0" type="xsd:string" nillable="true"/>
       <xsd:element name="TableEnumOrId" minOccurs="0" type="xsd:string" nillable="true"/>
      </xsd:sequence>
     </xsd:extension>
    </xsd:complexContent>
    </xsd:complexType>
`);

    const output = convertMapToTypescript(convertWsdlToMap(input));
    expect(output).to.equal(
      `export type PostTemplate = Metadata & sObject & {
    default?: boolean;
    description?: string;
    fields: string[];
    label: string;
    CreatedBy?: User;
    CreatedById?: ID;
    CreatedDate?: Date;
    Description?: string;
    EntityDefinition?: EntityDefinition;
    EntityDefinitionId?: string;
    LastModifiedBy?: User;
    LastModifiedById?: ID;
    LastModifiedDate?: Date;
    Name?: string;
    TableEnumOrId?: string;
}

export type ApiSchemaTypes = {
\tPostTemplate: PostTemplate;
}
`
    );
  });
});
