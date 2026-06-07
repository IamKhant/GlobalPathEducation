function normalizeText(value) {
  if (typeof value !== 'string') return '';
  return value.trim();
}

function normalizeOptionalText(value) {
  const normalized = normalizeText(value);
  return normalized || null;
}

function parseOptionalPositiveInt(value) {
  if (value === '' || value == null) return null;

  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) return undefined;
  return parsed;
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validateConsultationPayload(body = {}) {
  const fullName = normalizeText(body.fullName || body.name);
  const email = normalizeText(body.email).toLowerCase();
  const programId = parseOptionalPositiveInt(body.programId);
  const consultantId = parseOptionalPositiveInt(body.consultantId);

  if (!fullName) {
    return { error: 'Full name is required' };
  }

  if (!email) {
    return { error: 'Email is required' };
  }

  if (!isValidEmail(email)) {
    return { error: 'Valid email is required' };
  }

  if (programId === undefined) {
    return { error: 'Invalid program selected' };
  }

  if (consultantId === undefined) {
    return { error: 'Invalid consultant selected' };
  }

  return {
    data: {
      programId,
      consultantId,
      fullName,
      email,
      phone: normalizeOptionalText(body.phone),
      preferredCountry: normalizeOptionalText(body.preferredCountry),
      studyLevel: normalizeOptionalText(body.studyLevel),
      message: normalizeOptionalText(body.message),
    },
  };
}

module.exports = {
  validateConsultationPayload,
};
