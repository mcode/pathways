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
code "10 ML Doxorubicin Hydrochloride 2 MG/ML Injection code": '1790099' from "RXNORM" display '10 ML Doxorubicin Hydrochloride 2 MG/ML Injection'


// FHIR CONCEPTS

// Observations
concept "T0 category (finding)": {"T0 category (finding) code"} display 'T0 category (finding)'
concept "T1 category (finding)": {"T1 category (finding) code"} display 'T1 category (finding)'
concept "N0 category (finding)": {"N0 category (finding) code"} display 'N0 category (finding)'
concept "N1 category (finding)": {"N1 category (finding) code"} display 'N1 category (finding)'
// Medication Requests
concept "10 ML Doxorubicin Hydrochloride 2 MG/ML Injection": {"10 ML Doxorubicin Hydrochloride 2 MG/ML Injection code"} display '10 ML Doxorubicin Hydrochloride 2 MG/ML Injection'


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
// End Header