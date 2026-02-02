import appCodes, { AppCode, AppCodeProp } from "./appCodes";

export interface ResponseProps {
	statusCode: number;
	success: boolean;
	message: string;
	code: AppCode | string;
	data?: any;
	error?: any;
}

interface GenerateResponseProps {
	message?: string;
	totalRecords?: number;
	error?: any;
	data?: any;
	statusCode?: number;
	code?: AppCode | string;
}

export function generate(code: AppCode, props?: GenerateResponseProps) {
	const matched = appCodes.find((e) => e.code === code) as AppCodeProp;

	let response: ResponseProps = {
		code,
		statusCode: matched?.statusCode || props?.error?.statusCode || 500,
		success: matched?.success || false,
		message: matched?.message || props?.message || "",
	};

	if (matched.success) {
		response.data = props?.data;
	} else {
		response = {
			code: props?.code || matched.code,
			statusCode: props?.statusCode || matched.statusCode || 500,
			message: props?.message || matched.message || "Error",
			error: props?.error,
			success: false,
		};
	}

	return response;
}

export default { generate };
