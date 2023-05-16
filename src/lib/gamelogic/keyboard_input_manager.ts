import { open_popups } from "$lib/stores/popupstore";
import { get } from "svelte/store";

const eventTouchstart = "touchstart";
const eventTouchmove = "touchmove";
const eventTouchend = "touchend";

const map = {
	38: 0,
	39: 1,
	40: 2,
	37: 3,
	75: 0,
	76: 1,
	74: 2,
	72: 3,
	87: 0,
	68: 1,
	83: 2,
	65: 3 // A
};

export default class KeyboardInputManager {
	enabled: boolean;
	documentRoot!: HTMLElement;
	events!: {
		[event: string]: unknown[];
	};
	boundKeyDownHandler!: (event: KeyboardEvent) => void;
	addKeydownHandler!: () => void;
	removeKeydownHandler!: () => void;

	constructor(documentRoot: HTMLElement, enabled = true) {
		this.enabled = enabled;
		if (!enabled) {
			return;
		}
		this.documentRoot = documentRoot;
		this.events = {};

		this.boundKeyDownHandler = this.keydownHandler.bind(this);

		this.addKeydownHandler = () => {
			if (typeof document.oh_keylistener !== "undefined" && document.oh_keylistener != null) {
				console.warn("A keylistener already exists! Trying to remove it...");
				document.oh_keylistener.removeKeydownHandler();
			}
			document.addEventListener("keydown", this.boundKeyDownHandler);
			document.oh_keylistener = this;
			console.info("Keylistener registered succesfully!");
		};
		this.removeKeydownHandler = () => {
			document.removeEventListener("keydown", this.boundKeyDownHandler);
			if (typeof document.oh_keylistener !== "undefined" || document.oh_keylistener !== null) {
				document.oh_keylistener = null;
			}
			console.info("Keylistener removed succesfully!");
		};

		this.listen();
	}
	on(event, callback) {
		if (!this.enabled) {
			return;
		}
		if (!this.events[event]) {
			this.events[event] = [];
		}
		this.events[event].push(callback);
	}
	emit(event, data) {
		let to_return = false;
		if (this.enabled) {
			const callbacks = this.events[event];
			if (callbacks) {
				callbacks.forEach(function (callback) {
					to_return = callback(data) || to_return;
				});
			}
		}
		return to_return;
	}

	listen() {
		if (!this.enabled) {
			return;
		}
		const self = this;

		// Respond to direction keys
		this.addKeydownHandler();

		// Respond to button presses
		this.bindButtonPress(".retry-button", this.restart);
		//this.bindButtonPress(".restart-button", this.restart);
		//this.bindContextPress(".restart-button", this.restartplus);
		this.bindButtonPress(".keep-playing-button", this.keepPlaying);
		this.bindButtonPress(".kurin-palautus", this.paritaKuli);
		this.bindButtonPress(".event-button", this.toggleDarkMode);

		if (!this.documentRoot) {
			return;
		}
		// Respond to swipe events
		let touchStartClientX, touchStartClientY;
		const gameContainer = this.documentRoot.getElementsByClassName("game-container")[0];

		if (gameContainer) {
			gameContainer.addEventListener(
				eventTouchstart,
				function (event) {
					if (event.touches.length > 1 || event.targetTouches.length > 1) {
						return; // Ignore if touching with more than 1 finger
					}

					touchStartClientX = event.touches[0].clientX;
					touchStartClientY = event.touches[0].clientY;

					event.preventDefault();
				},
				{ passive: false }
			);

			gameContainer.addEventListener(
				eventTouchmove,
				function (event) {
					event.preventDefault();
				},
				{ passive: false }
			);

			gameContainer.addEventListener(
				eventTouchend,
				function (event) {
					if (event.touches.length > 0 || event.targetTouches.length > 0) {
						return; // Ignore if still touching with one or more fingers
					}

					let touchEndClientX, touchEndClientY;

					touchEndClientX = event.changedTouches[0].clientX;
					touchEndClientY = event.changedTouches[0].clientY;

					const dx = touchEndClientX - touchStartClientX;
					const absDx = Math.abs(dx);

					const dy = touchEndClientY - touchStartClientY;
					const absDy = Math.abs(dy);

					if (Math.max(absDx, absDy) > 10) {
						// (right : left) : (down : up)
						self.emit("move", absDx > absDy ? (dx > 0 ? 1 : 3) : dy > 0 ? 2 : 0);
					}
				},
				{ passive: false }
			);
		}
	}
	keydownHandler(event) {
		if (!this.enabled || get(open_popups).length > 0) {
			return;
		}
		const modifiers = event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
		const mapped = map[event.which];

		if (!modifiers) {
			if (mapped !== undefined) {
				let result = this.emit("move", mapped);
				if (result !== false) {
					event.preventDefault();
				}
			}
		}

		// R key restarts the game
		if (!modifiers && event.which === 82) {
			this.restart.call(this, event);
		}
	}
	restart(event) {
		if (!this.enabled) {
			return;
		}
		if (this.emit("restart", null) !== false) event.preventDefault();
	}
	restartplus(event) {
		if (!this.enabled) {
			return;
		}
		event.preventDefault();
		this.emit("restartplus", null);
		event.stopPropagation();
	}
	keepPlaying(event) {
		if (!this.enabled) {
			return;
		}
		event.preventDefault();
		this.emit("keepPlaying", null);
	}
	bindButtonPress(selector, fn) {
		if (!this.enabled) {
			return;
		}
		if (!this.documentRoot) {
			return;
		}
		const button = this.documentRoot.querySelector(selector);
		if (button) {
			button.addEventListener("click", fn.bind(this));
			button.addEventListener(this.eventTouchend, fn.bind(this));
		}
	}
	bindContextPress(selector, fn) {
		if (!this.enabled) {
			return;
		}
		const button = this.documentRoot.querySelector(selector);
		if (button) {
			button.addEventListener("contextmenu", fn.bind(this));
		}
	}
	paritaKuli(event) {
		if (!this.enabled) {
			return;
		}
		event.preventDefault();
		this.emit("paritaKuli", null);
		event.stopPropagation();
	}
	toggleEvent(event) {
		if (!this.enabled) {
			return;
		}
		event.preventDefault();
		this.emit("toggleEvent", null);
		event.stopPropagation();
	}
	toggleDarkMode(event) {
		if (!this.enabled) {
			return;
		}
		event.preventDefault();
		this.emit("toggleDarkMode", null);
		event.stopPropagation();
	}
}
