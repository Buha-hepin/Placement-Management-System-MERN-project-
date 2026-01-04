class apierror extends Error {
  constructor(
    statusCode = 500,
    message = "Something went wrong",
    errors = [],
    stack = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.success = false; // Indicates that the operation was not successful
    this.errors = errors; // Array of errors, if any
    this.isOperational = true; // Indicates that this is an operational error
    if (stack) {
      this.stack = stack;
    }
  }
}

export { apierror }