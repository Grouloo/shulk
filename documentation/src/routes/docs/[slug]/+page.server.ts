import { match } from 'shulk';
import { marked } from 'marked';
import Introduction from '$lib/docs/introduction.md?raw';
import GetStarted from '$lib/docs/getting-started.md?raw';
import PatternMatching from '$lib/docs/pattern-matching.md?raw';
import TaggedUnions from '$lib/docs/tagged-unions.md?raw';
import Result from '$lib/docs/result.md?raw';
import Maybe from '$lib/docs/maybe.md?raw';
import Loading from '$lib/docs/loading.md?raw';

/** @type {import('./$types').PageLoad} */
export function load({ params }) {
	const title = match(params.slug).with({
		'get-started': 'Get started',
		'pattern-matching': 'Pattern matching',
		'tagged-unions': 'Tagged unions',
		result: 'Result',
		maybe: 'Maybe',
		loading: 'Loading',
		_otherwise: 'Introduction'
	});

	const doc = match(params.slug).case({
		'get-started': () => GetStarted,
		'pattern-matching': () => PatternMatching,
		'tagged-unions': () => TaggedUnions,
		result: () => Result,
		maybe: () => Maybe,
		loading: () => Loading,
		_otherwise: () => Introduction
	});

	return { title, doc: marked.parse(doc) };
}
