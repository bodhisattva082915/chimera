export const generateTokens = (req, res) => {
	const { user } = req;
	const { accessToken } = user.generateTokens();

	res.json({ accessToken });
};
