library mCODEResources version '1'
using FHIR version '4.0.0'

// CODESYSTEMS

codesystem "SNOMEDCT": 'http://snomed.info/sct'
codesystem "LOINC": 'http://loinc.org'
codesystem "RXNORM": 'http://www.nlm.nih.gov/research/umls/rxnorm'

// FHIR CODES

// LOINC Observation Codes
code "Primary tumor.clinical [Class] Cancer code": '21905-5' from "LOINC" display 'Primary tumor.clinical [Class] Cancer'
code "Regional lymph nodes.clinical [Class] Cancer code": '21906-3' from "LOINC" display 'Regional lymph nodes.clinical [Class] Cancer'
code "HER2 [Presence] in Breast cancer specimen by Immune stain code": '85319-2' from LOINC display 'HER2 [Presence] in Breast cancer specimen by Immune stain'
// SNOMED Observation Values
code "T0 category (finding) code": '58790005' from "SNOMEDCT" display 'T0 category (finding)'
code "T1 category (finding) code": '23351008' from "SNOMEDCT" display 'T1 category (finding)'
code "N0 category (finding) code": '62455006' from "SNOMEDCT" display 'N0 category (finding)'
code "N1 category (finding) code": '53623008' from "SNOMEDCT" display 'N1 category (finding)'
// SNOMED Procedures
code "Lumpectomy of breast (procedure) code": '392021009' from "SNOMEDCT" display 'Lumpectomy of breast (procedure)'
code "Teleradiotherapy procedure (procedure) code": '33195004' from "SNOMEDCT" display 'Teleradiotherapy procedure (procedure)'
code "Chemotherapy (procedure) code": '367336001' from "SNOMEDCT" display 'Chemotherapy (procedure)'
// RXNORM Medication Request
code "14 ML pertuzumab 30 MG/ML Injection code": '1298948' from "RXNORM" display '14 ML pertuzumab 30 MG/ML Injection'
code "Cyclophosphamide 1000 MG Injection code": '1734919' from "RXNORM" display 'Cyclophosphamide 1000 MG Injection'
code "trastuzumab 150 MG Injection code": '1922509' from "RXNORM" display 'trastuzumab 150 MG Injection'
code "10 ML Doxorubicin Hydrochloride 2 MG/ML Injection code": '1790099' from "RXNORM" display '10 ML Doxorubicin Hydrochloride 2 MG/ML Injection'
code "ado-trastuzumab emtansine 100 MG Injection code": '1658084' from "RXNORM" display 'ado-trastuzumab emtansine 100 MG Injection'
code "paclitaxel 100 MG Injection code": '583214' from "RXNORM" display 'paclitaxel 100 MG Injection'

code "11p partial monosomy syndrome 4135001 code": '4135001' from SNOMEDCT display '11p partial monosomy syndrome'
code "Orbital lymphoma 13048006 code": '13048006' from SNOMEDCT display 'Orbital lymphoma'
code "Delta heavy chain disease 20224008 code": '20224008' from SNOMEDCT display 'Delta heavy chain disease'
// selected cancer codes used within Synthea
// not the entire list supported by PrimaryCancerConditionVS
code "Malignant neoplasm of breast 254837009 code": '254837009' from SNOMEDCT display 'Malignant neoplasm of breast'
code "Primary malignant neoplasm of colon 93761005 code": '93761005' from SNOMEDCT display 'Primary malignant neoplasm of colon'
code "Secondary malignant neoplasm of colon 94260004 code": '94260004' from SNOMEDCT display 'Secondary malignant neoplasm of colon'
code "Carcinoma in situ of prostate (disorder) 92691004 code": '92691004' from SNOMEDCT display 'Carcinoma in situ of prostate (disorder)'
code "Small cell carcinoma of lung (disorder) 254632001 code": '254632001' from SNOMEDCT display 'Small cell carcinoma of lung (disorder)'
code "Non-small cell lung cancer (disorder) 254637007 code": '254637007' from SNOMEDCT display 'Non-small cell lung cancer (disorder)'



// FHIR CONCEPTS

// Observations
concept "T0 category (finding)": {"T0 category (finding) code"} display 'T0 category (finding)'
concept "T1 category (finding)": {"T1 category (finding) code"} display 'T1 category (finding)'
concept "N0 category (finding)": {"N0 category (finding) code"} display 'N0 category (finding)'
concept "N1 category (finding)": {"N1 category (finding) code"} display 'N1 category (finding)'
// Medication Requests
concept "14 ML pertuzumab 30 MG/ML Injection": {"14 ML pertuzumab 30 MG/ML Injection code"} display '14 ML pertuzumab 30 MG/ML Injection'
concept "Cyclophosphamide 1000 MG Injection": {"Cyclophosphamide 1000 MG Injection code"} display 'Cyclophosphamide 1000 MG Injection'
concept "trastuzumab 150 MG Injection": {"trastuzumab 150 MG Injection code"} display 'trastuzumab 150 MG Injection'
concept "10 ML Doxorubicin Hydrochloride 2 MG/ML Injection": {"10 ML Doxorubicin Hydrochloride 2 MG/ML Injection code"} display '10 ML Doxorubicin Hydrochloride 2 MG/ML Injection'
concept "ado-trastuzumab emtansine 100 MG Injection": {"ado-trastuzumab emtansine 100 MG Injection code"} display 'ado-trastuzumab emtansine 100 MG Injection'
concept "paclitaxel 100 MG Injection": {"paclitaxel 100 MG Injection code"} display 'paclitaxel 100 MG Injection'

concept "HER2 [Presence] in Breast cancer specimen by Immune stain" {"HER2 [Presence] in Breast cancer specimen by Immune stain code"} display 'HER2 [Presence] in Breast cancer specimen by Immune stain'

concept "Primary cancers": {
    "11p partial monosomy syndrome 4135001 code",
    "Orbital lymphoma 13048006 code",
    "Delta heavy chain disease 20224008 code",
    "Malignant neoplasm of breast 254837009 code",
    "Primary malignant neoplasm of colon 93761005 code",
    "Secondary malignant neoplasm of colon 94260004 code",
    "Carcinoma in situ of prostate (disorder) 92691004 code",
    "Small cell carcinoma of lung (disorder) 254632001 code",
    "Non-small cell lung cancer (disorder) 254637007 code":
}


context Patient

define "Primary Cancer Condition":
    [Condition: code in "Primary cancers"] Cancer

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
// End Header