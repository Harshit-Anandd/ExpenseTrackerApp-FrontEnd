const getErrorMessage = (error, fallbackMessage = "Something went wrong") => {
  const messageFromResponse = error?.response?.data?.message;

  if (typeof messageFromResponse === "string" && messageFromResponse.trim()) {
    return messageFromResponse;
  }

  const firstValidationError = error?.response?.data?.details
    ? Object.values(error.response.data.details)[0]
    : null;

  if (typeof firstValidationError === "string" && firstValidationError.trim()) {
    return firstValidationError;
  }

  if (typeof error?.message === "string" && error.message.trim()) {
    return error.message;
  }

  return fallbackMessage;
};

export { getErrorMessage };

