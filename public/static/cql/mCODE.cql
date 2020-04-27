library mCODE version '1'

using FHIR version '4.0.0'

// CODESYSTEMS
codesystem "SNOMEDCT": 'http://snomed.info/sct'
codesystem "LOINC": 'http://loinc.org'
codesystem "OBSCAT": 'http://terminology.hl7.org/CodeSystem/observation-category'

// FHIR CODES
code "Primary cancer code": '64572001' from "SNOMEDCT" display 'Disease (disorder)'
code "TNM clinical primary tumor code": '21905-5' from "LOINC" display 'Primary tumor.clinical [Class] Cancer'
code "TNM clinical regional nodes code": '21906-3' from "LOINC" display 'Regional lymph nodes.clinical [Class] Cancer'
code "TNM clinical distant metastases code": '21907-1' from "LOINC" display 'Distant metastases.clinical [Class] Cancer'
code "Estrogen receptor code": '85337-4' from "LOINC" display 'Estrogen receptor Ag [Presence] in Breast cancer specimen by Immune stain'
code "Progesterone receptor code": '85339-0' from "LOINC" display 'Progesterone receptor Ag [Presence] in Breast cancer specimen by Immune stain'
code "HER2 receptor code": '85319-2' from "LOINC" display 'HER2 [Presence] in Breast cancer specimen by Immune stain'

// selected cancer codes used within Synthea
// not the entire list supported by PrimaryCancerConditionVS
code "11p partial monosomy syndrome code": '4135001' from SNOMEDCT display '11p partial monosomy syndrome'
code "Orbital lymphoma code": '13048006' from SNOMEDCT display 'Orbital lymphoma'
code "Delta heavy chain disease code": '20224008' from SNOMEDCT display 'Delta heavy chain disease'
code "Malignant neoplasm of breast code": '254837009' from SNOMEDCT display 'Malignant neoplasm of breast'
code "Primary malignant neoplasm of colon code": '93761005' from SNOMEDCT display 'Primary malignant neoplasm of colon'
code "Secondary malignant neoplasm of colon code": '94260004' from SNOMEDCT display 'Secondary malignant neoplasm of colon'
code "Carcinoma in situ of prostate (disorder) code": '92691004' from SNOMEDCT display 'Carcinoma in situ of prostate (disorder)'
code "Small cell carcinoma of lung (disorder) code": '254632001' from SNOMEDCT display 'Small cell carcinoma of lung (disorder)'
code "Non-small cell lung cancer (disorder) code": '254637007' from SNOMEDCT display 'Non-small cell lung cancer (disorder)'

// Category code as concepts
concept "Primary cancer": { "Primary cancer code" }
concept "PrimaryCancersVS": {
    "11p partial monosomy syndrome code",
    "Orbital lymphoma code",
    "Delta heavy chain disease code",
    "Malignant neoplasm of breast code",
    "Primary malignant neoplasm of colon code",
    "Secondary malignant neoplasm of colon code",
    "Carcinoma in situ of prostate (disorder) code",
    "Small cell carcinoma of lung (disorder) code",
    "Non-small cell lung cancer (disorder) code":
}

context Patient

// Copied functions from FHIRHelpers as a workaround
// https://github.com/cqframework/clinical_quality_language/blob/master/Src/java/quick/src/main/resources/org/hl7/fhir/FHIRHelpers-4.0.0.cql
define function ToCode(coding FHIR.Coding):
    if coding is null then
        null
    else
        System.Code {
          code: coding.code.value,
          system: coding.system.value,
          version: coding.version.value,
          display: coding.display.value
        }

define function ToConcept(concept FHIR.CodeableConcept):
    if concept is null then
        null
    else
        System.Concept {
            codes: concept.coding C return ToCode(C),
            display: concept.text.value
        }

// mCODE Profile Statements
define "Primary Cancer Condition":
    [Condition: code in "PrimaryCancersVS"] Cancer
    where ToConcept(Cancer.category[0] as FHIR.CodeableConcept) ~ "Primary cancer"

define "TNM Clinical Primary Tumor":
    [Observation: "TNM clinical primary tumor code"]

define "TNM Clinical Regional Nodes":
    [Observation: "TNM clinical regional nodes code"]

define "TNM Clinical Distant Metastases":
    [Observation: "TNM clinical distant metastases code"]

define "Estrogen Receptor Tumor Marker Test":
    [Observation: "Estrogen receptor code"]

define "Progesterone Receptor Tumor Marker Test":
    [Observation: "Progesterone receptor code"]

define "HER2 Receptor Tumor Marker Test":
    [Observation: "HER2 receptor code"]

// mCODE Data Element Definitions
define "Primary Cancer Condition Body Location Code":
    "Primary Cancer Condition" Cancer
    return Cancer.bodySite

define "Primary Cancer Condition Code":
    "Primary Cancer Condition" Cancer
    return Cancer.code.text.value

define "TNM Clinical Primary Tumor Category Data Value (T Category)":
    "TNM Clinical Primary Tumor" Disease
    return Disease.value.text.value

define "TNM Clinical Regional Nodes Category Data Value (N Category)":
    "TNM Clinical Regional Nodes" Disease
    return Disease.value.text.value

define "TNM Clinical Distant Metastases Category Data Value (M Category)":
    "TNM Clinical Distant Metastases" Disease
    return Disease.value.text.value

define "Estrogen Receptor Value":
    "Estrogen Receptor Tumor Marker Test" Test
    return Test.value.text.value

define "Progesterone Receptor Value":
    "Progesterone Receptor Tumor Marker Test" Test
    return Test.value.text.value

define "HER2 Receptor Value":
    "HER2 Receptor Tumor Marker Test" Test
    return Test.value.text.value