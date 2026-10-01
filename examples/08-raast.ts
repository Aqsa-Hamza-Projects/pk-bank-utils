import {detectIdentifier, validateRaastId, maskRaastId} from '../dist/index.js';

// State Bank of Pakistan's step 2 for sending funds over Raast: "Specify
// beneficiary's IBAN or Raast ID (mobile number) on Raast-enabled banks."
// One field, either form.
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
