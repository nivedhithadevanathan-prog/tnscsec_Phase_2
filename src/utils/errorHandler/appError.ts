export class AppError extends Error {
	code: string;
	statusCode: number;
	message: string;

	constructor(code: string, statusCode: number, message: string) {
		super(message);
		this.code = code;
		this.statusCode = statusCode;
		this.message = message;

		// Capture stack trace correctly
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, AppError);
		} else {
			this.stack = new Error().stack;
		}
		Object.setPrototypeOf(this, new.target.prototype);
	}
}