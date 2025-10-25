/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
/* eslint-disable @typescript-eslint/consistent-type-definitions */
export enum FlowProcessType {'AutoLaunchedFlow',
      'Flow',
      'Workflow',
      'CustomEvent',
      'InvocableProcess',
      'LoginFlow',
      'ActionPlan',
      'JourneyBuilderIntegration',
      'UserProvisioningFlow',
      'Survey',
      'SurveyEnrich',
      'Appointments',
      'FSCLending',
      'DigitalForm',
      'FieldServiceMobile',
      'OrchestrationFlow',
      'FieldServiceWeb',
      'TransactionSecurityFlow',
      'ContactRequestFlow',
      'ActionCadenceFlow',
      'ManagedContentFlow',
      'CheckoutFlow',
      'CartAsyncFlow',
      'DataCaptureFlow',
      'CustomerLifecycle',
      'Journey',
      'RecommendationStrategy',
      'Orchestrator',
      'RoutingFlow',
      'ServiceCatalogItemFlow',
      'EvaluationFlow',
      'LoyaltyManagementFlow',
      'ManagedContentAuthoringWorkflow',
      'ActionCadenceAutolaunchedFlow',
      'ActionCadenceStepFlow',
      'IndicatorResultFlow',
      'IndividualObjectLinkingFlow',
      'PromptFlow',
      'ApprovalWorkflow',
      'DcvrFrameworkDataCaptureFlow',
      'ActivityObjectMatchingFlow',
      'ActionableEventManagementFlow',
      'StageManagementEvaluationFlow',
      'RpaFlow'}

export enum PerfOption {'NONE',
      'MINIMUM'}

export enum LogCategory {'Db',
      'Workflow',
      'Validation',
      'Callout',
      'Apex_code',
      'Apex_profiling',
      'Visualforce',
      'System',
      'Wave',
      'Nba',
      'Data_Access',
      'All'}

export enum LogCategoryLevel {'None',
      'Finest',
      'Finer',
      'Fine',
      'Debug',
      'Info',
      'Warn',
      'Error'}

export enum LogType {'None',
      'Debugonly',
      'Db',
      'Profiling',
      'Callout',
      'Detail'}

export interface ID {
}

export interface AllowFieldTruncationHeader {
    allowFieldTruncation: boolean;
}

export interface CallOptions {
    client: string;
    perfOption: PerfOption;
    uiRequestId: string;
}

export interface DebuggingHeader {
    categories: LogInfo[];
    debugLevel: LogType;
}

export interface DebuggingInfo {
    debugLog: string;
}

export interface DisableFeedTrackingHeader {
    disableFeedTracking: boolean;
}

export interface PackageVersionHeader {
    packageVersions: PackageVersion[];
}

export interface SessionHeader {
    sessionId: string;
}

export interface compileAndTest {
    CompileAndTestRequest: CompileAndTestRequest;
}

export interface compileAndTestResponse {
    result: CompileAndTestResult;
}

export interface compileClasses {
    scripts: string[];
}

export interface compileClassesResponse {
    result: CompileClassResult[];
}

export interface compileTriggers {
    scripts: string[];
}

export interface compileTriggersResponse {
    result: CompileTriggerResult[];
}

export interface executeAnonymous {
    String: string;
}

export interface executeAnonymousResponse {
    result: ExecuteAnonymousResult;
}

export interface runTests {
    RunTestsRequest: RunTestsRequest;
}

export interface runTestsResponse {
    result: RunTestsResult;
}

export interface wsdlToApex {
    info: WsdlToApexInfo;
}

export interface wsdlToApexResponse {
    result: WsdlToApexResult;
}

export interface CompileAndTestRequest {
    checkOnly: boolean;
    classes: string[];
    deleteClasses: string[];
    deleteTriggers: string[];
    runTestsRequest?: RunTestsRequest;
    triggers: string[];
}

export interface RunTestsRequest {
    allTests: boolean;
    classes: string[];
    maxFailedTests?: number;
    namespace: string;
    packages: string[];
    skipCodeCoverage?: boolean;
    tests: TestsNode[];
}

export interface TestsNode {
    classId: string;
    className: string;
    testMethods: string[];
}

export interface CompileAndTestResult {
    classes: CompileClassResult[];
    deleteClasses: DeleteApexResult[];
    deleteTriggers: DeleteApexResult[];
    runTestsResult: RunTestsResult;
    success: boolean;
    triggers: CompileTriggerResult[];
}

export interface CompileClassResult {
    bodyCrc?: number;
    column: number;
    id?: ID;
    line: number;
    name?: string;
    problem?: string;
    problems?: CompileIssue[];
    success: boolean;
    warnings?: CompileIssue[];
}

export interface CompileIssue {
    column?: number;
    line?: number;
    message?: string;
}

export interface DeleteApexResult {
    id?: ID;
    problem?: string;
    success: boolean;
}

export interface RunTestsResult {
    apexLogId?: string;
    codeCoverage: CodeCoverageResult[];
    codeCoverageWarnings: CodeCoverageWarning[];
    failures: RunTestFailure[];
    flowCoverage: FlowCoverageResult[];
    flowCoverageWarnings: FlowCoverageWarning[];
    numFailures: number;
    numTestsRun: number;
    successes: RunTestSuccess[];
    totalTime: number;
}

export interface CodeCoverageResult {
    id: ID;
    locationsNotCovered: CodeLocation[];
    name: string;
    namespace?: string;
    numLocations: number;
    numLocationsNotCovered: number;
    type: string;
}

export interface CodeLocation {
    column: number;
    line: number;
    numExecutions: number;
    time: number;
}

export interface CodeCoverageWarning {
    id: ID;
    message: string;
    name?: string;
    namespace?: string;
}

export interface RunTestFailure {
    id: ID;
    message: string;
    methodName?: string;
    name: string;
    namespace?: string;
    seeAllData?: boolean;
    stackTrace?: string;
    time: number;
    type: string;
}

export interface FlowCoverageResult {
    elementsNotCovered: string[];
    flowId: string;
    flowName: string;
    flowNamespace?: string;
    numElements: number;
    numElementsNotCovered: number;
    processType: FlowProcessType;
}

export interface FlowCoverageWarning {
    flowId?: string;
    flowName?: string;
    flowNamespace?: string;
    message: string;
}

export interface RunTestSuccess {
    id: ID;
    methodName: string;
    name: string;
    namespace?: string;
    seeAllData?: boolean;
    time: number;
}

export interface CompileTriggerResult {
    bodyCrc?: number;
    column: number;
    id?: ID;
    line: number;
    name?: string;
    problem?: string;
    problems?: CompileIssue[];
    success: boolean;
    warnings?: CompileIssue[];
}

export interface ExecuteAnonymousResult {
    column: number;
    compileProblem?: string;
    compiled: boolean;
    exceptionMessage?: string;
    exceptionStackTrace?: string;
    line: number;
    success: boolean;
}

export interface WsdlToApexInfo {
    mapping: NamespacePackagePair[];
    wsdl: string;
}

export interface NamespacePackagePair {
    namespace: string;
    packageName: string;
}

export interface WsdlToApexResult {
    apexScripts: string[];
    errors: string[];
    success: boolean;
}

export interface LogInfo {
    category: LogCategory;
    level: LogCategoryLevel;
}

export interface PackageVersion {
    majorNumber: number;
    minorNumber: number;
    namespace: string;
    packageId: string;
}

export interface ApiSchemaTypes {
	FlowProcessType: FlowProcessType;
	PerfOption: PerfOption;
	LogCategory: LogCategory;
	LogCategoryLevel: LogCategoryLevel;
	LogType: LogType;
	ID: ID;
	AllowFieldTruncationHeader: AllowFieldTruncationHeader;
	CallOptions: CallOptions;
	DebuggingHeader: DebuggingHeader;
	DebuggingInfo: DebuggingInfo;
	DisableFeedTrackingHeader: DisableFeedTrackingHeader;
	PackageVersionHeader: PackageVersionHeader;
	SessionHeader: SessionHeader;
	compileAndTest: compileAndTest;
	compileAndTestResponse: compileAndTestResponse;
	compileClasses: compileClasses;
	compileClassesResponse: compileClassesResponse;
	compileTriggers: compileTriggers;
	compileTriggersResponse: compileTriggersResponse;
	executeAnonymous: executeAnonymous;
	executeAnonymousResponse: executeAnonymousResponse;
	runTests: runTests;
	runTestsResponse: runTestsResponse;
	wsdlToApex: wsdlToApex;
	wsdlToApexResponse: wsdlToApexResponse;
	CompileAndTestRequest: CompileAndTestRequest;
	RunTestsRequest: RunTestsRequest;
	TestsNode: TestsNode;
	CompileAndTestResult: CompileAndTestResult;
	CompileClassResult: CompileClassResult;
	CompileIssue: CompileIssue;
	DeleteApexResult: DeleteApexResult;
	RunTestsResult: RunTestsResult;
	CodeCoverageResult: CodeCoverageResult;
	CodeLocation: CodeLocation;
	CodeCoverageWarning: CodeCoverageWarning;
	RunTestFailure: RunTestFailure;
	FlowCoverageResult: FlowCoverageResult;
	FlowCoverageWarning: FlowCoverageWarning;
	RunTestSuccess: RunTestSuccess;
	CompileTriggerResult: CompileTriggerResult;
	ExecuteAnonymousResult: ExecuteAnonymousResult;
	WsdlToApexInfo: WsdlToApexInfo;
	NamespacePackagePair: NamespacePackagePair;
	WsdlToApexResult: WsdlToApexResult;
	LogInfo: LogInfo;
	PackageVersion: PackageVersion;
}
