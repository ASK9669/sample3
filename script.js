// ─── READING PROGRESS & SCROLL DETECTION ───
function initScroll() {
    window.addEventListener('scroll', debounce(handleScroll, 50));
}

function handleScroll() {
    const doc = document.documentElement;
    const pct = (window.scrollY / (doc.scrollHeight - doc.clientHeight)) * 100;
    const progress = document.getElementById('progress');
    if (progress) {
        progress.style.width = pct + '%';
    }

    // Back to top button visibility
    const backTop = document.getElementById('backTop');
    if (backTop) {
        backTop.classList.toggle('visible', window.scrollY > 400);
    }

    // Nav highlight based on current section
    updateNavHighlight();
}

function updateNavHighlight() {
    const sections = document.querySelectorAll('.section, .final-summary');
    const navLinks = document.querySelectorAll('.nav a');
    let current = '';

    sections.forEach(section => {
        if (window.scrollY >= section.offsetTop - 100) {
            current = section.id;
        }
    });

    navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
}

// ─── DEBOUNCE UTILITY ───
function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
}

// ─── ACCORDION ───
function toggleAcc(btn) {
    const body = btn.nextElementSibling;
    const isOpen = btn.classList.toggle('open');
    body.classList.toggle('open');

    // Smooth animation
    if (isOpen) {
        body.style.maxHeight = body.scrollHeight + 'px';
    } else {
        body.style.maxHeight = '0';
    }
}

// ─── QUIZ SYSTEM ───
const correctFeedback = [
    "✓ Correct! Peter Chen introduced the ER Model in 1976 in his landmark paper.",
    "✓ Correct! The conceptual level uses ER diagrams and is technology-independent.",
    "✓ Correct! DEPENDENT is a weak entity — it requires an EMPLOYEE to exist.",
    "✓ Correct! Weak entities are drawn with a double rectangle in ER diagrams.",
    "✓ Correct! Address is composite because it can be divided into Street, City, State, Zip.",
    "✓ Correct! Age computed from Date_of_Birth is a derived attribute (dashed oval).",
    "✓ Correct! Multi-valued attributes use a double oval in ER diagrams.",
    "✓ Correct! An EMPLOYEE supervising another EMPLOYEE is a unary (recursive) relationship.",
    "✓ Correct! Relationships are drawn as diamond shapes in ER diagrams.",
    "✓ Correct! When every entity MUST participate, it is total (mandatory) participation.",
    "✓ Correct! Many students can enroll in many courses — that's an M:N cardinality.",
    "✓ Correct! The identifying relationship is drawn as a double diamond.",
    "✓ Correct! Combining CAR and TRUCK into VEHICLE is generalization (bottom-up).",
    "✓ Correct! Disjoint constraint means an entity belongs to at most ONE subclass.",
    "✓ Correct! M:N relationships require a separate junction (association) table.",
    "✓ Correct! Multi-valued attributes map to a separate table with a FK to the owner."
];

const wrongFeedback = [
    "✗ Incorrect. The ER model was introduced by Peter Chen in 1976.",
    "✗ Incorrect. The conceptual level uses ER diagrams — it's technology-independent.",
    "✗ Incorrect. DEPENDENT cannot exist without its owner EMPLOYEE — it's a weak entity.",
    "✗ Incorrect. Weak entities use a double rectangle (not a single rectangle).",
    "✗ Incorrect. Address has sub-components (Street, City, State, Zip) — it's composite.",
    "✗ Incorrect. Age computed from Date_of_Birth is a derived attribute.",
    "✗ Incorrect. Multi-valued attributes use a double oval (not dashed or underlined).",
    "✗ Incorrect. EMPLOYEE supervising EMPLOYEE involves the same entity type — it's unary/recursive.",
    "✗ Incorrect. Relationships are represented by diamond shapes, not rectangles or ovals.",
    "✗ Incorrect. Mandatory/must participate = Total participation (drawn with a double line).",
    "✗ Incorrect. Many students enrolling in many courses is M:N cardinality.",
    "✗ Incorrect. Identifying relationships are drawn as double diamonds.",
    "✗ Incorrect. Combining specific types into a general type is generalization (bottom-up).",
    "✗ Incorrect. Disjoint (d) means only ONE subclass; overlapping (o) means multiple.",
    "✗ Incorrect. M:N maps to a separate junction table (neither entity gets the FK alone).",
    "✗ Incorrect. Multi-valued attributes map to a separate table with a foreign key."
];

const scores = {};
const questionIndex = {
    q1: 0, q2: 1, q3: 2, q4: 3, q5: 4, q6: 5, q7: 6, q8: 7,
    q9: 8, q10: 9, q11: 10, q12: 11, q13: 12, q14: 13, q15: 14, q16: 15
};

const sectionQuizzes = {
    'q-intro-score': ['q1', 'q2'],
    'q-entities-score': ['q3', 'q4'],
    'q-attr-score': ['q5', 'q6', 'q7'],
    'q-rel-score': ['q8', 'q9'],
    'q-const-score': ['q10', 'q11'],
    'q-weak-score': ['q12'],
    'q-eer-score': ['q13', 'q14'],
    'q-design-score': ['q15', 'q16']
};

function answer(btn, qid, correct) {
    const container = document.getElementById(qid);
    if (!container) return;

    if (container.dataset.answered) return;
    container.dataset.answered = '1';

    const allBtns = container.querySelectorAll('.quiz-btn');
    const fb = document.getElementById(qid + '-fb');
    const idx = questionIndex[qid];

    // Disable all buttons
    allBtns.forEach(b => {
        b.disabled = true;
        if (b !== btn) b.classList.add('dimmed');
    });

    // Show feedback
    btn.classList.add(correct ? 'correct' : 'wrong');
    if (fb) {
        fb.textContent = correct ? correctFeedback[idx] : wrongFeedback[idx];
        fb.className = 'quiz-feedback show ' + (correct ? 'correct' : 'wrong');
    }

    // Track score
    scores[qid] = correct ? 1 : 0;
    updateSectionScore(qid);

    // Add haptic feedback if available
    if (navigator.vibrate) {
        navigator.vibrate(correct ? 50 : [50, 50, 50]);
    }
}

function updateSectionScore(qid) {
    for (const [scoreId, qs] of Object.entries(sectionQuizzes)) {
        if (qs.includes(qid)) {
            const answered = qs.filter(q => scores[q] !== undefined).length;
            const got = qs.reduce((sum, q) => sum + (scores[q] || 0), 0);
            if (answered === qs.length) {
                const el = document.getElementById(scoreId);
                if (el) {
                    el.innerHTML = `Score: <span>${got}/${qs.length}</span>`;
                }
            }
        }
    }
}

function calcTotal() {
    const all = Object.values(sectionQuizzes).flat();
    const answered = all.filter(q => scores[q] !== undefined).length;
    const got = all.reduce((sum, q) => sum + (scores[q] || 0), 0);
    const total = all.length;
    const pct = answered === 0 ? 0 : Math.round((got / answered) * 100);
    const el = document.getElementById('total-score');

    if (el) {
        el.innerHTML = `${got} / ${answered} <span style="font-size:1.2rem;color:var(--text-muted)">(${pct}%)</span>`;

        if (pct >= 80) el.style.color = 'var(--accent2)';
        else if (pct >= 60) el.style.color = 'var(--accent5)';
        else el.style.color = 'var(--accent3)';
    }

    const sub = el?.nextElementSibling;
    if (sub) {
        if (answered < total) {
            sub.textContent = `${total - answered} questions not yet answered`;
        } else {
            sub.textContent = pct >= 80 ? '🎉 Excellent! You\'ve mastered Chapter 2!' : 'Keep reviewing and try again!';
        }
    }
}

// ─── SMOOTH SCROLL TO SECTION ───
function smoothScroll(target) {
    const element = document.querySelector(target);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// ─── BACK TO TOP HANDLER ───
function initBackToTop() {
    const backTop = document.getElementById('backTop');
    if (backTop) {
        backTop.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

// ─── SCROLL HINT INTERACTIVITY ───
function initScrollHint() {
    const hint = document.querySelector('.scroll-hint');
    if (hint) {
        hint.style.cursor = 'pointer';
        hint.addEventListener('click', () => {
            smoothScroll('#intro');
        });
    }
}

// ─── KEYBOARD SHORTCUTS ───
function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Home') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (e.key === 'End') {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }
    });
}

// ─── INITIALIZATION ───
function initAll() {
    initScroll();
    initBackToTop();
    initScrollHint();
    initKeyboardShortcuts();

    // Initial nav highlight
    updateNavHighlight();
}

// Run on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
} else {
    initAll();
}
