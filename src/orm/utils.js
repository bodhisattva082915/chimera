export function withDefaultSession (options, defaultSession) {
	const session = options ? options.session : undefined;
	if (!session && defaultSession && !defaultSession.hasEnded) {
		options = {
			...options,
			session: defaultSession
		};
	}

	return options;
}
