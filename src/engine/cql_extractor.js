/* eslint-disable guard-for-in */
// Extract CQL Statements from JSON Pathway
// const fs = require('fs');
// const path = require('path');

// const context = require.context('./libraries', true, /\.cql$/);
// const libraries = {};
// context.keys().forEach(function (key) {
//   debugger;
//     libraries[key] = context(key);
// });

const getFixture = (filename) => `library mCODEResources version '1'

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

// End Header`;

/**
 * Function to format each block from the pathway in CQL format
 * @param {String} cqlBlock - block of CQL code from the pathway
 * @param {String} resourceName - Name of the CQL resource block to be defined
 * @return {string} the CQL code formatted pretty with the define line
 */
function cqlFormat(cqlBlock, resourceName) {
  let formattedBlock = '';

  // Definition of CQL block
  const line1 = 'define "' + resourceName + '":\n\t';

  // Build the formatted block
  formattedBlock = line1.concat(cqlBlock);
  return formattedBlock;
}

/**
 * Helper function to add the cql block to the completed cql
 * with the correct formatting
 * @param {string} cql - complete cql string
 * @param {string} cqlBlock - current cql block to append to the cql
 * @return {string} the cql with the cql block appended correctly
 */
function cqlAdd(cql, cqlBlock) {
  return cql.concat('\n', '\n', cqlBlock);
}

/**
 * Helper function to determine if a state has a conditional transition
 * @param {Object} state - the JSON object of the desired state on the pathway
 * @return {boolean} true if state is a conditional transition and false
 *                   otherwise
 */
function isConditional(state) {
  if (state.hasOwnProperty('transitions')) {
    return state.transitions.length > 1 ? true : false;
  } else return false;
}

/**
 * Function to extract the CQL code from each state in the pathway and build
 * the CQL code to execute
 * @param {Object} pathway - the JSON object of the entire pathway
 * @return {string} a string of the CQL code for the pathway
 */
export const extractor = function(pathway) {
  let cql = getFixture(pathway.library);

  // Loop through each JSON object in the pathway
  for (const stateName in pathway.states) {
    const state = pathway.states[stateName];
    if (state.hasOwnProperty('cql')) {
      const cqlBlock1 = state.cql;
      const nextBlock1 = cqlFormat(cqlBlock1, stateName);
      cql = cqlAdd(cql, nextBlock1);
    } else if (isConditional(state)) {
      for (const obj in state.transitions) {
        const cqlBlock2 = state.transitions[obj].condition.cql;
        const conditionalDescription = state.transitions[obj].condition.description;
        const nextBlock2 = cqlFormat(cqlBlock2, conditionalDescription);
        cql = cqlAdd(cql, nextBlock2);
      }
    }
  }

  return cql;
};
