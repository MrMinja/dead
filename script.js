
document.addEventListener("DOMContentLoaded", async function () {
    const db = firebase.database();
    const grid = document.querySelector(".image-grid");
    const gallery = document.getElementById("gallery");
    const mikaPage = document.getElementById("mika-page");
    let isAdmin = false;

    const imageSources = [
        "https://i.postimg.cc/vm3j97Jg/1.jpg",
        "https://i.postimg.cc/fLqG475n/10.jpg"
        // Lägg till resten av dina bilder här
    ];

    async function checkAdminStatus() {
        const snapshot = await db.ref("isAdmin").once("value");
        isAdmin = snapshot.val() || false;
    }

    async function loadImages() {
        grid.innerHTML = "";

        const snapshot = await db.ref("imageOrder").once("value");
        let savedOrder = snapshot.val() || imageSources;

        if (typeof savedOrder === "object" && !Array.isArray(savedOrder)) {
            savedOrder = Object.values(savedOrder);
        }

        savedOrder.forEach(src => {
            const wrapper = document.createElement("div");
            wrapper.classList.add("image-wrapper");
            if (isAdmin) wrapper.setAttribute("draggable", "true");

            const img = document.createElement("img");
            img.src = src;
            wrapper.appendChild(img);
            grid.appendChild(wrapper);
        });

        if (isAdmin) addDragAndDropListeners();
    }

    function addDragAndDropListeners() {
        let draggedItem = null;
        document.querySelectorAll(".image-wrapper").forEach(item => {
            item.addEventListener("dragstart", () => draggedItem = item);
            item.addEventListener("dragend", saveImageOrder);
            item.addEventListener("dragover", e => e.preventDefault());
            item.addEventListener("drop", (e) => {
                e.preventDefault();
                if (draggedItem === item) return;
                grid.insertBefore(draggedItem, item);
                saveImageOrder();
            });
        });
    }

    async function saveImageOrder() {
        const newOrder = [...document.querySelectorAll(".image-wrapper img")].map(img => img.src);
        await db.ref("imageOrder").set(newOrder);
    }

    // Adminläge med kortkommando Ctrl+H / Cmd+H
    document.addEventListener("keydown", async function (event) {
        if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "h") {
            event.preventDefault();
            isAdmin = !isAdmin;
            await db.ref("isAdmin").set(isAdmin);
            alert(`Adminläge ${isAdmin ? "aktiverat" : "avaktiverat"}! Sidan laddas om.`);
            location.reload();
        }
    });

    document.getElementById("mika-link").addEventListener("click", function (e) {
        e.preventDefault();
        document.getElementById("gallery").style.display = "none";
        document.getElementById("mika-page").style.display = "flex";
    });

    document.getElementById("archive-link").addEventListener("click", function (event) {
        event.preventDefault();
        document.getElementById("gallery").style.display = "block";
        document.getElementById("mika-page").style.display = "none";
    });

    await checkAdminStatus();
    loadImages();
});
