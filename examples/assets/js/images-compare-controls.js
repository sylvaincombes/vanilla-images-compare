window.imagesCompareBindControls = (imagesCompare) => {
    if (!imagesCompare || typeof imagesCompare.setValue !== "function") {
        return;
    }

    const frontButtons = document.querySelectorAll(".js-front-btn");
    const backButtons = document.querySelectorAll(".js-back-btn");
    const toggleButtons = document.querySelectorAll(".js-toggle-btn");

    frontButtons.forEach((btn) => {
        const handler = (event) => {
            event.preventDefault();
            imagesCompare.setValue(1, true);
        };
        btn.removeEventListener("click", handler);
        btn.addEventListener("click", handler);
    });

    backButtons.forEach((btn) => {
        const handler = (event) => {
            event.preventDefault();
            imagesCompare.setValue(0, true);
        };
        btn.removeEventListener("click", handler);
        btn.addEventListener("click", handler);
    });

    toggleButtons.forEach((btn) => {
        const handler = (event) => {
            event.preventDefault();
            const current = imagesCompare.getValue();
            if (current >= 0 && current < 1) {
                imagesCompare.setValue(1, true);
            } else {
                imagesCompare.setValue(0, true);
            }
        };
        btn.removeEventListener("click", handler);
        btn.addEventListener("click", handler);
    });
};
