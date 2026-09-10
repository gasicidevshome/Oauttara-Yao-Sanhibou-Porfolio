-- Seed Data for Gasici Mito Dev Portfolio
-- Run this AFTER:
-- 1. Creating admin user in Supabase Auth (Authentication → Users → Add User)
-- 2. Running supabase-schema.sql
-- 3. Getting the admin user's UUID from auth.users

-- ============================================
-- REPLACE THIS UUID with your actual admin user ID from auth.users
-- Get it from: Dashboard → Authentication → Users → Click user → Copy UUID
-- ============================================
-- Example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
-- DO NOT RUN THIS UNTIL YOU REPLACE THE UUID BELOW!

-- ============================================
-- ADMIN USER PROFILE (run after creating auth user)
-- ============================================
-- insert into public.admin_users (id, email, full_name, role, is_active)
-- values (
--     'REPLACE_WITH_YOUR_ADMIN_UUID'::uuid,
--     'gasicihome@gmail.com',
--     'Ouattara Yao Sanhibou',
--     'super_admin',
--     true
-- );

-- ============================================
-- PROJECTS (14 projects from portfolio)
-- ============================================
insert into public.projects (title, description, repo_url, demo_url, stack, image_url, image_alt, category, featured, published, sort_order) values
(
    'MARKIVOIRE',
    'Marketplace smartphones intelligente avec négociation de prix, paiement à la livraison, suivi commandes temps réel, dashboard admin complet.',
    'https://github.com/gasicidevshome/markivoire',
    null,
    array['Next.js 14', 'Laravel 11', 'PostgreSQL 15', 'Zustand', 'Tailwind CSS'],
    null,
    'MARKIVOIRE - Marketplace Smartphones',
    'Marketplace',
    true,
    true,
    1
),
(
    'RELIABLE',
    'Application VTC type Uber avec négociation prix temps réel, GPS, gestion commissions, notifications push, architecture Clean + Riverpod.',
    'https://github.com/gasicidevshome/reliable',
    null,
    array['Flutter 3.9', 'Firebase Firestore', 'Google Maps', 'Riverpod', 'Clean Architecture'],
    null,
    'RELIABLE - App VTC',
    'Mobile · VTC',
    true,
    true,
    2
),
(
    'SOLDIVOIR',
    'E-commerce ivoirien complet : panier, commandes, gestion livreurs, dashboard admin, WebSocket temps réel, Tailwind CSS 4.',
    'https://github.com/gasicidevshome/SOLDIVOIR',
    null,
    array['PHP 7.4', 'MySQL', 'WebSocket (Ratchet)', 'Tailwind CSS 4'],
    null,
    'SOLDIVOIR - E-Commerce',
    'E-Commerce',
    true,
    true,
    3
),
(
    'PRINT-HOUSE',
    'PWA Gestion de caisse hors-ligne : Node.js + SQLite, Service Worker, synchronisation différée, impression tickets.',
    'https://github.com/gasicidevshome/Print-House',
    null,
    array['Node.js', 'SQLite', 'PWA', 'Service Worker', 'Express'],
    null,
    'PRINT-HOUSE - PWA Caisse',
    'PWA · Caisse',
    true,
    true,
    4
),
(
    'NEXO-FITNESS',
    'Plateforme fitness/web : Laravel + Vite 8 + Tailwind 4, gestion abonnements, planning, coach, paiement Moneroo.',
    'https://github.com/gasicidevshome/NEXO-FITNESS',
    null,
    array['Laravel', 'Vite 8', 'Tailwind CSS 4', 'PostgreSQL', 'Moneroo'],
    null,
    'NEXO-FITNESS - Fitness',
    'Web · Fitness',
    true,
    true,
    5
),
(
    'NZFL-SIGN',
    'Gestion événements avec QR codes, check-in temps réel, génération badges, export Excel, Next.js + TypeScript + ShadCN UI.',
    'https://github.com/gasicidevshome/Nzfl-sign',
    null,
    array['Next.js', 'TypeScript', 'ShadCN UI', 'Tailwind CSS', 'PhpSpreadsheet'],
    null,
    'NZFL-SIGN - QR Events',
    'QR · Events',
    true,
    true,
    6
),
(
    'CLIMATO-OBS',
    'API pluviométrique : FastAPI Python, Gunicorn + Uvicorn, données météo temps réel, documentation OpenAPI/Swagger.',
    'https://github.com/gasicidevshome/Climato-Obs',
    null,
    array['Python', 'FastAPI', 'Uvicorn', 'PostgreSQL', 'Docker'],
    null,
    'CLIMATO-OBS - API Météo',
    'API · Python',
    true,
    true,
    7
),
(
    'UNITTRANSFER HUB',
    'Fintech transfert d''argent : PHP + Ratchet WebSocket, temps réel, notifications, gestion commissions, sécurité renforcée.',
    'https://github.com/gasicidevshome/transfert_ivoire_mvp',
    null,
    array['PHP', 'Ratchet WebSocket', 'MySQL', 'WebSocket'],
    null,
    'UNITTRANSFER HUB - Fintech',
    'Fintech · WS',
    true,
    true,
    8
),
(
    'DEVPULSECODE v1 & v2',
    'Applications mobiles Flutter : actualités dev, veille tech, mode hors-ligne, synchronisation, architecture modulaire.',
    'https://github.com/gasicidevshome/devpulsecode',
    null,
    array['Flutter', 'Dart', 'Provider', 'Hive', 'Clean Architecture'],
    null,
    'DEVPULSECODE - App Mobile',
    'App Mobile',
    false,
    true,
    9
),
(
    'IZZYPLUS',
    'Application mobile Flutter : productivité, gestion tâches, synchronisation cloud, thème adaptatif, animations fluides.',
    'https://github.com/gasicidevshome/IzzyPlus',
    null,
    array['Flutter', 'Dart', 'Riverpod', 'Firebase', 'GoRouter'],
    null,
    'IZZYPLUS - App Mobile',
    'App Mobile',
    false,
    true,
    10
),
(
    'RÉSERVATION MARIAGE',
    'Système RSVP mariage : PHP + MySQL, gestion invités, confirmation présence, menus, places, email automatique.',
    'https://github.com/gasicidevshome/reservatiobn',
    null,
    array['PHP', 'MySQL', 'Tailwind CSS', 'PHPMailer'],
    null,
    'RÉSERVATION MARIAGE - RSVP',
    'RSVP',
    false,
    true,
    11
),
(
    'HOTEL · SHOP · LE GOURMET · SWIFTFLOW…',
    'Plus de 6 projets additionnels : gestion hôtelière, e-commerce boutique, restauration, workflow automation.',
    'https://github.com/gasicidevshome',
    null,
    array['Laravel', 'Flutter', 'Next.js', 'PHP', 'Node.js', 'Python'],
    null,
    'Divers',
    'Divers',
    false,
    true,
    12
);

-- ============================================
-- SKILLS (from portfolio)
-- ============================================
insert into public.skills (name, category, percentage, icon, sort_order) values
('HTML / CSS / JavaScript', 'Frontend', 92, 'code', 1),
('Laravel / PHP', 'Backend', 85, 'server', 2),
('Flutter / Dart', 'Mobile', 80, 'phone', 3),
('Next.js / React / TypeScript', 'Frontend', 78, 'code', 4),
('Python · FastAPI · Tkinter · Kivy', 'Backend', 75, 'terminal', 5),
('PostgreSQL / Firebase / MySQL', 'Database', 72, 'database', 6),
('Git / Docker / CI/CD', 'DevOps', 70, 'git-branch', 7),
('Tailwind CSS / ShadCN UI', 'UI/UX', 88, 'palette', 8),
('REST API / GraphQL', 'API', 75, 'share-2', 9),
('WebSocket / Temps Réel', 'Realtime', 80, 'activity', 10);

-- ============================================
-- ABOUT SECTION
-- ============================================
insert into public.about (bio, stats, cta_text, cta_link) values
(
    'Salut, je m''appelle <strong>Ouattara Yao Sanhibou</strong> et j''utilise <strong>Gasici Mito Dev</strong> comme alias. Développeur Full Stack Web, Mobile & Desktop basé à Abidjan, Côte d''Ivoire 🇨🇮. Autodidacte depuis 2018 — YouTube, documentation officielle, projets réels. 14 projets livrés : e-commerce, VTC, marketplace, API REST, PWA et apps cross-platform. Passionné par les jeux vidéo, le hacking éthique, les mangas et l''innovation tech.',
    '{"projects": "14+", "years": "7+", "technologies": "16+", "platforms": "3"}',
    'me contacter',
    'mailto:gasicihome@gmail.com'
);

-- ============================================
-- CV EXPERIENCE
-- ============================================
insert into public.cv_experience (title, company, period, description, stack, sort_order) values
('MARKIVOIRE — Marketplace Smartphones', 'Freelance', '2024 — PRÉSENT', 'Next.js 14 + Laravel 11 + PostgreSQL 15, JWT/Sanctum. Paiement livraison, suivi commandes, dashboard admin.', array['Next.js 14', 'Laravel 11', 'PostgreSQL 15', 'Zustand'], 1),
('RELIABLE — App VTC (type Uber)', 'Freelance', '2024 — PRÉSENT', 'Flutter · Clean Architecture · Firebase Firestore. Négociation prix temps réel, GPS, commissions, push. 8 tables Firestore, Riverpod.', array['Flutter 3.9', 'Firebase', 'Google Maps', 'Riverpod'], 2),
('SOLDIVOIR — E-Commerce Ivoirien', 'Freelance', '2023 — 2024', 'PHP / MySQL · WebSocket temps réel. Panier, commandes, livreurs, dashboard, Tailwind 4.', array['PHP 7.4', 'MySQL', 'WebSocket'], 3),
('PRINT-HOUSE — PWA Gestion Caisse', 'Freelance', '2024', 'Node.js + SQLite · Service Worker · Hors-ligne.', array['Node.js', 'SQLite', 'PWA'], 4),
('CLIMATO-OBS — API Pluviométrique', 'Freelance', '2024', 'FastAPI Python · Gunicorn + Uvicorn.', array['Python', 'FastAPI'], 5),
('Autres projets GitHub (14+)', 'Freelance', '2018 — PRÉSENT', 'NEXO-FITNESS, NZFL-SIGN, UnitTransfer Hub, DevPulseCode, IzzyPlus, Réservation, Hotel, LeGourmet…', array['Laravel', 'Flutter', 'Next.js', 'PHP', 'Node.js', 'Python'], 6);

-- ============================================
-- CV EDUCATION
-- ============================================
insert into public.cv_education (degree, institution, year, description, sort_order) values
('Baccalauréat Série D', 'Groupe Scolaire Akanji', '2024', 'Yopougon, Abidjan', 1),
('Formation Autodidacte — Web & Mobile', 'Auto-formation', '2018 — PRÉSENT', 'YouTube · Documentation Officielle · 7+ ans de pratique', 2);

-- ============================================
-- CV CONTACT
-- ============================================
insert into public.cv_contact (type, label, value, link, icon, sort_order) values
('location', 'Localisation', 'Abidjan, Yopougon — CI', null, 'map-pin', 1),
('phone', 'Téléphone', '+225 07 98 41 65 33', 'tel:+2250798416533', 'phone', 2),
('email', 'Email', 'gasicihome@gmail.com', 'mailto:gasicihome@gmail.com', 'mail', 3),
('github', 'GitHub', 'github.com/gasicidevshome', 'https://github.com/gasicidevshome', 'github', 4),
('tiktok', 'TikTok', '@mito_gpsdev', 'https://www.tiktok.com/@mito_gpsdev', 'music', 5);

-- ============================================
-- CV SKILLS (sidebar)
-- ============================================
insert into public.cv_skills (name, percentage, sort_order) values
('HTML/CSS/JS', 92, 1),
('Laravel/PHP', 85, 2),
('Flutter/Dart', 80, 3),
('Next.js/React', 78, 4),
('Python/FastAPI', 75, 5),
('PostgreSQL/Firebase', 72, 6);

-- ============================================
-- CV STACK TAGS
-- ============================================
insert into public.cv_stack_tags (name, sort_order) values
('Laravel', 1), ('Next.js', 2), ('Flutter', 3), ('React', 4), ('TypeScript', 5),
('Python', 6), ('FastAPI', 7), ('PostgreSQL', 8), ('Firebase', 9), ('MySQL', 10),
('Tkinter', 11), ('Kivy', 12), ('WebSocket', 13), ('PWA', 14), ('Claude AI', 15);

-- ============================================
-- LANGUAGES
-- ============================================
insert into public.languages (name, level, sort_order) values
('Français', 'Natif', 1),
('Anglais', 'B1 Tech', 2),
('Dioula', 'Natif', 3);

-- ============================================
-- INTERESTS
-- ============================================
insert into public.interests (name, sort_order) values
('Jeux Vidéo', 1), ('Hacking', 2), ('Mangas', 3), ('Innovation', 4);

-- ============================================
-- CONTACT LINKS
-- ============================================
insert into public.contact_links (type, label, value, link, icon, sort_order) values
('phone', '+225 07 98 41 65 33', '+225 07 98 41 65 33', 'tel:+2250798416533', 'phone', 1),
('email', 'gasicihome@gmail.com', 'gasicihome@gmail.com', 'mailto:gasicihome@gmail.com', 'mail', 2),
('github', 'github.com/gasicidevshome', 'github.com/gasicidevshome', 'https://github.com/gasicidevshome', 'github', 3),
('tiktok', '@mito_gpsdev — TikTok', '@mito_gpsdev', 'https://www.tiktok.com/@mito_gpsdev', 'music', 4),
('portfolio', 'Portfolio GitHub Pages', 'Portfolio GitHub Pages', 'https://gasicidevshome.github.io/Oauttara-Yao-Sanhibou-Porfolio/', 'globe', 5),
('location', 'Abidjan, Yopougon — Côte d''Ivoire 🇨🇮', 'Abidjan, Yopougon — Côte d''Ivoire 🇨🇮', null, 'map-pin', 6);