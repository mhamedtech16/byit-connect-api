
exports.validateRequiredFields = (data, requiredFields) => {
  const missingFields = [];

  for (let field of requiredFields) {
    if (
      data[field] === undefined ||
      data[field] === null ||
      data[field] === ''
    ) {
      missingFields.push(field);
    }
  }

  if (missingFields.length > 0) {
    return {
      success: false,
      message: `Missing required field(s): ${missingFields.join(', ')}`,
      missing: missingFields,
    };
  }

  return { success: true };
};


exports.checkUniqueFields = async (model, data, uniqueFields) => {
  const duplicateFields = [];

  for (let field of uniqueFields) {
    const exists = await model.findOne({ [field]: data[field] });
    if (exists) {
      duplicateFields.push(field);
    }
  }

  if (duplicateFields.length > 0) {
    return {
      success: false,
      message: `The following field(s) must be unique and already exist: ${duplicateFields.join(', ')}`,
      duplicates: duplicateFields,
    };
  }

  return { success: true };
};
