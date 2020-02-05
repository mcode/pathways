![camino-logo-light](https://user-images.githubusercontent.com/13512036/73880187-ec17d580-482b-11ea-9b4f-e5f15a492fad.png)
# Camino: mCODE™-based Oncology Clinical Pathways Prototype
[![Build Status](https://travis-ci.org/mcode/pathways.svg?branch=master)](https://travis-ci.org/mcode/pathways)


## mCODE: Minimal Common Oncology Data Elements
mCODE is an initiative intended to assemble a core set of structured data elements for oncology electronic health records (EHRs). mCODE is a step towards capturing research-quality data from the treatment of all cancer patients. This would enable the treatment of every cancer patient to contribute to comparative effectiveness analysis of cancer treatments by allowing for easier methods of data exchange between health systems. mCODE has been created and is being supported by The American Society of Clinical Oncology (ASCO®) in collaboration with the MITRE Corporation. Read more at https://mcodeinitiative.org/ .

## Camino
Camino is a prototype SMART on FHIR application intended to demonstrate the value of mCODE through computable oncology clinical pathways. ASCO defines oncology clinical pathways as "detailed, evidence-based treatment protocols for delivering cancer care to patients with specific disease types and stages. When properly designed and implemented, oncology pathways can serve as an important tool in improving care quality and reducing costs." [(reference)](https://www.asco.org/practice-policy/cancer-care-initiatives/clinical-pathways)

Camino uses mCODE data in the patient's record fetched from the EHR to automatically evaluate the patient's current location on a pathway and provides recommendations as to next steps.

## Testing Camino with a SMART Launcher

1. Run `yarn install` to install the necessary packages.
2. Run `yarn start` to start the application.
3. Launch the application from the SMART launcher.
    - Visit a [SMART Launcher](http://launch.smarthealthit.org)
    - Launch `http://localhost:3000`
    - Select a practitioner and a patient
    - Camino will load with that patient's record.

## Running tests
Tests can be run by executing:
```shell script
yarn test
```

## Running the code linter
Code linting can be run by executing:

```shell script
yarn lint
```

Some issues can be automatically corrected with:

```shell script
yarn lint-fix
```


# License
Copyright 2020 The MITRE Corporation

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
