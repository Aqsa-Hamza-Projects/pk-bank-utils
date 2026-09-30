import {detectIdentifier, validateRaastId, maskRaastId} from '../dist/index.js';

// A Raast recipient field accepts either form: "Enter the recipient's Raast
// ID (mobile number or IBAN)" — MCB Islamic's Raast FAQ.
const pasted = ['PK36SCBL0000001123456702', '+92 300 1234567', '0300-1234567'];

for (const input of pasted) {
  const detected = detectIdentifier(input);
  console.log(`${input} -> ${detected.kind} (${detected.normalized})`);
}

const result = validateRaastId('+92 300 1234567');
console.log('Valid:', result.valid);
console.log('Normalized:', result.normalized);
console.log('Allocated operator:', result.allocatedOperator);
console.log('Known prefix:', result.knownPrefix);
console.log('Masked for display:', maskRaastId('+92 300 1234567'));
