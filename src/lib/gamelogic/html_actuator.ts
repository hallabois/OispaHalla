import { get_base_path } from "$lib/stores/themestore";

export default class HTMLActuator {
	html_component: HTMLElement;
	tileContainer: any;
	scoreContainer: any;
	messageContainer: any;
	kurinPalautusViesti: any;
	kurinPalautusNappi: any;
	kurinPalautusColor: any;

	documentRoot: HTMLElement;

	score: number;
	constructor(documentRoot: HTMLElement) {
		this.documentRoot = documentRoot;
		//console.info("html actuator initialized with root", this.documentRoot);

		this.html_component = documentRoot;
		this.tileContainer = documentRoot.querySelector(".tile-container");
		this.scoreContainer = documentRoot.querySelector(".score-container");
		this.messageContainer = documentRoot.querySelector(".game-message");

		this.kurinPalautusViesti = documentRoot.querySelector(".kurin-palautus-viesti");
		this.kurinPalautusNappi = documentRoot.querySelector(".kurin-palautus");

		this.score = 0;
	}
	actuate(grid, metadata) {
		// @ts-ignore, it works or it doesn't
		this.html_component.style = "--grid-size:" + grid.size + "!important;";

		window.requestAnimationFrame(() => {
			this.clearContainer(this.tileContainer);

			grid.cells.forEach((column) => {
				column.forEach((cell) => {
					if (cell) {
						this.addTile(cell);
					}
				});
			});

			this.updateScore(metadata.score, metadata.palautukset, metadata.terminated);

			if (metadata.terminated) {
				if (metadata.over) {
					this.message(false, metadata.palautukset); // You lose
				} else if (metadata.won) {
					this.message(true, metadata.palautukset); // You win!
				}
			}
			const base_path = get_base_path();
			if (base_path && base_path != "") {
				// @ts-ignore, probably doesn't work but we don't care
				const images = [...this.documentRoot.querySelectorAll(".tile-inner")];
				console.log("Images: ", images);
				for (const i in images) {
					const img = images[i];
					console.log("img", i, img);
					img.style.background = window
						.getComputedStyle(img)
						.background.replaceAll("/img", base_path);
				}
			}
		});
	}
	// Continues the game (both restart and keep playing)
	continueGame() {
		this.clearMessage();
	}
	clearContainer(container) {
		if (container) {
			while (container.firstChild) {
				container.removeChild(container.firstChild);
			}
		} else {
			console.warn("Tile container missing!");
		}
	}
	//Remove merged tiles (call after 100ms)
	removeMergedTile(tile) {
		if (tile.parentElement) {
			tile.parentElement.removeChild(tile);
		}
	}
	addTile(tile) {
		const wrapper = document.createElement("div");
		const inner = document.createElement("div");
		const position = tile.previousPosition || { x: tile.x, y: tile.y };
		const positionClass = this.positionClass(position);

		// We can't use classlist because it somehow glitches when replacing classes
		const classes = ["tile", "tile-" + tile.value, positionClass];

		if (tile.value > 2048) classes.push("tile-super");

		this.applyClasses(wrapper, classes);

		inner.classList.add("tile-inner");

		if (tile.previousPosition) {
			// Make sure that the tile gets rendered in the previous position first
			window.requestAnimationFrame(() => {
				classes[2] = this.positionClass({ x: tile.x, y: tile.y });
				this.applyClasses(wrapper, classes); // Update the position
			});
		} else if (tile.mergedFrom) {
			classes.push("tile-merged");
			this.applyClasses(wrapper, classes);

			// Render the tiles that merged
			tile.mergedFrom.forEach((merged) => {
				this.addTile(merged);
			});
		} else {
			classes.push("tile-new");
			this.applyClasses(wrapper, classes);
		}

		if (tile.hasBeenMerged) {
			// Remove this tile from the dom after it's animation has finished (animation lenght 100ms)
			setTimeout(() => {
				this.removeMergedTile(wrapper);
			}, 100);
		}

		// Add the inner part of the tile to the wrapper
		wrapper.appendChild(inner);

		// Put the tile on the board
		this.tileContainer.appendChild(wrapper);
	}
	applyClasses(element, classes) {
		element.setAttribute("class", classes.join(" "));
	}
	normalizePosition(position) {
		return { x: position.x + 1, y: position.y + 1 };
	}
	positionClass(position) {
		position = this.normalizePosition(position);
		return "tile-position-" + position.x + "-" + position.y;
	}
	updateScore(score, palautukset, terminated) {
		if (this.scoreContainer) {
			this.clearContainer(this.scoreContainer);

			const difference = score - this.score;
			this.score = score;

			this.scoreContainer.textContent = this.score;

			if (difference > 0) {
				const addition = document.createElement("div");
				addition.classList.add("score-addition");
				addition.textContent = "+" + difference;

				this.scoreContainer.appendChild(addition);
			}

			if (this.score >= 1000 && palautukset < 3 && !terminated) {
				this.kurinPalautusNappi.classList.add("allowed");
			} else {
				this.kurinPalautusNappi.classList.remove("allowed");
			}
		} else {
			//console.warn("Score container missing!");
		}
	}
	message(won, kurinPalautukset) {
		const type = won ? "game-won" : "game-over";
		const message = won ? "HALLA!" : "Improbatur...";
		//TODO: eri viestejä riippuen parhaimmasta ruudusta pelissä
		this.messageContainer.classList.add(type);
		this.messageContainer.getElementsByTagName("p")[0].textContent = message;

		this.messageContainer.getElementsByTagName(
			"p"
		)[1].textContent = `Kurinpalautukset: ${kurinPalautukset}/3`;
	}
	clearMessage() {
		// IE only takes one value to remove at a time.
		this.messageContainer.classList.remove("game-won");
		this.messageContainer.classList.remove("game-over");
	}
	paritaKuli() {
		this.clearContainer(this.scoreContainer);
		this.clearContainer(this.kurinPalautusViesti);
		if (this.scoreContainer) {
			this.scoreContainer.textContent = this.score - 1000;

			const addition = document.createElement("div");
			addition.classList.add("score-addition");
			addition.textContent = "-1000";
			this.scoreContainer.appendChild(addition);

			const messageElement = document.createElement("img");
			messageElement.setAttribute("src", "./img/parinkulautus.png");

			this.kurinPalautusViesti.appendChild(messageElement);
		} else {
			//console.warn("Score container missing!");
		}
		return true;
	}
}
