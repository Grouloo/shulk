// Let's create a Mario state machine and implement
// how he changes when he collides with a monster!

// With Shulk
// Quite simple, isn't it?
const Mario = state<{
	Small: { coins: number }
	Super: { coins: number }
	Fire: { coins: number }
	Superstar: { coins: number; timeLeft: number }
	Dead: {}
}>()
type Mario = State<typeof Mario>

function collideWithMonster(mario: Mario['any']): Mario['any'] {
	const updatedMario = match(mario)
		.returnType<Mario['any']>()
		.case({
			Small: () => Mario.Dead(),
			Super: (mario) => Mario.Small({ coins: mario.coins }),
			Fire: (mario) => Mario.Super({ coins: mario.coins }),
			Superstar: (mario) => mario,
			Dead: (mario) => mario,
		})

	return updatedMario
}

// Using OOP and the design pattern 'State'
// Same result, but much longer and much more implicit
interface MarioState {
	coins: number | null
	collideWithMonster(): void
}

class Mario implements MarioState {
	constructor(private state: MarioState) {}

	get coins(): number | null {
		return this.state.coins
	}

	changeState(state: MarioState) {
		this.state = state
	}

	collideWithMonster() {
		this.state.collideWithMonster()
	}
}

class Small implements MarioState {
	constructor(private mario: Mario, private _coins: number) {}

	get coins() {
		return this._coins
	}

	collideWithMonster() {
		this.mario.changeState(new Dead())
	}
}

class Super implements MarioState {
	constructor(private mario: Mario, private _coins: number) {}

	get coins() {
		return this._coins
	}

	collideWithMonster() {
		this.mario.changeState(new Small(this.mario, this.coins))
	}
}

class Fire implements MarioState {
	constructor(private mario: Mario, private _coins: number) {}

	get coins() {
		return this._coins
	}

	collideWithMonster() {
		return this.mario.changeState(new Super(this.mario, this.coins))
	}
}

class Superstar implements MarioState {
	private timeLeft: number

	constructor(private _coins: number) {
		this.timeLeft = 20
	}

	get coins() {
		return this._coins
	}

	collideWithMonster() {}
}

class Dead implements MarioState {
	get coins() {
		return null
	}

	collideWithMonster() {}
}
