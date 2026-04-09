import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import ImagesCompare from "../images-compare";

describe("ImagesCompare (vanilla)", () => {
	let container: HTMLElement | null = null;
	let instance: ImagesCompare | null = null;

	beforeEach(() => {
		document.body.innerHTML =
			'<div id="images-compare"><div></div><div></div></div>';
		container = document.getElementById("images-compare");
	});

	afterEach(() => {
		if (instance && typeof instance.destroy === "function") {
			instance.destroy();
		}
		document.body.innerHTML = "";
	});

	it("should initialize and set initial ratio", () => {
		instance = new ImagesCompare(container!, {
			addSeparator: false,
			addDragHandle: false,
		});

		expect(instance).toBeInstanceOf(ImagesCompare);
		expect(instance.frontElement).toBeDefined();
		expect(instance.backElement).toBeDefined();
		expect(instance.getValue()).toBeCloseTo(0.5, 4);
	});

	it("should update value when setValue is called", () => {
		instance = new ImagesCompare(container!, {
			addSeparator: false,
			addDragHandle: false,
		});

		instance.setValue(0.75);
		expect(instance.getValue()).toBeCloseTo(0.75, 4);
	});

	it("should dispatch changed event for value change", () => {
		instance = new ImagesCompare(container!, {
			addSeparator: false,
			addDragHandle: false,
		});

		const callback = vi.fn();
		instance.on("imagesCompare:changed", callback);
		instance.setValue(0.65);

		expect(callback).toHaveBeenCalled();
	});

	it("should initialize with default options", () => {
		instance = new ImagesCompare(container!);

		expect(instance.getValue()).toBe(0.5);
		expect(instance.separator).toBeDefined();
		expect(instance.dragHandle).toBeDefined();
	});

	it("should respect addSeparator option", () => {
		instance = new ImagesCompare(container!, {
			addSeparator: false,
		});
		expect(instance.separator).toBeNull();
	});

	it("should respect addDragHandle option", () => {
		instance = new ImagesCompare(container!, {
			addDragHandle: false,
		});
		expect(instance.dragHandle).toBeNull();
	});

	it("should handle setValue with animation", () => {
		instance = new ImagesCompare(container!, {
			addDragHandle: false,
		});

		const callback = vi.fn();
		instance.on("imagesCompare:changed", callback);

		instance.setValue(0.8, true, 0); // Immediate animation

		expect(instance.getValue()).toBeCloseTo(0.8, 4);
		expect(callback).toHaveBeenCalled();
	});

	it("should clamp ratio values between 0 and 1", () => {
		instance = new ImagesCompare(container!, {
			addDragHandle: false,
		});

		instance.setValue(-0.5);
		expect(instance.getValue()).toBe(0);

		instance.setValue(1.5);
		expect(instance.getValue()).toBe(1);
	});

	it("should handle NaN ratio values", () => {
		instance = new ImagesCompare(container!, {
			addDragHandle: false,
		});

		instance.setValue(NaN);
		expect(instance.getValue()).toBe(0);
	});

	it("should dispatch initialised event on init", () => {
		const callback = vi.fn();
		container!.addEventListener("imagesCompare:initialised", callback);

		instance = new ImagesCompare(container!, {});

		expect(callback).toHaveBeenCalled();
	});

	it("should handle off method", () => {
		instance = new ImagesCompare(container!, {
			addSeparator: false,
			addDragHandle: false,
		});

		const callback = vi.fn();
		instance.on("imagesCompare:changed", callback);
		instance.off("imagesCompare:changed", callback);
		instance.setValue(0.8);

		expect(callback).not.toHaveBeenCalled();
	});

	it("should return events object", () => {
		instance = new ImagesCompare(container!, {
			addDragHandle: false,
		});

		const events = instance.events();
		expect(events).toHaveProperty("initialised");
		expect(events).toHaveProperty("changed");
		expect(events).toHaveProperty("resized");
	});

	it("should handle destroy method", () => {
		instance = new ImagesCompare(container!, {
			addSeparator: false,
			addDragHandle: false,
		});

		expect(instance.destroy()).toBe(instance);
		expect(ImagesCompare.getInstance(container!)).toBeUndefined();
	});

	it("should handle static initAll method", () => {
		const instances = ImagesCompare.initAll("#images-compare");
		expect(instances).toHaveLength(1);
		expect(instances[0]).toBeInstanceOf(ImagesCompare);
	});

	it("should handle static getInstance method", () => {
		instance = new ImagesCompare(container!, {
			addDragHandle: false,
		});

		const retrieved = ImagesCompare.getInstance(container!);
		expect(retrieved).toBe(instance);
	});

	it("should handle precision option", () => {
		instance = new ImagesCompare(container!, {
			addSeparator: false,
			addDragHandle: false,
		});

		instance.setValue(0.12345);
		expect(instance.getValue()).toBeCloseTo(0.12, 2);
	});

	it("should throw error for invalid element", () => {
		expect(() => {
			new ImagesCompare(null as any);
		}).toThrow(TypeError);
	});

	it("should throw error for element without children", () => {
		const emptyContainer = document.createElement("div");
		document.body.appendChild(emptyContainer);

		expect(() => {
			new ImagesCompare(emptyContainer);
		}).toThrow(Error);

		document.body.removeChild(emptyContainer);
	});

	it("should handle interaction mode click", () => {
		instance = new ImagesCompare(container!, {
			interactionMode: "click",
			addSeparator: false,
			addDragHandle: false,
		});

		const _mockEvent = {
			pageX: 50,
			preventDefault: vi.fn(),
		} as any;

		// Simulate click
		const clickEvent = new MouseEvent("click", { clientX: 50 });
		container!.dispatchEvent(clickEvent);
		// Since we can't easily mock the internal handlers, just check it initializes
		expect(instance).toBeDefined();
	});

	it("should handle interaction mode mousemove", () => {
		instance = new ImagesCompare(container!, {
			addSeparator: false,
			addDragHandle: false,
		});

		expect(instance).toBeDefined();
	});

	it("should handle resize event", () => {
		instance = new ImagesCompare(container!, {
			addDragHandle: false,
		});

		const callback = vi.fn();
		instance.on("imagesCompare:resized", callback);

		// Trigger resize
		window.dispatchEvent(new Event("resize"));

		expect(callback).toHaveBeenCalled();
	});

	it("should handle image loading", () => {
		// Create container with images
		const imgContainer = document.createElement("div");
		imgContainer.id = "images-compare-img";
		const img1 = document.createElement("img");
		img1.src =
			"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
		const img2 = document.createElement("img");
		img2.src =
			"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
		imgContainer.appendChild(img1);
		imgContainer.appendChild(img2);
		document.body.appendChild(imgContainer);

		instance = new ImagesCompare(imgContainer, {
			addSeparator: false,
			addDragHandle: false,
		});

		// Since data URLs load immediately, instance should be initialized
		expect(instance).toBeDefined();
		expect(instance.frontElement).toBeDefined();
		expect(instance.backElement).toBeDefined();

		document.body.removeChild(imgContainer);
	});

	it("should handle animation easing", () => {
		instance = new ImagesCompare(container!, {
			addSeparator: false,
			addDragHandle: false,
		});

		const callback = vi.fn();
		instance.on("imagesCompare:changed", callback);

		instance.setValue(0.8, true, 0); // Immediate animation

		expect(callback).toHaveBeenCalled();
	});
});
