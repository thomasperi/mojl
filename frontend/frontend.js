/**
 * A simple utility for initializing encapsulated modules by selector.
 * (Written in archaic JavaScript for extreme backward-compatibility.)
 *
 * On DOMContentLoaded, each instance gets initialized with its own closure
 * where it can keep its own state.
 *
 * Example Usage:
 *
 * <div class="click-counter">
 *   <div>5</div>
 *   <button>increment</button>
 * </div>
 * <div class="click-counter">
 *   <div>23</div>
 *   <button>increment</button>
 * </div>
 *
 * mojl.each('.click-counter', clickCounter => {
 *   const button = clickCounter.querySelector('button');
 *   const display = clickCounter.querySelector('div');
 *   let count = parseInt(display.innerText);
 *   button.addEventListener('click', () => {
 *     display.innerText = ++count;
 *   });
 * });
 *
 */
window.mojl = window.mojl || {
	each: (function () {
		var queue = [];
		document.addEventListener('DOMContentLoaded', function () {
			// Use a loop instead of forEach, because a loop can grow with the queue
			// in real time, in the (albeit weird) case of nested mojl.each() calls.
			while (queue.length > 0) {
				queue.shift()();
			}
			queue = null;
		});
		return function (selector, fn) {
			function run() {
				document.querySelectorAll(selector).forEach(fn);
			}
			if (queue) {
				queue.push(run);
			} else {
				run();
			}
		};
	}())
};
