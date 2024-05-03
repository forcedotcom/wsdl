# Salesforce WSDL Files

This repository contains the full Salesforce WSDL files. These files are used primarily by tooling vendors to build tools for developing on the Salesforce platform.

# @salesforce/types

---

These wsdls are the source for generating the types found in the `@salesforce/types` package. These can be used in your code like

```typescript
import type { LogCategory } from '@salesforce/types/apex';
import type { TestLevel } from '@salesforce/types/metadata';
import type { StatusCode } from '@salesforce/types/partner';
import type { PermissionSetFlowAccess } from '@salesforce/types/tooling';
```

We also additionally publish a schema type `ApiSchemaTypes` with each file that can serve as a parseable index of type names to types.

## Contributing

---

We do not accept contributions or issues to this repository. These files are provided as reference only. No support is provided for this repository.

For future Salesforce employees looking to update this repo, instructions are [here](https://salesforce.quip.com/6bQJAJbfE5Lo).
