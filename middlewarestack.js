export class MiddlewareStack {
	#middleWares = [];
	#tempMiddleWares = [];
	constructor() {
	}

	get handle() {
		return (req, res, next) => {
			const iter = this.#middleWares[Symbol.iterator]();

			const nextCallback = (nextParam) => {
				// We have an error or route, exit the stack early
				if (nextParam) {
					next(nextParam);
					return;
				}

				const current = iter.next();
				if (current.done) {
					// We are done, proceed to the next middleware
					next();
				} else {
					const middleWare = current.value;
					if (middleWare) {
						// Execute the middleware
						middleWare(req, res, nextCallback);
					} else {
						// Proceed to the next middleware in the stack
						nextCallback();
					}
				}
			};

			// Start processing
			nextCallback();
		}
	}

	/**
	 * Set the middleware array.
	 * @param {Object[]} middleWares - An array or similar iterable of middlewares
	 */
	setMiddleWares(middleWares) {
		const mid = [];
		for (let middleWare of middleWares) {
			if (middleWare) {
				mid.push(middleWare);
			}
		}
		this.#middleWares = mid;
	}

	/**
	 * Clear the temporary middleware array. This function is usually not needed, as commit() also clears the temporary array
	 */
	clear() {
		this.#tempMiddleWares = [];
	}

	/**
	 * Push a middleware to the temporary array.
	 * @param {Object} middleWare - The middleware to push
	 */
	push(middleWare) {
		if (middleWare) {
			this.#tempMiddleWares.push(middleWare);
		}
	}

	/**
	 * Replace the middleware array with the temporary array. Clear the temporary array.
	 */
	commit() {
		this.#middleWares = this.#tempMiddleWares;
		this.#tempMiddleWares = [];
	}
}
