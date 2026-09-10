# Gasici Mito Dev - Portfolio Admin Dashboard

Admin dashboard sécurisé pour le portfolio, hébergé gratuitement sur **Supabase** + **GitHub Pages**.

## 🏗️ Architecture

```
┌─────────────────┐     ┌──────────────────┐
│  GitHub Pages   │────▶│    Supabase      │
│  (Portfolio)    │     │  (Auth + DB +    │
│  Static HTML    │     │   Storage + RLS) │
└─────────────────┘     └──────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │  Admin Dashboard │
                       │  (Alpine.js +    │
                       │   GSAP + Supa)  │
                       └──────────────────┘
```

## 📁 Structure

```
/data/workspace/portfolio/
├── index.html              # Portfolio principal (existant)
├── admin-login.html        # Page de connexion admin (MFA)
├── admin-dashboard.html    # Dashboard admin complet
├── supabase-schema.sql     # Schema DB complet (RLS, triggers, audit)
├── seed_data.sql           # Données initiales (14 projets, skills, CV, etc.)
├── supabase-client.js      # Client Supabase + helpers CRUD
├── migrate-data.js         # Script Node.js pour migration données
├── package.json            # Dépendances Node
└── .env.local              # Variables d'environnement (NE PAS COMMIT)
```

## 🚀 Installation Rapide

### 1. Créer projet Supabase (Gratuit)
1. Aller sur https://supabase.com/dashboard
2. **New Project** → Nom: `gasici-portfolio-admin`
3. Région: la plus proche (ex: `eu-west-1`)
4. Attendre la création (~2 min)

### 2. Exécuter le Schema SQL
1. Dans Supabase Dashboard → **SQL Editor**
2. **New Query** → Copier-coller le contenu de `supabase-schema.sql`
3. **Run** (⌘+Enter)
3. Vérifier: Tables créées dans **Table Editor**

### 3. Configurer Storage
1. **Storage** → **Buckets** → Vérifier `portfolio` existe (public)
2. Policies déjà créées par le script SQL

### 4. Configurer Auth
1. **Authentication** → **Settings**
2. **Site URL**: `https://gasicidevshome.github.io` (ou votre domaine)
3. **Redirect URLs**: Ajouter `https://gasicidevshome.github.io/admin-dashboard.html`
4. **Email Auth**: Enable email confirmations = **OFF** (pour dev)
5. **MFA**: **Auth** → **Settings** → **MFA** → Enable TOTP = **ON**

### 5. Créer l'Admin User
1. **Authentication** → **Users** → **Add User**
2. Email: `gasicihome@gmail.com`
3. Password: (votre choix sécurisé)
6. **Auto-confirm**: ON
7. **Create** → Copier l'**UUID** généré

### 6. Ajouter Profil Admin
Dans **SQL Editor** :
```sql
INSERT INTO admin_users (id, email, full_name, role, is_active)
VALUES (
    'COLLEZ_L_UUID_ICI'::uuid,
    'gasicihome@gmail.com',
    'Ouattara Yao Sanhibou',
    'super_admin',
    true
);
```

### 7. Activer MFA pour l'Admin
1. **Authentication** → **Users** → Cliquer votre user
2. **MFA** → **Enroll TOTP**
3. Scanner QR code avec **Google Authenticator** / **Authy**
3. Sauvegarder codes de secours

### 8. Lancer la Migration
```bash
cd /data/workspace/portfolio
npm install @supabase/supabase-js dotenv
# Créer .env.local avec votre SERVICE_ROLE_KEY
echo "SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key" > .env.local
node migrate-data.js
```

### 9. Tester l'Admin
1. Ouvrir `admin-login.html` dans navigateur
2. Login avec email + password
3. MFA → Code à 6 chiffres
4. Redirection vers `admin-dashboard.html`

### 10. Déployer sur GitHub Pages
```bash
# Dans votre repo portfolio
git add admin-login.html admin-dashboard.html supabase-client.js
git commit -m "Add admin dashboard"
git push origin main
```
Activez GitHub Pages dans Settings → Pages → Source: `main` branch

## 🔐 Sécurité

| Mesure | Implémentation |
|--------|----------------|
| **RLS** | Toutes tables protégées - lecture publique seulement si `published=true` |
| **MFA** | TOTP obligatoire pour admin (Supabase Auth natif) |
| **Audit Logs** | Triggers sur toutes tables → table `audit_logs` |
| **Rate Limiting** | Via Supabase (configurable dans Dashboard) |
| **HTTPS Only** | GitHub Pages + Supabase = HTTPS forcé |
| **CSP** | Headers via meta tags dans HTML |
| **Secrets** | `service_role_key` uniquement côté script migration (jamais dans frontend) |

## 🎨 Fonctionnalités Dashboard

| Page | Fonctionnalités |
|------|-----------------|
| **Dashboard** | Stats, actions rapides, derniers projets |
| **Projets** | CRUD complet, tags, image, réordonnancement, publish/unpublish |
| **Compétences** | CRUD, pourcentage, catégorie, ordre |
| **À propos** | Bio, stats, CTA (à compléter) |
| **CV** | Expérience, Formation, Contact, Skills, Stack, Langues, Intérêts |
| **Contact** | Liens téléphone, email, GitHub, TikTok, Portfolio, Localisation |
| **Médias** | Upload images → Supabase Storage (drag & drop) |
| **Admins** | Gestion utilisateurs, rôles (super_admin/admin/editor) |
| **Audit** | Logs d'audit avec filtres |

## 🛠️ Technologies

| Couche | Techno |
|--------|--------|
| **Frontend** | Alpine.js 3 + GSAP 3 (vanilla, pas de build) |
| **Backend/DB** | Supabase (PostgreSQL + Auth + Storage) |
| **Auth** | Supabase Auth + MFA (TOTP) |
| **Sécurité** | Row Level Security (RLS) PostgreSQL |
| **Déploiement** | GitHub Pages (static) + Supabase (managed) |
| **Migration** | Node.js + @supabase/supabase-js |

## 📝 Personnalisation

### Couleurs (CSS Variables)
Dans `admin-dashboard.html` et `admin-login.html` :
```css
:root {
  --g: 0,200,110;    /* Vert principal */
  --b: 80,130,255;   /* Bleu */
  --p: 150,80,255;   /* Violet */
  --pk: 200,80,140;  /* Rose */
  --y: 200,160,30;   /* Jaune */
}
```

### Ajouter une page
1. Ajouter lien dans la sidebar (`admin-dashboard.html`)
2. Ajouter `renderMaPage()` dans `adminApp()`
3. Ajouter template `x-if="page==='mapage'"`

## 🐛 Dépannage

| Problème | Solution |
|----------|----------|
| "Invalid API key" | Vérifier `SUPABASE_URL` et `ANON_KEY` dans `supabase-client.js` |
| "Row Level Security policy violation" | Vérifier que l'user est dans `admin_users` avec `is_active=true` |
| MFA ne fonctionne pas | Vérifier heure système (TOTP sensible au temps) |
| Upload échoue | Vérifier bucket `portfolio` existe et policies |
| CORS error | Ajouter votre domaine dans Supabase → Auth → URL Configuration |

## 📄 Licence

MIT - Libre d'utilisation et modification.

---

**Auteur** : Gasici Mito Dev (Ouattara Yao Sanhibou)  
**Portfolio** : https://gasicidevshome.github.io/Oauttara-Yao-Sanhibou-Porfolio/  
**GitHub** : https://github.com/gasicidevshome