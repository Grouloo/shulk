// Without Shulk
// Not a bad solution per se, but kinda hard to read...
function imperativeUvToRisk(uv: number) {
	if (0 <= uv && uv <= 3) {
		return 'Low'
	} else if (4 <= uv && uv <= 7) {
		return 'Moderate'
	} else if (8 <= uv && uv <= 10) {
		return 'High'
	} else if (11 <= uv && uv <= 13) {
		return 'Very high'
	} else if (14 <= uv && uv <= 16) {
		return 'Extreme'
	} else {
		return 'Out of range!'
	}
}

// With Shulk
// Much more compact and clear about the business rules!
function declarativeUvToRisk(uv: number) {
	const risk = match(uv).with({
		'0..3': 'Low',
		'4..7': 'Moderate',
		'8..10': 'High',
		'11..13': 'Very high',
		'14..16': 'Extreme',
		_otherwise: 'Out of range',
	})

	return risk
}
