const instanceMap = new WeakMap<HTMLElement, ImagesCompare>();

type InteractionMode = "drag" | "mousemove" | "click";

type ImagesCompareEvents =
	| "imagesCompare:initialised"
	| "imagesCompare:changed"
	| "imagesCompare:resized";

interface ImagesCompareOptions {
	initVisibleRatio?: number;
	interactionMode?: InteractionMode;
	animationDuration?: number;
	animationEasing?: string;
	addSeparator?: boolean;
	addDragHandle?: boolean;
	precision?: number;
}

interface ImagesCompareHandlerRefs {
	onResize: (event: UIEvent) => void;
	onClick: (event: MouseEvent) => void;
	onMouseMove: (event: MouseEvent) => void;
	onMouseOut: (event: MouseEvent) => void;
	onPointerDown: (event: PointerEvent) => void;
	onPointerMove: (event: PointerEvent) => void;
	onPointerUp: (event: PointerEvent) => void;
	onMouseDown: (event: MouseEvent) => void;
	onTouchStart: (event: TouchEvent) => void;
	onMouseMoveWindow: (event: MouseEvent) => void;
	onTouchMoveWindow: (event: TouchEvent) => void;
	onMouseUpWindow: (event: MouseEvent | TouchEvent) => void;
}

interface ImagesCompareSize {
	width: number;
	height: number;
	maxWidth: number;
	maxHeight: number;
}

class ImagesCompare {
	private element: HTMLElement;
	private options: Required<ImagesCompareOptions> & { roundFactor: number };
	private readonly _events = {
		initialised: "imagesCompare:initialised",
		changed: "imagesCompare:changed",
		resized: "imagesCompare:resized",
	} as const;
	public frontElement: HTMLElement | null = null;
	public backElement: HTMLElement | null = null;
	public separator: HTMLElement | null = null;
	public dragHandle: HTMLElement | null = null;
	private lastRatio = 1;
	private size: ImagesCompareSize = {
		width: 0,
		height: 0,
		maxWidth: 0,
		maxHeight: 0,
	};
	private _rafId: number | null = null;
	private _pointerInfo = {
		activePointerId: null as number | null,
		activeTouchId: null as number | null,
		isPointerDown: false,
	};
	private _handlerRefs: ImagesCompareHandlerRefs;

	constructor(element: HTMLElement, userOptions: ImagesCompareOptions = {}) {
		if (!element || !(element instanceof HTMLElement)) {
			throw new TypeError("ImagesCompare requires a DOM element");
		}

		const defaults: Required<ImagesCompareOptions> = {
			initVisibleRatio: 0.5,
			interactionMode: "drag",
			animationDuration: 400,
			animationEasing: "swing",
			addSeparator: true,
			addDragHandle: true,
			precision: 4,
		};

		this.element = element;
		this.options = {
			...defaults,
			...userOptions,
			roundFactor: 10 ** (userOptions.precision ?? defaults.precision),
		};

		this._handlerRefs = {
			onResize: this._onResize.bind(this),
			onClick: this._onClick.bind(this),
			onMouseMove: this._onMouseMove.bind(this),
			onMouseOut: this._onMouseOut.bind(this),
			onPointerDown: this._onPointerDown.bind(this),
			onPointerMove: this._onPointerMove.bind(this),
			onPointerUp: this._onPointerUp.bind(this),
			onMouseDown: this._onMouseDown.bind(this),
			onTouchStart: this._onTouchStart.bind(this),
			onMouseMoveWindow: this._onMouseMoveWindow.bind(this),
			onTouchMoveWindow: this._onTouchMoveWindow.bind(this),
			onMouseUpWindow: this._onMouseUpWindow.bind(this),
		};

		this._initOnce();
		instanceMap.set(this.element, this);
	}

	public static initAll(
		selector: string | NodeListOf<HTMLElement> | HTMLElement[],
		options?: ImagesCompareOptions,
	): ImagesCompare[] {
		const nodes: NodeListOf<HTMLElement> | HTMLElement[] | null =
			typeof selector === "string"
				? document.querySelectorAll<HTMLElement>(selector)
				: Array.isArray(selector)
					? selector
					: selector;

		if (!nodes) return [];

		return Array.from(nodes).map((el) => {
			const existing = instanceMap.get(el);
			if (existing) return existing;
			return new ImagesCompare(el, options);
		});
	}

	public static getInstance(element: HTMLElement): ImagesCompare | undefined {
		return instanceMap.get(element);
	}

	private _initOnce(): void {
		this._onImagesLoaded();
	}

	private _onImagesLoaded(): void {
		const images = Array.from(
			this.element.querySelectorAll<HTMLImageElement>("img"),
		);
		const total = images.length;
		if (total === 0) {
			this._init();
			return;
		}

		let loaded = 0;
		const maybeInit = (): void => {
			if (loaded >= total) this._init();
		};

		images.forEach((img) => {
			if (img.complete) {
				loaded += 1;
				maybeInit();
			} else {
				const listener = (): void => {
					loaded += 1;
					maybeInit();
					img.removeEventListener("load", listener);
					img.removeEventListener("error", listener);
				};
				img.addEventListener("load", listener);
				img.addEventListener("error", listener);
			}
		});
	}

	private _init(): void {
		this._updateDom();
		this._patchSize();
		this._initInteractions();

		if (this.frontElement) {
			this.frontElement.setAttribute(
				"ratio",
				String(this.options.initVisibleRatio),
			);
		}

		this.setValue(this.options.initVisibleRatio, false);
		this._dispatchEvent(this._events.initialised, {});
	}

	private _updateDom(): void {
		this.element.classList.add("images-compare-container");
		this.element.style.display = "inline-block";

		const childElements = Array.from(this.element.children) as HTMLElement[];
		if (childElements.length < 2) {
			throw new Error("ImagesCompare requires exactly 2 child elements");
		}

		this.frontElement = childElements[0];
		this.backElement = childElements[1];

		this.frontElement.classList.add("images-compare-before");
		this.frontElement.style.display = "block";
		this.backElement.classList.add("images-compare-after");
		this.backElement.style.display = "block";

		if (this.options.addDragHandle) this._buildDragHandle();
		if (this.options.addSeparator) this._buildSeparator();
	}

	private _buildSeparator(): void {
		const separator = document.createElement("div");
		separator.className = "images-compare-separator";
		this.element.insertBefore(separator, this.element.firstElementChild);
		this.separator = separator;
	}

	private _buildDragHandle(): void {
		const handle = document.createElement("div");
		handle.className = "images-compare-handle";
		const left = document.createElement("span");
		left.className = "images-compare-left-arrow";
		const right = document.createElement("span");
		right.className = "images-compare-right-arrow";
		handle.appendChild(left);
		handle.appendChild(right);
		this.element.insertBefore(handle, this.element.firstElementChild);
		this.dragHandle = handle;
	}

	private _patchSize(): void {
		if (!this.backElement) return;

		const img = this.backElement.querySelector<HTMLImageElement>("img");
		const width = img
			? img.width || img.naturalWidth
			: this.backElement.clientWidth;
		const height = img
			? img.height || img.naturalHeight
			: this.backElement.clientHeight;
		const maxWidth = img ? img.naturalWidth || width : width;
		const maxHeight = img ? img.naturalHeight || height : height;

		this.size = { width, height, maxWidth, maxHeight };

		this.element.style.maxWidth = `${maxWidth}px`;
		this.element.style.maxHeight = `${maxHeight}px`;
		if (this.frontElement) {
			this.frontElement.style.width = `${width}px`;
			this.frontElement.style.height = `${height}px`;
		}
	}

	private _initInteractions(): void {
		const mode = (
			this.options.interactionMode || "drag"
		).toLowerCase() as InteractionMode;
		if (!["drag", "mousemove", "click"].includes(mode)) {
			console.warn(
				'No valid interactionMode found, valid values are "drag", "mousemove", "click"',
			);
		}

		if (mode === "mousemove" || mode === "click") {
			if (mode === "mousemove") this._addMouseMove();
			if (mode === "click") this._addClick();
			this._addResize();
		} else {
			this._addDrag();
			this._addResize();
		}
	}

	private _addResize(): void {
		window.addEventListener("resize", this._handlerRefs.onResize);
	}

	private _onResize(event: UIEvent): void {
		if (this.frontElement) {
			this.frontElement.style.clip = "";
			this.frontElement.style.clipPath = "";
		}
		this._patchSize();
		this.setValue(this.lastRatio, false);
		this._dispatchEvent(this._events.resized, { originalEvent: event });
	}

	private _addClick(): void {
		this.element.addEventListener("click", this._handlerRefs.onClick);
	}

	private _onClick(event: MouseEvent): void {
		const ratio = this._getElementRatio(event.pageX);
		this.setValue(ratio, false);
	}

	private _addMouseMove(): void {
		let lastMove = 0;
		const eventThrottle = 1;

		this.element.addEventListener("mousemove", (event) => {
			event.preventDefault();
			const now = Date.now();
			if (now <= lastMove + eventThrottle) return;
			lastMove = now;
			const ratio = this._getElementRatio(event.pageX);
			this.setValue(ratio, false);
		});
		this.element.addEventListener("mouseout", this._handlerRefs.onMouseOut);
	}

	private _onMouseMove = (event: MouseEvent): void => {
		event.preventDefault();
		const ratio = this._getElementRatio(event.pageX);
		this.setValue(ratio, false);
	};

	private _onMouseOut = (): void => {
		if (this.element) {
			const rect = this.element.getBoundingClientRect();
			const ratio = this._getElementRatio(rect.left);
			this.setValue(ratio, false);
		}
	};

	private _addDrag(): void {
		if (window.PointerEvent) {
			this.element.addEventListener(
				"pointerdown",
				this._handlerRefs.onPointerDown,
			);
			this.element.addEventListener(
				"pointermove",
				this._handlerRefs.onPointerMove,
			);
			this.element.addEventListener("pointerup", this._handlerRefs.onPointerUp);
			this.element.addEventListener(
				"pointercancel",
				this._handlerRefs.onPointerUp,
			);
			this.element.addEventListener(
				"lostpointercapture",
				this._handlerRefs.onPointerUp,
			);
		} else {
			this.element.addEventListener("mousedown", this._handlerRefs.onMouseDown);
			this.element.addEventListener(
				"touchstart",
				this._handlerRefs.onTouchStart,
				{ passive: true },
			);
		}
	}

	private _onPointerDown(event: PointerEvent): void {
		this._pointerInfo.activePointerId = event.pointerId;
		this._pointerInfo.isPointerDown = true;
		this.element.setPointerCapture(event.pointerId);
	}

	private _onPointerMove(event: PointerEvent): void {
		if (
			!this._pointerInfo.isPointerDown ||
			event.pointerId !== this._pointerInfo.activePointerId
		)
			return;
		const ratio = this._getElementRatio(event.pageX);
		this.setValue(ratio, false);
	}

	private _onPointerUp = (): void => {
		this._pointerInfo.activePointerId = null;
		this._pointerInfo.isPointerDown = false;
	};

	private _onMouseDown(event: MouseEvent): void {
		event.preventDefault();
		this._pointerInfo.isPointerDown = true;
		this._handlerRefs.onMouseMoveWindow = this._handlerRefs.onMouseMove;
		window.addEventListener("mousemove", this._handlerRefs.onMouseMoveWindow);
		window.addEventListener("mouseup", this._handlerRefs.onMouseUpWindow);
	}

	private _onTouchStart(event: TouchEvent): void {
		this._pointerInfo.isPointerDown = true;
		this._pointerInfo.activeTouchId =
			event.changedTouches[0]?.identifier ?? null;
		window.addEventListener("touchmove", this._handlerRefs.onTouchMoveWindow);
		window.addEventListener("touchend", this._handlerRefs.onMouseUpWindow);
		window.addEventListener("touchcancel", this._handlerRefs.onMouseUpWindow);
	}

	private _onMouseMoveWindow(event: MouseEvent): void {
		if (!this._pointerInfo.isPointerDown) return;
		const ratio = this._getElementRatio(event.pageX);
		this.setValue(ratio, false);
	}

	private _onTouchMoveWindow(event: TouchEvent): void {
		if (!this._pointerInfo.isPointerDown || !this._pointerInfo.activeTouchId)
			return;
		const touch = Array.from(event.changedTouches).find(
			(t) => t.identifier === this._pointerInfo.activeTouchId,
		);
		if (!touch) return;
		const ratio = this._getElementRatio(touch.pageX);
		this.setValue(ratio, false);
	}

	private _onMouseUpWindow = (): void => {
		this._pointerInfo.isPointerDown = false;
		this._pointerInfo.activeTouchId = null;
		window.removeEventListener(
			"mousemove",
			this._handlerRefs.onMouseMoveWindow,
		);
		window.removeEventListener("mouseup", this._handlerRefs.onMouseUpWindow);
		window.removeEventListener(
			"touchmove",
			this._handlerRefs.onTouchMoveWindow,
		);
		window.removeEventListener("touchend", this._handlerRefs.onMouseUpWindow);
		window.removeEventListener(
			"touchcancel",
			this._handlerRefs.onMouseUpWindow,
		);
	};

	private _getElementRatio(pageX: number): number {
		const rect = this.element.getBoundingClientRect();
		const clamped = Math.max(0, Math.min(pageX - rect.left, rect.width));
		return this._roundRatio(clamped / rect.width);
	}

	private _getRatioValue(ratio: number): number {
		if (!this.size.width || this.size.width === 0) {
			return 0;
		}
		return Math.round(ratio * this.size.width);
	}

	private _roundRatio(value: number): number {
		if (Number.isNaN(value)) return 0;
		if (value < 0) value = 0;
		if (value > 1) value = 1;
		return (
			Math.round(value * this.options.roundFactor) / this.options.roundFactor
		);
	}

	private _dispatchEvent(
		eventName: ImagesCompareEvents,
		detail: Record<string, unknown>,
	): void {
		const event = new CustomEvent(eventName, { detail });
		this.element.dispatchEvent(event);
	}

	private _launchAnimation(
		startValue: number,
		endValue: number,
		duration: number,
		easing: string,
	): void {
		const startTime = performance.now();
		const distance = endValue - startValue;
		const easeFn =
			easing === "swing"
				? (p: number) => 0.5 - Math.cos(p * Math.PI) / 2
				: (p: number) => p;

		const animate = (time: number): void => {
			const elapsed = time - startTime;
			const progress = duration <= 0 ? 1 : Math.min(elapsed / duration, 1);
			const current = startValue + distance * easeFn(progress);

			const width = this._getRatioValue(current);
			this.lastRatio = current;
			if (this.frontElement) {
				this.frontElement.setAttribute("ratio", String(current));
				this.frontElement.style.clip = `rect(0, ${width}px, ${this.size.height}px, 0)`;
				this.frontElement.style.clipPath = this._getClipPath(width);
			}

			if (this.separator) this.separator.style.left = `${width}px`;
			if (this.dragHandle) this.dragHandle.style.left = `${width}px`;

			if (progress < 1) {
				this._rafId = requestAnimationFrame(animate);
			} else {
				this._rafId = null;
				this._dispatchEvent(this._events.changed, {
					ratio: current,
					value: width,
					animate: true,
					animation: true,
					jumpedToEnd: true,
				});
			}
		};

		this._rafId = requestAnimationFrame(animate);
	}

	private _getClipPath(width: number): string {
		const total =
			this.size.width || this.frontElement?.getBoundingClientRect().width || 0;
		const rightInset = Math.max(0, total - width);
		return `inset(0 ${rightInset}px 0 0)`;
	}

	public setValue(
		ratio: number,
		animate = false,
		duration?: number,
		easing?: string,
	): this {
		ratio = Number(ratio);
		if (Number.isNaN(ratio)) ratio = 0;
		ratio = this._roundRatio(ratio);

		const width = this._getRatioValue(ratio);

		if (animate) {
			const finalDuration =
				typeof duration === "number"
					? duration
					: this.options.animationDuration;
			const finalEasing = easing || this.options.animationEasing;
			this._launchAnimation(this.lastRatio, ratio, finalDuration, finalEasing);
			if (this.lastRatio !== ratio) {
				this._dispatchEvent(this._events.changed, {
					ratio: this.lastRatio,
					value: width,
					animate: true,
				});
			}
			this.lastRatio = ratio;
			return this;
		}

		if (this._rafId) {
			cancelAnimationFrame(this._rafId);
			this._rafId = null;
		}

		if (this.frontElement) {
			this.frontElement.style.clip = `rect(0, ${width}px, ${this.size.height}px, 0)`;
			this.frontElement.style.clipPath = this._getClipPath(width);
		}

		if (this.separator) this.separator.style.left = `${width}px`;
		if (this.dragHandle) this.dragHandle.style.left = `${width}px`;

		if (this.lastRatio !== ratio) {
			this._dispatchEvent(this._events.changed, {
				ratio,
				value: width,
				animate: false,
			});
		}

		this.lastRatio = ratio;
		return this;
	}

	public getValue(): number {
		return this.lastRatio;
	}

	public on(
		eventName: ImagesCompareEvents,
		callback: EventListenerOrEventListenerObject,
	): this {
		this.element.addEventListener(eventName, callback);
		return this;
	}

	public off(
		eventName: ImagesCompareEvents,
		callback: EventListenerOrEventListenerObject,
	): this {
		this.element.removeEventListener(eventName, callback);
		return this;
	}

	public events(): typeof this._events {
		return this._events;
	}

	public destroy(): this {
		window.removeEventListener("resize", this._handlerRefs.onResize);
		this.element.removeEventListener("click", this._handlerRefs.onClick);
		this.element.removeEventListener(
			"mousemove",
			this._handlerRefs.onMouseMove,
		);
		this.element.removeEventListener("mouseout", this._handlerRefs.onMouseOut);
		this.element.removeEventListener(
			"pointerdown",
			this._handlerRefs.onPointerDown,
		);
		this.element.removeEventListener(
			"pointermove",
			this._handlerRefs.onPointerMove,
		);
		this.element.removeEventListener(
			"pointerup",
			this._handlerRefs.onPointerUp,
		);
		this.element.removeEventListener(
			"pointercancel",
			this._handlerRefs.onPointerUp,
		);
		this.element.removeEventListener(
			"lostpointercapture",
			this._handlerRefs.onPointerUp,
		);
		this.element.removeEventListener(
			"mousedown",
			this._handlerRefs.onMouseDown,
		);
		this.element.removeEventListener(
			"touchstart",
			this._handlerRefs.onTouchStart,
		);
		window.removeEventListener(
			"mousemove",
			this._handlerRefs.onMouseMoveWindow,
		);
		window.removeEventListener(
			"touchmove",
			this._handlerRefs.onTouchMoveWindow,
		);
		window.removeEventListener("mouseup", this._handlerRefs.onMouseUpWindow);
		window.removeEventListener("touchend", this._handlerRefs.onMouseUpWindow);
		window.removeEventListener(
			"touchcancel",
			this._handlerRefs.onMouseUpWindow,
		);

		if (this._rafId) cancelAnimationFrame(this._rafId);
		instanceMap.delete(this.element);
		return this;
	}
}

(window as unknown as Record<string, unknown>).ImagesCompare = ImagesCompare;

export default ImagesCompare;
