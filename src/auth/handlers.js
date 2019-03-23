export const authenticationSuccess = (req, res) => {
	const { user } = req;
	const { accessToken, refreshToken } = user.generateTokens();

	res.json({ accessToken, refreshToken });
};
