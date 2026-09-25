const helpButton = document.querySelector("#help-button");
const loginButton = document.querySelector("#login");
const signupContainer = document.querySelector("#cute-signup");

// Help tooltip
const helpText = document.createElement("div");
helpText.className = "help-text";
helpText.textContent = "Click sign up or login to get started! ♡";
helpText.hidden = true;
document.body.appendChild(helpText);

helpButton.addEventListener("mouseenter", (event) => {
    helpText.hidden = false;
    positionHelpText(event);
});

helpButton.addEventListener("mousemove", positionHelpText);
helpButton.addEventListener("mouseleave", () => {
    helpText.hidden = true;
});

function positionHelpText(event) {
    helpText.style.left = `${event.clientX + 10}px`;
    helpText.style.top = `${event.clientY + 10}px`;
}

// Login form
const loginForm = document.createElement("form");
loginForm.id = "login-form";
loginForm.hidden = true;
loginForm.innerHTML = `
    <label>
        Name
        <input name="name" type="text" autocomplete="username" required>
    </label>

    <label>
        Password
        <input name="password" type="password" autocomplete="current-password" required>
    </label>

    <label class="remember-label">
        <input name="remember" type="checkbox">
        Remember me
    </label>

    <button class="cute-button" type="submit">Log in</button>
    <p class="login-message" aria-live="polite"></p>
`;

signupContainer.appendChild(loginForm);

const REMEMBER_COOKIE = "kawaiiRemember";
const REMEMBER_DURATION = 60;
let rememberedLoginInProgress = false;

function setCookie(name, value, maxAge) {
    document.cookie =
        `${name}=${encodeURIComponent(value)}; max-age=${maxAge}; path=/; SameSite=Lax`;
}

function getCookie(name) {
    const row = document.cookie
        .split("; ")
        .find((item) => item.startsWith(`${name}=`));

    return row ? decodeURIComponent(row.substring(name.length + 1)) : null;
}

function getRememberedLogin() {
    const remembered = getCookie(REMEMBER_COOKIE);

    if (!remembered) return null;

    try {
        const data = JSON.parse(remembered);

        if (data.name === "admin" && data.expiresAt > Date.now()) {
            return data;
        }

            document.cookie = `${REMEMBER_COOKIE}=; max-age=0; path=/`;
    } catch {
            document.cookie = `${REMEMBER_COOKIE}=; max-age=0; path=/`;
        return null;
    }

    return null;
}

loginButton.addEventListener("click", () => {
    const rememberedLogin = getRememberedLogin();

    if (rememberedLogin) {
        rememberedLoginInProgress = true;
        loginForm.elements.name.value = rememberedLogin.name;
        loginForm.elements.password.value = "admin";
        loginForm.elements.remember.checked = true;
        loginForm.requestSubmit();
        return;
    }

    loginForm.hidden = !loginForm.hidden;

    const isOpen = !loginForm.hidden;
    document.body.classList.toggle("login-open", isOpen);
    helpText.classList.toggle("login-active", isOpen);

    if (isOpen) {
        loginForm.elements.name.focus();
    }
});

loginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = loginForm.elements.name.value;
    const password = loginForm.elements.password.value;
    const message = loginForm.querySelector(".login-message");

    if (name === "admin" && password === "admin") {
        sessionStorage.setItem("kawaiiLoggedIn", "true");
        renderPosts();

        if (loginForm.elements.remember.checked && !rememberedLoginInProgress) {
            setCookie(
                REMEMBER_COOKIE,
                JSON.stringify({
                    name,
                    expiresAt: Date.now() + REMEMBER_DURATION * 1000
                }),
                REMEMBER_DURATION
            );
        }

        rememberedLoginInProgress = false;

        loginForm.reset();
        loginForm.classList.add("login-form--closing");
        document.body.classList.add("login-transition");

        setTimeout(() => {
            loginForm.hidden = true;
            loginForm.classList.remove("login-form--closing");
            document.body.classList.remove("login-transition");
            helpText.hidden = true;

            signupContainer.replaceChildren();
            signupContainer.classList.add("logged-in");

            const newPostButton = document.createElement("button");
            newPostButton.id = "new-post";
            newPostButton.className = "cute-button";
            newPostButton.textContent = "New post";

            const logoutButton = document.createElement("button");
            logoutButton.className = "cute-button logout-button";
            logoutButton.type = "button";
            logoutButton.setAttribute("aria-label", "Log out");
            logoutButton.title = "Logout";

            const logoutIcon = document.createElement("img");
            logoutIcon.src = "assets/door.svg";
            logoutIcon.alt = "";
            logoutIcon.className = "logout-icon";

            logoutButton.appendChild(logoutIcon);

            const avatar = document.createElement("div");
            avatar.className = "avatar";
            avatar.textContent = "A";
            avatar.title = "Admin's Account";
            avatar.setAttribute("aria-label", "Admin avatar");

            signupContainer.append(newPostButton, logoutButton, avatar);

            newPostButton.addEventListener("click", (event) => {
                event.stopPropagation();

                let newPostForm = document.querySelector("#new-post-form");

                if (newPostForm) {
                    newPostForm.hidden = false;
                    document.body.classList.add("post-open");
                    return;
                }

                newPostForm = document.createElement("form");
                newPostForm.id = "new-post-form";
                newPostForm.innerHTML = `
                    <h2>Create New Post ♡</h2>

                    <label>
                        Title
                        <input type="text" name="title" required>
                    </label>

                    <label>
                        Text
                        <textarea name="text" rows="6" required></textarea>
                    </label>

                    <label>
                        Add an image
                        <span class="image-input-row">
                            <input type="file" name="image" accept="image/*">
                            <button class="clear-image-button" type="button" hidden>x</button>
                        </span>
                    </label>

                    <button class="cute-button" type="submit">Publish</button>
                    <p class="post-message" aria-live="polite"></p>
                `;

                document.body.appendChild(newPostForm);
                document.body.classList.add("post-open");

                const imageInput = newPostForm.elements.image;
                const clearImageButton = newPostForm.querySelector(".clear-image-button");

                imageInput.addEventListener("change", () => {
                    clearImageButton.hidden = imageInput.files.length === 0;
                });

                clearImageButton.addEventListener("click", () => {
                    imageInput.value = "";
                    clearImageButton.hidden = true;
                    imageInput.focus();
                });

                newPostForm.addEventListener("click", (event) => {
                    event.stopPropagation();
                });

                newPostForm.addEventListener("submit", async (event) => {
                    event.preventDefault();

                    const title = newPostForm.elements.title.value.trim();
                    const text = newPostForm.elements.text.value.trim();
                    const imageFile = newPostForm.elements.image.files[0];
                    const message = newPostForm.querySelector(".post-message");

                    try {
                        const id = crypto.randomUUID();
                        let imageKey = "";

                        if (imageFile) {
                            const imageData = await compressImage(imageFile);
                            imageKey = `kawaiiPostImage:${id}`;
                            localStorage.setItem(imageKey, imageData);
                        }

                        const posts = getPosts();
                        posts.push({
                            id,
                            title,
                            text,
                            imageKey,
                            createdAt: new Date().toISOString()
                        });

                        savePosts(posts);
                        renderPosts();

                        newPostForm.reset();
                        newPostForm.hidden = true;
                        document.body.classList.remove("post-open");
                    } catch (error) {
                        console.error(error);
                        message.textContent = "The image is too large to upload.";
                    }
                });
            });

            logoutButton.addEventListener("click", () => {
                sessionStorage.removeItem("kawaiiLoggedIn");

                document.body.classList.remove(
                    "login-open",
                    "login-transition",
                    "post-open"
                );

                renderPosts();
                window.location.reload();
            });
        }, 600);

        document.body.classList.remove(
                    "login-open",
                    "login-transition",
                    "post-open"
                );

        return;
    } else {
        message.textContent = "Incorrect name or password.";
    }
});

function hideLoginForm() {
    loginForm.hidden = true;
    loginForm.querySelector(".login-message").textContent = "";
    loginForm.classList.remove("login-form--closing");
    document.body.classList.remove("login-open");
    helpText.classList.remove("login-active");
}

document.addEventListener("click", (event) => {
    const clickedInsideForm = loginForm.contains(event.target);
    const clickedLoginButton = loginButton.contains(event.target);

    if (!clickedInsideForm && !clickedLoginButton) {
        hideLoginForm();
    }
});

document.addEventListener("click", (event) => {
    const newPostForm = document.querySelector("#new-post-form");

    if (
        document.body.classList.contains("post-open") &&
        newPostForm &&
        !newPostForm.contains(event.target)
    ) {
        newPostForm.hidden = true;
        document.body.classList.remove("post-open");
    }
});

const postsContainer = document.querySelector("#posts-container");
const POSTS_COOKIE = "kawaiiPosts";

function getPosts() {
    const cookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${POSTS_COOKIE}=`));

    if (!cookie) return [];

    try {
        return JSON.parse(decodeURIComponent(cookie.split("=")[1]));
    } catch {
        return [];
    }
}

function savePosts(posts) {
    document.cookie =
        `${POSTS_COOKIE}=${encodeURIComponent(JSON.stringify(posts))}; ` +
        "max-age=31536000; path=/; SameSite=Lax";
}

function renderPosts() {
    postsContainer.replaceChildren();

    const posts = getPosts().sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    posts.forEach((post) => {
        const postElement = document.createElement("article");
        postElement.className = "blog-post";

        const title = document.createElement("h2");
        title.textContent = post.title;

        const text = document.createElement("p");
        text.textContent = post.text;

        const date = document.createElement("small");
        date.textContent = new Date(post.createdAt).toLocaleString([], {
            dateStyle: "short",
            timeStyle: "short"
        });

        postElement.append(title, text);

        if (post.imageKey || post.image) {
            const image = document.createElement("img");
            image.className = "post-image";
            image.src = post.imageKey
                ? localStorage.getItem(post.imageKey)
                : post.image;
            image.alt = post.title;
            postElement.appendChild(image);
        }

        const footer = document.createElement("div");
        footer.className = "post-footer";
        footer.appendChild(date);

        if (sessionStorage.getItem("kawaiiLoggedIn") === "true") {
            const deleteButton = document.createElement("button");
            deleteButton.className = "cute-button delete-post";
            deleteButton.type = "button";
            deleteButton.textContent = "Delete";

            deleteButton.addEventListener("click", async () => {
                if (!await showDeleteConfirmation()) return;

                if (post.imageKey) {
                    localStorage.removeItem(post.imageKey);
                }

                savePosts(
                    getPosts().filter((savedPost) => savedPost.id !== post.id)
                );

                renderPosts();
            });

            footer.appendChild(deleteButton);
        }

        postElement.appendChild(footer);
        postsContainer.appendChild(postElement);
    });
}

renderPosts();

function showDeleteConfirmation() {
    return new Promise((resolve) => {
        const confirmation = document.createElement("div");
        confirmation.className = "delete-confirmation";
        confirmation.innerHTML = `
            <span>Delete this post?</span>
            <button class="cute-button confirm-delete" type="button">Yes</button>
            <button class="cute-button cancel-delete" type="button">No</button>
        `;

        document.body.appendChild(confirmation);

        const close = (result) => {
            confirmation.remove();
            resolve(result);
        };

        confirmation.querySelector(".confirm-delete")
            .addEventListener("click", () => close(true));

        confirmation.querySelector(".cancel-delete")
            .addEventListener("click", () => close(false));
    });
}

function compressImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            const image = new Image();

            image.onload = () => {
                const maxWidth = 1200;
                const scale = Math.min(1, maxWidth / image.width);
                const canvas = document.createElement("canvas");

                canvas.width = image.width * scale;
                canvas.height = image.height * scale;

                const context = canvas.getContext("2d");
                context.drawImage(image, 0, 0, canvas.width, canvas.height);

                resolve(canvas.toDataURL("image/jpeg", 0.75));
            };

            image.onerror = reject;
            image.src = reader.result;
        };

        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}