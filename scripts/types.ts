/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
export type Properties = Record<string, string>;

export type Node = {
  $?: Properties;
};

export type NodeWithAttributes = {
  $: Properties;
} & Node;

export type SequenceNode = {
  element: NodeWithAttributes[] | NodeWithAttributes;
} & NodeWithAttributes;

export type ExtensionNode = {
  sequence: SequenceNode;
} & NodeWithAttributes;

export type ComplexContentNode = {
  extension: ExtensionNode;
} & Node;

export type ComplexTypeNode = Record<string, unknown> & Node;

export type ComplexTypeNodeWithSequence = {
  sequence?: SequenceNode;
} & ComplexTypeNode;

export type ComplexTypeNodeWithComplexContent = {
  complexContent: ComplexContentNode;
} & ComplexTypeNode;

export type RestrictionNode = {
  enumeration: NodeWithAttributes[] | NodeWithAttributes;
} & NodeWithAttributes;

export type SimpleTypeNode = {
  restriction: RestrictionNode;
} & NodeWithAttributes;

export type ElementNode = {
  complexType: ComplexTypeNodeWithSequence;
} & NodeWithAttributes;

export type SchemaNode = {
  complexType: ComplexTypeNode[] | ComplexTypeNode;
  simpleType: SimpleTypeNode[] | SimpleTypeNode;
  element: ElementNode[] | ElementNode;
} & NodeWithAttributes;

export type TypesNode = {
  schema: SchemaNode | SchemaNode[];
} & Node;

export type DefinitionsNode = {
  types: TypesNode;
} & NodeWithAttributes;
