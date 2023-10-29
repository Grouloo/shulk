import { describe, expect, test } from 'bun:test'
import match from '../match'

function uvToRisk(uv: number) {
	const risk = match(uv).with({
		0: 'No light',
		'1..3': 'Low',
		'4..7': 'Moderate',
		'8..10': 'High',
		'11..13': 'Very high',
		'14..16': 'Extreme',
		_otherwise: 'Out of range',
	})

	return risk
}

describe('with tests', () => {
	test('should return No light when matching 0', () => {
		expect(uvToRisk(0)).toBe('No light')
	})

	test('should return Out of range when matching unspecified number', () => {
		expect(uvToRisk(17)).toBe('Out of range')
	})

	test('should return Low when matching 1', () => {
		expect(uvToRisk(1)).toBe('Low')
	})

	test('should return Low when matching 2', () => {
		expect(uvToRisk(2)).toBe('Low')
	})

	test('should return Low when matching 3', () => {
		expect(uvToRisk(3)).toBe('Low')
	})
})

function caseUvToRisk(uv: number) {
	const risk = match(uv).case({
		0: () => 'No light',
		'1..3': () => 'Low',
		'4..7': () => 'Moderate',
		'8..10': () => 'High',
		'11..13': () => 'Very high',
		'14..16': () => 'Extreme',
		_otherwise: () => 'Out of range',
	})

	return risk
}

describe('case tests', () => {
	test('should return No light when matching 0', () => {
		expect(caseUvToRisk(0)).toBe('No light')
	})

	test('should return Out of range when matching unspecified number', () => {
		expect(caseUvToRisk(17)).toBe('Out of range')
	})

	test('should return Low when matching 1', () => {
		expect(caseUvToRisk(1)).toBe('Low')
	})

	test('should return Low when matching 2', () => {
		expect(caseUvToRisk(2)).toBe('Low')
	})

	test('should return Low when matching 3', () => {
		expect(caseUvToRisk(3)).toBe('Low')
	})
})
