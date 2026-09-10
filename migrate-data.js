#!/usr/bin/env node
/**
 * Migration Script - Push portfolio data to Supabase
 * Run with: node migrate-data.js
 * Requires: SUPABASE_SERVICE_ROLE_KEY in environment
 */

require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration - REPLACE WITH YOUR VALUES
const SUPABASE_URL = 'https://wsajnfwotxodlkmvxzyc.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_ROLE_KEY_HERE';

if (!SUPABASE_SERVICE_ROLE_KEY || SUPABASE_SERVICE_ROLE_KEY === 'YOUR_SERVICE_ROLE_KEY_HERE') {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY not set!');
    console.error('Set it in .env.local or as environment variable');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
});

// ============================================
// PORTFOLIO DATA (from your current index.html)
// ============================================

const portfolioData = {
    projects: [
        {
            title: 'MARKIVOIRE',
            description: 'Marketplace smartphones intelligente avec négociation de prix, paiement à la livraison, suivi commandes temps réel, dashboard admin complet.',
            repo_url: 'https://github.com/gasicidevshome/markivoire',
            demo_url: null,
            stack: ['Next.js 14', 'Laravel 11', 'PostgreSQL 15', 'Zustand', 'Tailwind CSS'],
            image_url: null,
            image_alt: 'MARKIVOIRE - Marketplace Smartphones',
            category: 'Marketplace',
            featured: true,
            published: true,
            sort_order: 1
        },
        {
            title: 'RELIABLE',
            description: 'Application VTC type Uber avec négociation prix temps réel, GPS, gestion commissions, notifications push, architecture Clean + Riverpod.',
            repo_url: 'https://github.com/gasicidevshome/reliable',
            demo_url: null,
            stack: ['Flutter 3.9', 'Firebase Firestore', 'Google Maps', 'Riverpod', 'Clean Architecture'],
            image_url: null,
            image_alt: 'RELIABLE - App VTC',
            category: 'Mobile · VTC',
            featured: true,
            published: true,
            sort_order: 2
        },
        {
            title: 'SOLDIVOIR',
            description: 'E-commerce ivoirien complet : panier, commandes, gestion livreurs, dashboard admin, WebSocket temps réel, Tailwind CSS 4.',
            repo_url: 'https://github.com/gasicidevshome/SOLDIVOIR',
            demo_url: null,
            stack: ['PHP 7.4', 'MySQL', 'WebSocket (Ratchet)', 'Tailwind CSS 4'],
            image_url: null,
            image_alt: 'SOLDIVOIR - E-Commerce',
            category: 'E-Commerce',
            featured: true,
            published: true,
            sort_order: 3
        },
        {
            title: 'PRINT-HOUSE',
            description: 'PWA Gestion de caisse hors-ligne : Node.js + SQLite, Service Worker, synchronisation différée, impression tickets.',
            repo_url: 'https://github.com/gasicidevshome/Print-House',
            demo_url: null,
            stack: ['Node.js', 'SQLite', 'PWA', 'Service Worker', 'Express'],
            image_url: null,
            image_alt: 'PRINT-HOUSE - PWA Caisse',
            category: 'PWA · Caisse',
            featured: true,
            published: true,
            sort_order: 4
        },
        {
            title: 'NEXO-FITNESS',
            description: 'Plateforme fitness/web : Laravel + Vite 8 + Tailwind 4, gestion abonnements, planning, coach, paiement Moneroo.',
            repo_url: 'https://github.com/gasicidevshome/NEXO-FITNESS',
            demo_url: null,
            stack: ['Laravel', 'Vite 8', 'Tailwind CSS 4', 'PostgreSQL', 'Moneroo'],
            image_url: null,
            image_alt: 'NEXO-FITNESS - Fitness',
            category: 'Web · Fitness',
            featured: true,
            published: true,
            sort_order: 5
        },
        {
            title: 'NZFL-SIGN',
            description: 'Gestion événements avec QR codes, check-in temps réel, génération badges, export Excel, Next.js + TypeScript + ShadCN UI.',
            repo_url: 'https://github.com/gasicidevshome/Nzfl-sign',
            demo_url: null,
            stack: ['Next.js', 'TypeScript', 'ShadCN UI', 'Tailwind CSS', 'PhpSpreadsheet'],
            image_url: null,
            image_alt: 'NZFL-SIGN - QR Events',
            category: 'QR · Events',
            featured: true,
            published: true,
            sort_order: 6
        },
        {
            title: 'CLIMATO-OBS',
            description: 'API pluviométrique : FastAPI Python, Gunicorn + Uvicorn, données météo temps réel, documentation OpenAPI/Swagger.',
            repo_url: 'https://github.com/gasicidevshome/Climato-Obs',
            demo_url: null,
            stack: ['Python', 'FastAPI', 'Uvicorn', 'PostgreSQL', 'Docker'],
            image_url: null,
            image_alt: 'CLIMATO-OBS - API Météo',
            category: 'API · Python',
            featured: true,
            published: true,
            sort_order: 7
        },
        {
            title: 'UNITTRANSFER HUB',
            description: 'Fintech transfert d\'argent : PHP + Ratchet WebSocket, temps réel, notifications, gestion commissions, sécurité renforcée.',
            repo_url: 'https://github.com/gasicidevshome/transfert_ivoire_mvp',
            demo_url: null,
            stack: ['PHP', 'Ratchet WebSocket', 'MySQL', 'WebSocket'],
            image_url: null,
            image_alt: 'UNITTRANSFER HUB - Fintech',
            category: 'Fintech · WS',
            featured: true,
            published: true,
            sort_order: 8
        },
        {
            title: 'DEVPULSECODE v1 & v2',
            description: 'Applications mobiles Flutter : actualités dev, veille tech, mode hors-ligne, synchronisation, architecture modulaire.',
            repo_url: 'https://github.com/gasicidevshome/devpulsecode',
            demo_url: null,
            stack: ['Flutter', 'Dart', 'Provider', 'Hive', 'Clean Architecture'],
            image_url: null,
            image_alt: 'DEVPULSECODE - App Mobile',
            category: 'App Mobile',
            featured: false,
            published: true,
            sort_order: 9
        },
        {
            title: 'IZZYPLUS',
            description: 'Application mobile Flutter : productivité, gestion tâches, synchronisation cloud, thème adaptatif, animations fluides.',
            repo_url: 'https://github.com/gasicidevshome/IzzyPlus',
            demo_url: null,
            stack: ['Flutter', 'Dart', 'Riverpod', 'Firebase', 'GoRouter'],
            image_url: null,
            image_alt: 'IZZYPLUS - App Mobile',
            category: 'App Mobile',
            featured: false,
            published: true,
            sort_order: 10
        },
        {
            title: 'RÉSERVATION MARIAGE',
            description: 'Système RSVP mariage : PHP + MySQL, gestion invités, confirmation présence, menus, places, email automatique.',
            repo_url: 'https://github.com/gasicidevshome/reservatiobn',
            demo_url: null,
            stack: ['PHP', 'MySQL', 'Tailwind CSS', 'PHPMailer'],
            image_url: null,
            image_alt: 'RÉSERVATION MARIAGE - RSVP',
            category: 'RSVP',
            featured: false,
            published: true,
            sort_order: 11
        },
        {
            title: 'HOTEL · SHOP · LE GOURMET · SWIFTFLOW…',
            description: 'Plus de 6 projets additionnels : gestion hôtelière, e-commerce boutique, restauration, workflow automation.',
            repo_url: 'https://github.com/gasicidevshome',
            demo_url: null,
            stack: ['Laravel', 'Flutter', 'Next.js', 'PHP', 'Node.js', 'Python'],
            image_url: null,
            image_alt: 'Divers',
            category: 'Divers',
            featured: false,
            published: true,
            sort_order: 12
        }
    ],

    skills: [
        { name: 'HTML / CSS / JavaScript', category: 'Frontend', percentage: 92, icon: 'code', sort_order: 1 },
        { name: 'Laravel / PHP', category: 'Backend', percentage: 85, icon: 'server', sort_order: 2 },
        { name: 'Flutter / Dart', category: 'Mobile', percentage: 80, icon: 'phone', sort_order: 3 },
        { name: 'Next.js / React / TypeScript', category: 'Frontend', percentage: 78, icon: 'code', sort_order: 4 },
        { name: 'Python · FastAPI · Tkinter · Kivy', category: 'Backend', percentage: 75, icon: 'terminal', sort_order: 5 },
        { name: 'PostgreSQL / Firebase / MySQL', category: 'Database', percentage: 72, icon: 'database', sort_order: 6 },
        { name: 'Git / Docker / CI/CD', category: 'DevOps', percentage: 70, icon: 'git-branch', sort_order: 7 },
        { name: 'Tailwind CSS / ShadCN UI', category: 'UI/UX', percentage: 88, icon: 'palette', sort_order: 8 },
        { name: 'REST API / GraphQL', category: 'API', percentage: 75, icon: 'share-2', sort_order: 9 },
        { name: 'WebSocket / Temps Réel', category: 'Realtime', percentage: 80, icon: 'activity', sort_order: 10 }
    ],

    about: {
        bio: 'Salut, je m\'appelle <strong>Ouattara Yao Sanhibou</strong> et j\'utilise <strong>Gasici Mito Dev</strong> comme alias. Développeur Full Stack Web, Mobile & Desktop basé à Abidjan, Côte d\'Ivoire 🇨🇮. Autodidacte depuis 2018 — YouTube, documentation officielle, projets réels. 14 projets livrés : e-commerce, VTC, marketplace, API REST, PWA et apps cross-platform. Passionné par les jeux vidéo, le hacking éthique, les mangas et l\'innovation tech.',
        stats: { projects: '14+', years: '7+', technologies: '16+', platforms: '3' },
        cta_text: 'me contacter',
        cta_link: 'mailto:gasicihome@gmail.com'
    },

    cv_experience: [
        { title: 'MARKIVOIRE — Marketplace Smartphones', company: 'Freelance', period: '2024 — PRÉSENT', description: 'Next.js 14 + Laravel 11 + PostgreSQL 15, JWT/Sanctum. Paiement livraison, suivi commandes, dashboard admin.', stack: ['Next.js 14', 'Laravel 11', 'PostgreSQL 15', 'Zustand'], sort_order: 1 },
        { title: 'RELIABLE — App VTC (type Uber)', company: 'Freelance', period: '2024 — PRÉSENT', description: 'Flutter · Clean Architecture · Firebase Firestore. Négociation prix temps réel, GPS, commissions, push. 8 tables Firestore, Riverpod.', stack: ['Flutter 3.9', 'Firebase', 'Google Maps', 'Riverpod'], sort_order: 2 },
        { title: 'SOLDIVOIR — E-Commerce Ivoirien', company: 'Freelance', period: '2023 — 2024', description: 'PHP / MySQL · WebSocket temps réel. Panier, commandes, livreurs, dashboard, Tailwind 4.', stack: ['PHP 7.4', 'MySQL', 'WebSocket'], sort_order: 3 },
        { title: 'PRINT-HOUSE — PWA Gestion Caisse', company: 'Freelance', period: '2024', description: 'Node.js + SQLite · Service Worker · Hors-ligne.', stack: ['Node.js', 'SQLite', 'PWA'], sort_order: 4 },
        { title: 'CLIMATO-OBS — API Pluviométrique', company: 'Freelance', period: '2024', description: 'FastAPI Python · Gunicorn + Uvicorn.', stack: ['Python', 'FastAPI'], sort_order: 5 },
        { title: 'Autres projets GitHub (14+)', company: 'Freelance', period: '2018 — PRÉSENT', description: 'NEXO-FITNESS, NZFL-SIGN, UnitTransfer Hub, DevPulseCode, IzzyPlus, Réservation, Hotel, LeGourmet…', stack: ['Laravel', 'Flutter', 'Next.js', 'PHP', 'Node.js', 'Python'], sort_order: 6 }
    ],

    cv_education: [
        { degree: 'Baccalauréat Série D', institution: 'Groupe Scolaire Akanji', year: '2024', description: 'Yopougon, Abidjan', sort_order: 1 },
        { degree: 'Formation Autodidacte — Web & Mobile', institution: 'Auto-formation', year: '2018 — PRÉSENT', description: 'YouTube · Documentation Officielle · 7+ ans de pratique', sort_order: 2 }
    ],

    cv_contact: [
        { type: 'location', label: 'Localisation', value: 'Abidjan, Yopougon — CI', link: null, icon: 'map-pin', sort_order: 1 },
        { type: 'phone', label: 'Téléphone', value: '+225 07 98 41 65 33', link: 'tel:+2250798416533', icon: 'phone', sort_order: 2 },
        { type: 'email', label: 'Email', value: 'gasicihome@gmail.com', link: 'mailto:gasicihome@gmail.com', icon: 'mail', sort_order: 3 },
        { type: 'github', label: 'GitHub', value: 'github.com/gasicidevshome', link: 'https://github.com/gasicidevshome', icon: 'github', sort_order: 4 },
        { type: 'tiktok', label: 'TikTok', value: '@mito_gpsdev', link: 'https://www.tiktok.com/@mito_gpsdev', icon: 'music', sort_order: 4 }
    ],

    cv_skills: [
        { name: 'HTML/CSS/JS', percentage: 92, sort_order: 1 },
        { name: 'Laravel/PHP', percentage: 85, sort_order: 2 },
        { name: 'Flutter/Dart', percentage: 80, sort_order: 3 },
        { name: 'Next.js/React', percentage: 78, sort_order: 4 },
        { name: 'Python/FastAPI', percentage: 75, sort_order: 5 },
        { name: 'PostgreSQL/Firebase', percentage: 72, sort_order: 6 }
    ],

    cv_stack_tags: [
        'Laravel', 'Next.js', 'Flutter', 'React', 'TypeScript', 'Python', 'FastAPI', 'PostgreSQL', 'Firebase', 'MySQL', 'Tkinter', 'Kivy', 'WebSocket', 'PWA', 'Claude AI'
    ],

    languages: [
        { name: 'Français', level: 'Natif', sort_order: 1 },
        { name: 'Anglais', level: 'B1 Tech', sort_order: 2 },
        { name: 'Dioula', level: 'Natif', sort_order: 3 }
    ],

    interests: [
        { name: 'Jeux Vidéo', sort_order: 1 },
        { name: 'Hacking', sort_order: 2 },
        { name: 'Mangas', sort_order: 3 },
        { name: 'Innovation', sort_order: 4 }
    ],

    contact_links: [
        { type: 'phone', label: '+225 07 98 41 65 33', value: '+225 07 98 41 65 33', link: 'tel:+2250798416533', icon: 'phone', sort_order: 1 },
        { type: 'email', label: 'gasicihome@gmail.com', value: 'gasicihome@gmail.com', link: 'mailto:gasicihome@gmail.com', icon: 'mail', sort_order: 2 },
        { type: 'github', label: 'github.com/gasicidevshome', value: 'github.com/gasicidevshome', link: 'https://github.com/gasicidevshome', icon: 'github', sort_order: 3 },
        { type: 'tiktok', label: '@mito_gpsdev — TikTok', value: '@mito_gpsdev', link: 'https://www.tiktok.com/@mito_gpsdev', icon: 'music', sort_order: 4 },
        { type: 'portfolio', label: 'Portfolio GitHub Pages', value: 'Portfolio GitHub Pages', link: 'https://gasicidevshome.github.io/Oauttara-Yao-Sanhibou-Porfolio/', icon: 'globe', sort_order: 5 },
        { type: 'location', label: 'Abidjan, Yopougon — Côte d\'Ivoire 🇨🇮', value: 'Abidjan, Yopougon — Côte d\'Ivoire 🇨🇮', link: null, icon: 'map-pin', sort_order: 6 }
    ]
};

// ============================================
// MIGRATION FUNCTIONS
// ============================================

async function migrate() {
    console.log('🚀 Starting migration to Supabase...\n');
    console.log(`📡 Target: ${SUPABASE_URL}\n`);

    try {
        // 1. Projects
        console.log('📦 Migrating projects...');
        const { error: projectsError } = await supabase
            .from('projects')
            .upsert(portfolioData.projects, { onConflict: 'title' });
        if (projectsError) throw projectsError;
        console.log(`   ✅ ${portfolioData.projects.length} projects`);

        // 2. Skills
        console.log('🎯 Migrating skills...');
        const { error: skillsError } = await supabase
            .from('skills')
            .upsert(portfolioData.skills, { onConflict: 'name' });
        if (skillsError) throw skillsError;
        console.log(`   ✅ ${portfolioData.skills.length} skills`);

        // 3. About
        console.log('📝 Migrating about...');
        const { error: aboutError } = await supabase
            .from('about')
            .upsert([portfolioData.about], { onConflict: 'id' });
        if (aboutError) throw aboutError;
        console.log(`   ✅ About section`);

        // 4. CV Experience
        console.log('💼 Migrating CV experience...');
        const { error: cvExpError } = await supabase
            .from('cv_experience')
            .upsert(portfolioData.cv_experience, { onConflict: 'title,period' });
        if (cvExpError) throw cvExpError;
        console.log(`   ✅ ${portfolioData.cv_experience.length} experiences`);

        // 5. CV Education
        console.log('🎓 Migrating CV education...');
        const { error: cvEduError } = await supabase
            .from('cv_education')
            .upsert(portfolioData.cv_education, { onConflict: 'degree,institution' });
        if (cvEduError) throw cvEduError;
        console.log(`   ✅ ${portfolioData.cv_education.length} education entries`);

        // 6. CV Contact
        console.log('📞 Migrating CV contact...');
        const { error: cvContactError } = await supabase
            .from('cv_contact')
            .upsert(portfolioData.cv_contact, { onConflict: 'type,value' });
        if (cvContactError) throw cvContactError;
        console.log(`   ✅ ${portfolioData.cv_contact.length} contacts`);

        // 7. CV Skills
        console.log('📊 Migrating CV skills...');
        const { error: cvSkillsError } = await supabase
            .from('cv_skills')
            .upsert(portfolioData.cv_skills, { onConflict: 'name' });
        if (cvSkillsError) throw cvSkillsError;
        console.log(`   ✅ ${portfolioData.cv_skills.length} CV skills`);

        // 8. CV Stack Tags
        console.log('🏷️ Migrating CV stack tags...');
        const cvStackTags = portfolioData.cv_stack_tags.map((name, i) => ({ name, sort_order: i + 1 }));
        const { error: cvStackError } = await supabase
            .from('cv_stack_tags')
            .upsert(cvStackTags, { onConflict: 'name' });
        if (cvStackError) throw cvStackError;
        console.log(`   ✅ ${cvStackTags.length} stack tags`);

        // 9. Languages
        console.log('🌍 Migrating languages...');
        const { error: langError } = await supabase
            .from('languages')
            .upsert(portfolioData.languages, { onConflict: 'name' });
        if (langError) throw langError;
        console.log(`   ✅ ${portfolioData.languages.length} languages`);

        // 10. Interests
        console.log('🎮 Migrating interests...');
        const { error: intError } = await supabase
            .from('interests')
            .upsert(portfolioData.interests, { onConflict: 'name' });
        if (intError) throw intError;
        console.log(`   ✅ ${portfolioData.interests.length} interests`);

        // 11. Contact Links
        console.log('🔗 Migrating contact links...');
        const { error: clError } = await supabase
            .from('contact_links')
            .upsert(portfolioData.contact_links, { onConflict: 'type,value' });
        if (clError) throw clError;
        console.log(`   ✅ ${portfolioData.contact_links.length} contact links`);

        console.log('\n🎉 Migration completed successfully!');
        console.log('\n📋 Next steps:');
        console.log('   1. Go to Supabase Dashboard → Authentication → Users');
        console.log('   2. Create admin user with email: gasicihome@gmail.com');
        console.log('   3. Copy the user UUID');
        console.log('   4. Run: INSERT INTO admin_users (id, email, full_name, role, is_active) VALUES (\'<UUID>\', \'gasicihome@gmail.com\', \'Ouattara Yao Sanhibou\', \'super_admin\', true);');
        console.log('   5. Enable MFA for the user in Supabase Auth settings');
        console.log('   6. Open admin-login.html and login');

    } catch (error) {
        console.error('\n❌ Migration failed:', error.message);
        if (error.details) console.error('Details:', error.details);
        if (error.hint) console.error('Hint:', error.hint);
        process.exit(1);
    }
}

// Run migration
migrate();