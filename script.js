// NovaWeb interactivity: theme toggle, mobile menu, scroll effects,
// counters, typing effect, card/FAQ toggles and contact form validation.
document.addEventListener("DOMContentLoaded", () => {

    /* ---------- Dark / light theme (remembered between pages) ---------- */
    const root = document.documentElement;
    const themeBtn = document.getElementById("themeToggle");

    function applyTheme(theme) {
        root.setAttribute("data-theme", theme);
        if (themeBtn) {
            themeBtn.innerHTML = theme === "dark"
                ? '<i class="fas fa-sun"></i>'
                : '<i class="fas fa-moon"></i>';
        }
    }

    let savedTheme = "light";
    try {
        savedTheme = localStorage.getItem("novaweb-theme") || "light";
    } catch (e) { /* storage unavailable */ }
    applyTheme(savedTheme);

    if (themeBtn) {
        themeBtn.addEventListener("click", () => {
            const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
            applyTheme(next);
            try { localStorage.setItem("novaweb-theme", next); } catch (e) { /* ignore */ }
        });
    }

    /* ---------- Mobile menu ---------- */
    const menuBtn = document.getElementById("menuToggle");
    const navLinks = document.getElementById("navLinks");
    if (menuBtn && navLinks) {
        menuBtn.addEventListener("click", () => {
            const open = navLinks.classList.toggle("open");
            menuBtn.setAttribute("aria-expanded", String(open));
        });
    }

    /* ---------- Scroll reveal ---------- */
    const revealItems = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });
        revealItems.forEach((item) => revealObserver.observe(item));
    } else {
        revealItems.forEach((item) => item.classList.add("visible"));
    }

    /* ---------- Animated counters ---------- */
    const counters = document.querySelectorAll(".stat-number");
    function runCounter(el) {
        const target = Number(el.dataset.target);
        const duration = 1500;
        const start = performance.now();
        function tick(now) {
            const progress = Math.min((now - start) / duration, 1);
            el.textContent = Math.floor(progress * target);
            if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }
    if (counters.length) {
        if ("IntersectionObserver" in window) {
            const counterObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        runCounter(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });
            counters.forEach((c) => counterObserver.observe(c));
        } else {
            counters.forEach((c) => { c.textContent = c.dataset.target; });
        }
    }

    /* ---------- Typing effect in the hero ---------- */
    const typed = document.getElementById("typed");
    if (typed) {
        const words = typed.dataset.words.split(",");
        let wordIndex = 0;
        let charIndex = 0;
        let deleting = false;

        function type() {
            const word = words[wordIndex];
            typed.textContent = word.substring(0, charIndex);

            if (!deleting && charIndex < word.length) {
                charIndex++;
                setTimeout(type, 90);
            } else if (!deleting) {
                deleting = true;
                setTimeout(type, 1400);
            } else if (charIndex > 0) {
                charIndex--;
                setTimeout(type, 45);
            } else {
                deleting = false;
                wordIndex = (wordIndex + 1) % words.length;
                setTimeout(type, 300);
            }
        }
        type();
    }

    /* ---------- Click-to-expand service cards ---------- */
    document.querySelectorAll(".flip-card").forEach((card) => {
        const toggle = () => card.classList.toggle("open");
        card.addEventListener("click", toggle);
        card.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggle();
            }
        });
    });

    /* ---------- FAQ accordion (one open at a time) ---------- */
    const faqItems = document.querySelectorAll(".faq-item");
    faqItems.forEach((item) => {
        const button = item.querySelector(".faq-question");
        button.addEventListener("click", () => {
            const wasOpen = item.classList.contains("open");
            faqItems.forEach((other) => {
                other.classList.remove("open");
                other.querySelector(".faq-question").setAttribute("aria-expanded", "false");
            });
            if (!wasOpen) {
                item.classList.add("open");
                button.setAttribute("aria-expanded", "true");
            }
        });
    });

    /* ---------- Back to top button ---------- */
    const topBtn = document.getElementById("backToTop");
    if (topBtn) {
        window.addEventListener("scroll", () => {
            topBtn.classList.toggle("show", window.scrollY > 300);
        });
        topBtn.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    /* ---------- Contact form: live validation and character counter ---------- */
    const contactForm = document.getElementById("contactForm");
    if (contactForm) {
        const nameInput = document.getElementById("name");
        const emailInput = document.getElementById("email");
        const messageInput = document.getElementById("message");
        const feedback = document.getElementById("formFeedback");
        const charCount = document.getElementById("charCount");
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        function setState(input, errorId, message) {
            const errorEl = document.getElementById(errorId);
            errorEl.textContent = message;
            input.classList.toggle("invalid", message !== "");
            input.classList.toggle("valid", message === "" && input.value.trim() !== "");
            return message === "";
        }

        function checkName() {
            const v = nameInput.value.trim();
            return setState(nameInput, "nameError", v.length < 2 ? "Please enter at least 2 characters." : "");
        }

        function checkEmail() {
            const v = emailInput.value.trim();
            return setState(emailInput, "emailError", emailPattern.test(v) ? "" : "Please enter a valid email address.");
        }

        function checkMessage() {
            const v = messageInput.value.trim();
            return setState(messageInput, "messageError", v.length < 10 ? "Message must be at least 10 characters." : "");
        }

        nameInput.addEventListener("input", checkName);
        emailInput.addEventListener("input", checkEmail);
        messageInput.addEventListener("input", () => {
            charCount.textContent = messageInput.value.length;
            checkMessage();
        });

        contactForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const okName = checkName();
            const okEmail = checkEmail();
            const okMessage = checkMessage();

            if (okName && okEmail && okMessage) {
                const name = nameInput.value.trim();
                feedback.textContent = `Thank you, ${name}! Your message has been sent successfully.`;
                feedback.style.color = "#16a34a";
                contactForm.reset();
                charCount.textContent = "0";
                [nameInput, emailInput, messageInput].forEach((i) => i.classList.remove("valid", "invalid"));
            } else {
                feedback.textContent = "Please correct the highlighted fields and try again.";
                feedback.style.color = "#dc2626";
            }
        });
    }
});
