export type FlowProcessType = 'AutoLaunchedFlow'
      |'Flow'
      |'Workflow'
      |'CustomEvent'
      |'InvocableProcess'
      |'LoginFlow'
      |'ActionPlan'
      |'JourneyBuilderIntegration'
      |'UserProvisioningFlow'
      |'Survey'
      |'SurveyEnrich'
      |'Appointments'
      |'FSCLending'
      |'DigitalForm'
      |'FieldServiceMobile'
      |'OrchestrationFlow'
      |'FieldServiceWeb'
      |'TransactionSecurityFlow'
      |'ContactRequestFlow'
      |'ActionCadenceFlow'
      |'ManagedContentFlow'
      |'CheckoutFlow'
      |'CartAsyncFlow'
      |'DataCaptureFlow'
      |'CustomerLifecycle'
      |'Journey'
      |'RecommendationStrategy'
      |'Orchestrator'
      |'RoutingFlow'
      |'ServiceCatalogItemFlow'
      |'EvaluationFlow'
      |'LoyaltyManagementFlow'
      |'ManagedContentAuthoringWorkflow'
      |'ActionCadenceAutolaunchedFlow'
      |'ActionCadenceStepFlow'
      |'IndicatorResultFlow'
      |'IndividualObjectLinkingFlow'
      |'PromptFlow'

export type PerfOption = 'NONE'
      |'MINIMUM'

export type LogCategory = 'Db'
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

export type LogCategoryLevel = 'None'
      |'Finest'
      |'Finer'
      |'Fine'
      |'Debug'
      |'Info'
      |'Warn'
      |'Error'

export type LogType = 'None'
      |'Debugonly'
      |'Db'
      |'Profiling'
      |'Callout'
      |'Detail'

export type ID = string

export type AllowFieldTruncationHeader = string

export type CallOptions = string

export type DebuggingHeader = string

export type DebuggingInfo = string

export type DisableFeedTrackingHeader = string

export type PackageVersionHeader = string

export type SessionHeader = string

export type compileAndTest = string

export type compileAndTestResponse = string

export type compileClasses = string

export type compileClassesResponse = string

export type compileTriggers = string

export type compileTriggersResponse = string

export type executeAnonymous = string

export type executeAnonymousResponse = string

export type runTests = string

export type runTestsResponse = string

export type wsdlToApex = string

export type wsdlToApexResponse = string

export type CompileAndTestRequest = {
    checkOnly: boolean;
    classes?: string | string[];
    deleteClasses?: string | string[];
    deleteTriggers?: string | string[];
    runTestsRequest?: RunTestsRequest;
    triggers?: string | string[];
}

export type RunTestsRequest = {
    allTests: boolean;
    classes?: string | string[];
    maxFailedTests?: number;
    namespace: string;
    packages?: string | string[];
    skipCodeCoverage?: boolean;
    tests?: TestsNode | TestsNode[];
}

export type TestsNode = {
    classId: string;
    className: string;
    testMethods?: string | string[];
}

export type CompileAndTestResult = {
    classes?: CompileClassResult | CompileClassResult[];
    deleteClasses?: DeleteApexResult | DeleteApexResult[];
    deleteTriggers?: DeleteApexResult | DeleteApexResult[];
    runTestsResult: RunTestsResult;
    success: boolean;
    triggers?: CompileTriggerResult | CompileTriggerResult[];
}

export type CompileClassResult = {
    bodyCrc?: number;
    column: number;
    id?: ID;
    line: number;
    name?: string;
    problem?: string;
    problems?: CompileIssue | CompileIssue[];
    success: boolean;
    warnings?: CompileIssue | CompileIssue[];
}

export type CompileIssue = {
    column?: number;
    line?: number;
    message?: string;
}

export type DeleteApexResult = {
    id?: ID;
    problem?: string;
    success: boolean;
}

export type RunTestsResult = {
    apexLogId?: string;
    codeCoverage?: CodeCoverageResult | CodeCoverageResult[];
    codeCoverageWarnings?: CodeCoverageWarning | CodeCoverageWarning[];
    failures?: RunTestFailure | RunTestFailure[];
    flowCoverage?: FlowCoverageResult | FlowCoverageResult[];
    flowCoverageWarnings?: FlowCoverageWarning | FlowCoverageWarning[];
    numFailures: number;
    numTestsRun: number;
    successes?: RunTestSuccess | RunTestSuccess[];
    totalTime: number;
}

export type CodeCoverageResult = {
    id: ID;
    locationsNotCovered?: CodeLocation | CodeLocation[];
    name: string;
    namespace?: string;
    numLocations: number;
    numLocationsNotCovered: number;
    type: string;
}

export type CodeLocation = {
    column: number;
    line: number;
    numExecutions: number;
    time: number;
}

export type CodeCoverageWarning = {
    id: ID;
    message: string;
    name?: string;
    namespace?: string;
}

export type RunTestFailure = {
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

export type FlowCoverageResult = {
    elementsNotCovered?: string | string[];
    flowId: string;
    flowName: string;
    flowNamespace?: string;
    numElements: number;
    numElementsNotCovered: number;
    processType: FlowProcessType;
}

export type FlowCoverageWarning = {
    flowId?: string;
    flowName?: string;
    flowNamespace?: string;
    message: string;
}

export type RunTestSuccess = {
    id: ID;
    methodName: string;
    name: string;
    namespace?: string;
    seeAllData?: boolean;
    time: number;
}

export type CompileTriggerResult = {
    bodyCrc?: number;
    column: number;
    id?: ID;
    line: number;
    name?: string;
    problem?: string;
    problems?: CompileIssue | CompileIssue[];
    success: boolean;
    warnings?: CompileIssue | CompileIssue[];
}

export type ExecuteAnonymousResult = {
    column: number;
    compileProblem?: string;
    compiled: boolean;
    exceptionMessage?: string;
    exceptionStackTrace?: string;
    line: number;
    success: boolean;
}

export type WsdlToApexInfo = {
    mapping?: NamespacePackagePair | NamespacePackagePair[];
    wsdl: string;
}

export type NamespacePackagePair = {
    namespace: string;
    packageName: string;
}

export type WsdlToApexResult = {
    apexScripts?: string | string[];
    errors?: string | string[];
    success: boolean;
}

export type LogInfo = {
    category: LogCategory;
    level: LogCategoryLevel;
}

export type PackageVersion = {
    majorNumber: number;
    minorNumber: number;
    namespace: string;
}
