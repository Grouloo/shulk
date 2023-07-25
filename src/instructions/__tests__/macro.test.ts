import { expect, test } from '@jest/globals'
import { $defMacro } from '../defMacro'

function $repository(table: string) {
	return $defMacro({
		props: {
			table,
		},
		methods: {
			getTable: (self) => self.table,
			setTable: (self, newTable: string) => {
				self.table = newTable
			},
			read: (self, id: number) => ({
				id,
				name: 'John Doe',
				table: self.table,
			}),
		},
	})
}

const userRepository = $repository('users')

test('macro instantiation test', () => {
	expect(userRepository.table).toBe('users')
})

test('macro argumentless method test', () => {
	expect(userRepository.getTable()).toBe('users')
})

test('macro argument-using method test', () => {
	expect(userRepository.read(54)).toEqual({
		id: 54,
		name: 'John Doe',
		table: 'users',
	})
})

test('self mutability test', () => {
	userRepository.setTable('cars')

	expect(userRepository.table).toBe('cars')
})
