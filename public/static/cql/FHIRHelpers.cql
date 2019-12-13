library FHIRHelpers version '4.0.0'

using FHIR version '4.0.0'

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
