function MT(seed) {
	const N = 624;
	const M = 397;

	function twist(state) {
		const DIFF = N - M;
		const M_MINUS_1 = 396;
		const N_MINUS_1 = 623;
		const MATRIX_A = 0x9908b0df;
		const UPPER_MASK = 0x80000000;
		const LOWER_MASK = 0x7fffffff;
		let bits;
		// first 624-397=227 words
		for (let i = 0; i < DIFF; i++) {
			bits = (state[i] & UPPER_MASK) | (state[i + 1] & LOWER_MASK);
			state[i] = state[i + M] ^ (bits >>> 1) ^ ((bits & 1) * MATRIX_A);
		}
		// remaining words (except the very last one)
		for (let i = DIFF; i < N_MINUS_1; i++) {
			bits = (state[i] & UPPER_MASK) | (state[i + 1] & LOWER_MASK);
			state[i] = state[i - DIFF] ^ (bits >>> 1) ^ ((bits & 1) * MATRIX_A);
		}
		// last word is computed pretty much the same way, but i + 1 must wrap around to 0
		bits = (state[N_MINUS_1] & UPPER_MASK) | (state[0] & LOWER_MASK);
		state[N_MINUS_1] =
			state[M_MINUS_1] ^ (bits >>> 1) ^ ((bits & 1) * MATRIX_A);
		return state;
	}
	// The original algorithm used 5489 as the default seed
	function initialize(seed = Date.now()) {
		let state = new Array(N);
		// fill initial state
		state[0] = seed;
		for (let i = 1; i < N; i++) {
			let s = state[i - 1] ^ (state[i - 1] >>> 30);
			// avoid multiplication overflow: split 32 bits into 2x 16 bits and process them individually
			state[i] =
				((((s & 0xffff0000) >>> 16) * 1812433253) << 16) +
				(s & 0x0000ffff) * 1812433253 +
				i;
		}
		return twist(state);
	}
	let state = initialize(seed);
	let next = 0;
	let randomInt32 = () => {
		let x;

		if (next >= N) {
			state = twist(state);
			next = 0;
		}

		x = state[next++];

		// Tempering
		x ^= x >>> 11;
		x ^= (x << 7) & 0x9d2c5680;
		x ^= (x << 15) & 0xefc60000;
		x ^= x >>> 18;

		// Convert to unsigned
		return x >>> 0;
	};
	let api = {
		// [0,0xffffffff]
		genrand_int32: () => randomInt32(),
		// [0,0x7fffffff]
		genrand_int31: () => randomInt32() >>> 1,
		// [0,1]
		genrand_real1: () => randomInt32() * (1.0 / 4294967295.0),
		// [0,1)
		genrand_real2: () => randomInt32() * (1.0 / 4294967296.0),
		// (0,1)
		genrand_real3: () => (randomInt32() + 0.5) * (1.0 / 4294967296.0),
		// [0,1), 53-bit resolution
		genrand_res53: () => {
			let a = randomInt32() >>> 5;
			let b = randomInt32() >>> 6;

			return (a * 67108864.0 + b) * (1.0 / 9007199254740992.0);
		},

		randomNumber: () => randomInt32(),
		random31Bit: () => api.genrand_int31(),
		randomInclusive: () => api.genrand_real1(),
		random: () => api.genrand_real2(), // returns values just like Math.random
		randomExclusive: () => api.genrand_real3(),
		random53Bit: () => api.genrand_res53(),
	};

	return api;
}
// random x winners out of y
const xOfy = (x, y, seed) => {
    const { random } = MT(seed);
    const all = [];
    for(let i = 1; i <= y; i++) {
        all.push(i);
    }
    all.sort(() => random() - 0.5);
    return all.slice(0, x);
}
const good = [
    "💎",
	"🌟",
	"🔔",
	"🎁",
	"💵",
	"🪙",
	"🎯",
	"🚀",
	"🍀",
	"🔥",
	"🧸",
	"🌶️",
	"🍭",
	"🍪",
	"🎈",
	"🍓",
	"🍒",
	"🍑",
	"🍎",
	"🍊",
	"🍋",
	"🍋‍🟩",
	"🍇",
	"🍉",
	"🍆",
	"🍄‍🟫",
	"🍄",
];

// map winning number based on it's place, to emoji place >= 0
const moji = (place, winningPlaces = 1) => {
    if (place >= winningPlaces) {
        return ["❌️", "❌️", "❌️"];
    }
    const mod = good.length;
    const res = []
    let n = place;
    for(let i = 0; i < 3; i++) {
        res.push(good[n % mod]);
        n = Math.floor(n / mod);
    }
    return res.reverse();
}

const winners = xOfy(100, 100, 1234567);
const res = winners.map((n, i) => [n, moji(i, 100)])
console.table(res);