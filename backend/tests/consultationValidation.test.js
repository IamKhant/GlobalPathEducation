const test = require('node:test');
const assert = require('node:assert/strict');
const { validateConsultationPayload } = require('../src/utils/consultationValidation');

test('accepts a valid consultation payload and normalizes text', () => {
  const result = validateConsultationPayload({
    fullName: '  Khant Zin Ko ',
    email: ' KHANT@example.com ',
    phone: ' +60 12 345 6789 ',
    programId: '12',
    consultantId: '3',
    preferredCountry: ' Australia ',
    studyLevel: ' Master ',
    message: ' Need help comparing programs. ',
  });

  assert.equal(result.error, undefined);
  assert.deepEqual(result.data, {
    fullName: 'Khant Zin Ko',
    email: 'khant@example.com',
    phone: '+60 12 345 6789',
    programId: 12,
    consultantId: 3,
    preferredCountry: 'Australia',
    studyLevel: 'Master',
    message: 'Need help comparing programs.',
  });
});

test('requires name and valid email', () => {
  assert.equal(validateConsultationPayload({ email: 'student@example.com' }).error, 'Full name is required');
  assert.equal(validateConsultationPayload({ fullName: 'Student' }).error, 'Email is required');
  assert.equal(
    validateConsultationPayload({ fullName: 'Student', email: 'not-an-email' }).error,
    'Valid email is required',
  );
});

test('rejects invalid relationship ids before database writes', () => {
  assert.equal(
    validateConsultationPayload({ fullName: 'Student', email: 'student@example.com', programId: 'abc' }).error,
    'Invalid program selected',
  );
  assert.equal(
    validateConsultationPayload({ fullName: 'Student', email: 'student@example.com', consultantId: '-2' }).error,
    'Invalid consultant selected',
  );
});
