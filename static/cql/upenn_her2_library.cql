library upennResources version '1'

using FHIR version '4.0.0'

// CODESYSTEMS

codesystem "SNOMEDCT": 'http://snomed.info/sct'
codesystem "LOINC": 'http://loinc.org'
codesystem "RXNORM": 'http://www.nlm.nih.gov/research/umls/rxnorm'

// FHIR CODES

// LOINC Observation Codes
code "Primary tumor.clinical [Class] Cancer code": '21905-5' from "LOINC" display 'Primary tumor.clinical [Class] Cancer'
code "Regional lymph nodes.clinical [Class] Cancer code": '21906-3' from "LOINC" display 'Regional lymph nodes.clinical [Class] Cancer'
code "Estrogen receptor Ag [Presence] in Breast cancer specimen by Immune stain code": '85337-4' from "LOINC" display 'Estrogen receptor Ag [Presence] in Breast cancer specimen by Immune stain'
code "Age at menopause code": '42802-9' from "LOINC" display 'Age at menopause'
code "Menses finding code": '32400-4' from "LOINC" display 'Menses finding'
code "missing loinc code": '1234' from "LOINC" display 'LOINC Code'

// SNOMED Observation Values
code "T0 category (finding) code": '58790005' from "SNOMEDCT" display 'T0 category (finding)'
code "T1 category (finding) code": '23351008' from "SNOMEDCT" display 'T1 category (finding)'
code "T2 category (finding) code": '67673008' from "SNOMEDCT" display 'T2 category (finding)'
code "T3 category (finding) code": '14410001' from "SNOMEDCT" display 'T3 category (finding)'
code "T4 category (finding) code": '65565005' from "SNOMEDCT" display 'T4 category (finding)'
code "N0 category (finding) code": '62455006' from "SNOMEDCT" display 'N0 category (finding)'
code "N1 category (finding) code": '53623008' from "SNOMEDCT" display 'N1 category (finding)'
code "N2 category (finding) code": '46059003' from "SNOMEDCT" display 'N2 category (finding)'
code "N3 category (finding) code": '5856006' from "SNOMEDCT" display 'N3 category (finding)'
code "Positive (qualifier value) code": '10828004' from "SNOMEDCT" display 'Positive (qualifier value)'
code "Negative (qualifier value) code": '260385009' from "SNOMEDCT" display 'Negative (qualifier value)'
code "Menopause present (finding) code": '289903006' from "SNOMEDCT" display 'Menopause present (finding)'
code "Menopause absent (finding) code": '289904000' from "SNOMEDCT" display 'Menopause absent (finding)'
code "Menstruation, function (observable entity) code": '248957007' from "SNOMEDCT" display 'Menstruation, function (observable entity)'
code "Secondary amenorrhea (finding) code": '156036003' from "SNOMEDCT" display 'Secondary amenorrhea (finding)'
code "Abnormal estradiol (finding) code": '131064004' from "SNOMEDCT" display 'Abnormal estradiol (finding)'


// SNOMED Procedures
code "Chemotherapy (procedure) code": '367336001' from "SNOMEDCT" display 'Chemotherapy (procedure)'
code "Oophorectomy (procedure) code": '83152002' from "SNOMEDCT" display 'Oophorectomy (procedure)'


// RXNORM Medication Request
code "trastuzumab code": '224905' from "RXNORM" display 'trastuzumab'
code "anastrozole code": '84857' from "RXNORM" display 'anastrozole'
code "tamoxifen code": '10324' from "RXNORM" display 'tamoxifen'
code "Lupron code": '203852' from "RXNORM" display 'Lupron'



// FHIR CONCEPTS

// Observations
concept "T0 category (finding)": {"T0 category (finding) code"} display 'T0 category (finding)'
concept "T1 category (finding)": {"T1 category (finding) code"} display 'T1 category (finding)'
concept "T2 category (finding)": {"T2 category (finding) code"} display 'T2 category (finding)'
concept "T3 category (finding)": {"T3 category (finding) code"} display 'T3 category (finding)'
concept "T4 category (finding)": {"T4 category (finding) code"} display 'T4 category (finding)'
concept "N0 category (finding)": {"N0 category (finding) code"} display 'N0 category (finding)'
concept "N1 category (finding)": {"N1 category (finding) code"} display 'N1 category (finding)'
concept "N2 category (finding)": {"N2 category (finding) code"} display 'N2 category (finding)'
concept "N3 category (finding)": {"N3 category (finding) code"} display 'N3 category (finding)'
concept "Positive (qualifier value)": {"Positive (qualifier value) code"} display 'Positive (qualifier value)'
concept "Negative (qualifier value)": {"Negative (qualifier value) code"} display 'Negative (qualifier value)'
concept "Menopause present (finding)": {"Menopause present (finding) code"} display 'Menopause present (finding)'
concept "Menopause absent (finding)": {"Menopause absent (finding) code"} display 'Menopause absent (finding)'
concept "Abnormal estradiol (finding)": {"Abnormal estradiol (finding) code"} display 'Abnormal estradiol (finding)'
concept "Menstruation, function (observable entity)": {"Menstruation, function (observable entity) code"} display 'Menstruation, function (observable entity)'
concept "Secondary amenorrhea (finding)": {"Secondary amenorrhea (finding) code"} display 'Secondary amenorrhea (finding)'

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

