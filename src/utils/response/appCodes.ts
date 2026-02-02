export interface AppCodeProp {
    code: AppCode;
    success: boolean,
    statusCode?: number,
    message?: string;
}

export type AppCode =
    'userCreated'
    | 'errorInCreatingUser'
    | 'loginFailed'
    | 'incorrectUsernameOrPassword'
    | 'success'
    | 'error'
    | 'recordCreatedSuccessfully' | 'userAlreadyExist' | 'logOut'|'loginSuccessful'|'validationError'

const appCodes: AppCodeProp[] = [
	{
		code: "success",
		success: true,
		statusCode: 200,
		message: "Request processed successfully",
	},
	{
		code: "userAlreadyExist",
		success: true,
		statusCode: 402,
		message: "User with same username already exist",
	},
	{
		code: "error",
		success: false,
		statusCode: 501,
		message: "Something went wrong",
	},

	{
		code: "validationError",
		success: false,
		statusCode: 400,
	},

	{
		code: "recordCreatedSuccessfully",
		success: true,
		statusCode: 201,
		message: "Record created successfully",
	},
	{
		code: "userCreated",
		success: true,
		statusCode: 201,
		message: "user created successfully",
	},
	{
		code: "errorInCreatingUser",
		success: false,
		statusCode: 400,
		message: "Error in creating user",
	},
	{
		code: "loginFailed",
		success: false,
		statusCode: 400,
		message: "Error while logging in",
	},
	{
		code: "incorrectUsernameOrPassword",
		success: false,
		statusCode: 400,
		message: "Incorrect username / password",
	},
	{
		code: "logOut",
		success: true,
		statusCode: 200,
		message: "logged out successfully",
	},
	{
		code: "loginSuccessful",
		success: true,
		statusCode: 200,
		message: "Logged in successfully",
	},
];


export default appCodes;