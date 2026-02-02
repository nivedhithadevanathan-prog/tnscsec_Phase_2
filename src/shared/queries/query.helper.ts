export const pageConfig = ({
	pageNumber = "1",
	pageSize = "25",
	pageSizeLimit = "25",
}: {
	pageNumber?: string;
	pageSize?: string;
	pageSizeLimit?: string;
}) => {
	const pn = parseInt(pageNumber || "1");
	const psl = parseInt(pageSizeLimit);
	let ps = parseInt(pageSize);

	if (ps > psl) {
		ps = psl;
	}
	return {
		skip: (pn - 1) * ps,
		take: ps,
	};
};

export const orderByConfig = ({
	sortBy = "createdAt",
	orderBy = "desc",
}: {
	sortBy?: string;
	orderBy?: "asc" | "desc";
}) => {
	return {
		[sortBy]: orderBy,
	};
};
export const isActiveConfig = ({ isActive }: { isActive?: boolean }) => {
	return {
		isActive: isActive ?? true,
	};
};