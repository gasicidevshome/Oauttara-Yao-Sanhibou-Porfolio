/**
 * Supabase Client - Portfolio Admin
 * Centralized client with session persistence, auto-refresh, error handling
 */

const SUPABASE_URL = 'https://wsajnfwotxodlkmvxzyc.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_iIZ5S5u5p3Cx6gAmVCBmyQ_Dg6ZtjZp';

let supabase = null;
let authStateCallback = null;
let refreshInterval = null;

// Initialize Supabase client
async function initSupabase() {
    if (window.supabase && !supabase) {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            auth: {
                autoRefreshToken: true,
                persistSession: true,
                detectSessionInUrl: true,
                storage: window.localStorage,
                storageKey: 'portfolio-admin-auth'
            }
        });
        
        // Listen to auth state changes
        supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session) {
                const isAdmin = await checkAdminStatus(session.user.id);
                if (!isAdmin) {
                    await supabase.auth.signOut();
                    showToast('Accès non autorisé : droits administrateur requis', 'error');
                    setTimeout(() => window.location.href = 'admin-login.html', 2000);
                    return;
                }
                startTokenRefresh();
            } else if (event === 'SIGNED_OUT') {
                stopTokenRefresh();
            }
            
            if (authStateCallback) authStateCallback(event, session);
        });
        
        // Check existing session
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            const isAdmin = await checkAdminStatus(session.user.id);
            if (!isAdmin) {
                await supabase.auth.signOut();
                window.location.href = 'admin-login.html';
                return;
            }
            startTokenRefresh();
        }
    }
    return supabase;
}

// Check if user has admin role
async function checkAdminStatus(userId) {
    try {
        const { data, error } = await supabase
            .from('admin_users')
            .select('role, is_active')
            .eq('id', userId)
            .single();
        
        return data && data.is_active === true;
    } catch (e) {
        console.error('Admin check failed:', e);
        return false;
    }
}

// Token refresh management
function startTokenRefresh() {
    if (refreshInterval) return;
    refreshInterval = setInterval(async () => {
        try {
            const { data: { session }, error } = await supabase.auth.refreshSession();
            if (error) throw error;
        } catch (e) {
            console.warn('Token refresh failed:', e);
        }
    }, 30 * 60 * 1000); // Every 30 minutes
}

function stopTokenRefresh() {
    if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
    }
}

// Auth helpers
const auth = {
    async signIn(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data;
    },

    async signInWithOtp(email) {
        const { data, error } = await supabase.auth.signInWithOtp({ email });
        if (error) throw error;
        return data;
    },

    async verifyOtp(token, type = 'totp') {
        const { data, error } = await supabase.auth.verifyOtp({ token, type });
        if (error) throw error;
        return data;
    },

    async signOut() {
        stopTokenRefresh();
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    async getSession() {
        const { data: { session } } = await supabase.auth.getSession();
        return session;
    },

    async getUser() {
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    },

    onAuthStateChange(callback) {
        authStateCallback = callback;
        return supabase.auth.onAuthStateChange(callback);
    },

    async isAdmin() {
        const session = await this.getSession();
        if (!session) return false;
        return checkAdminStatus(session.user.id);
    },

    async resetPassword(email, redirectTo) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
        if (error) throw error;
    }
};

// Database helpers with retry logic
const db = {
    async withRetry(fn, retries = 3, delay = 1000) {
        try {
            return await fn();
        } catch (e) {
            if (retries > 0 && (e.message?.includes('network') || e.message?.includes('timeout') || e.status === 429)) {
                await new Promise(r => setTimeout(r, delay));
                return this.withRetry(fn, retries - 1, delay * 2);
            }
            throw e;
        }
    },

    async select(table, options = {}) {
        return this.withRetry(async () => {
            let query = supabase.from(table).select(options.select || '*');
            
            if (options.filters) {
                Object.entries(options.filters).forEach(([key, value]) => {
                    query = query.eq(key, value);
                });
            }
            if (options.order) {
                query = query.order(options.order.column, { ascending: options.order.ascending !== false });
            }
            if (options.limit) query = query.limit(options.limit);
            if (options.range) query = query.range(options.range.from, options.range.to);
            
            const { data, error, count } = await query;
            if (error) throw error;
            return { data, count };
        });
    },

    async insert(table, record) {
        return this.withRetry(async () => {
            const { data, error } = await supabase.from(table).insert(record).select().single();
            if (error) throw error;
            return data;
        });
    },

    async insertMany(table, records) {
        return this.withRetry(async () => {
            const { data, error } = await supabase.from(table).insert(records).select();
            if (error) throw error;
            return data;
        });
    },

    async update(table, id, updates) {
        return this.withRetry(async () => {
            const { data, error } = await supabase.from(table).update(updates).eq('id', id).select().single();
            if (error) throw error;
            return data;
        });
    },

    async delete(table, id) {
        return this.withRetry(async () => {
            const { error } = await supabase.from(table).delete().eq('id', id);
            if (error) throw error;
            return true;
        });
    },

    async uploadFile(bucket, path, file, options = {}) {
        return this.withRetry(async () => {
            const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
                cacheControl: '3600',
                upsert: options.upsert || false,
                contentType: options.contentType
            });
            if (error) throw error;
            return data;
        });
    },

    getPublicUrl(bucket, path) {
        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        return data.publicUrl;
    },

    async deleteFile(bucket, path) {
        const { error } = await supabase.storage.from(bucket).remove([path]);
        if (error) throw error;
        return true;
    },

    subscribe(table, callback, filter = null) {
        let channel = supabase.channel(`${table}_changes`);
        
        if (filter) {
            channel = channel.on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: table,
                filter: filter
            }, callback);
        } else {
            channel = channel.on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: table
            }, callback);
        }
        
        return channel.subscribe();
    }
};

// Table-specific helpers
const tables = {
    projects: {
        async getAll(publishedOnly = false) {
            const options = publishedOnly 
                ? { filters: { published: true }, order: { column: 'sort_order' } }
                : { order: { column: 'sort_order' } };
            return db.select('projects', options);
        },
        async getById(id) { return db.select('projects', { filters: { id } }); },
        async create(data) { return db.insert('projects', data); },
        async update(id, data) { return db.update('projects', id, data); },
        async delete(id) { return db.delete('projects', id); },
        async reorder(updates) {
            return Promise.all(updates.map(u => db.update('projects', u.id, { sort_order: u.sort_order })));
        }
    },

    skills: {
        async getAll() { return db.select('skills', { order: { column: 'sort_order' } }); },
        async create(data) { return db.insert('skills', data); },
        async update(id, data) { return db.update('skills', id, data); },
        async delete(id) { return db.delete('skills', id); }
    },

    about: {
        async get() { return db.select('about', { limit: 1 }); },
        async upsert(data) {
            const existing = await this.get();
            if (existing.data && existing.data.length > 0) {
                return db.update('about', existing.data[0].id, data);
            }
            return db.insert('about', data);
        }
    },

    cv_experience: {
        async getAll() { return db.select('cv_experience', { order: { column: 'sort_order' } }); },
        async create(data) { return db.insert('cv_experience', data); },
        async update(id, data) { return db.update('cv_experience', id, data); },
        async delete(id) { return db.delete('cv_experience', id); }
    },

    cv_education: {
        async getAll() { return db.select('cv_education', { order: { column: 'sort_order' } }); },
        async create(data) { return db.insert('cv_education', data); },
        async update(id, data) { return db.update('cv_education', id, data); },
        async delete(id) { return db.delete('cv_education', id); }
    },

    cv_contact: {
        async getAll() { return db.select('cv_contact', { order: { column: 'sort_order' } }); },
        async create(data) { return db.insert('cv_contact', data); },
        async update(id, data) { return db.update('cv_contact', id, data); },
        async delete(id) { return db.delete('cv_contact', id); }
    },

    cv_skills: {
        async getAll() { return db.select('cv_skills', { order: { column: 'sort_order' } }); },
        async create(data) { return db.insert('cv_skills', data); },
        async update(id, data) { return db.update('cv_skills', id, data); },
        async delete(id) { return db.delete('cv_skills', id); }
    },

    cv_stack_tags: {
        async getAll() { return db.select('cv_stack_tags', { order: { column: 'sort_order' } }); },
        async create(data) { return db.insert('cv_stack_tags', data); },
        async update(id, data) { return db.update('cv_stack_tags', id, data); },
        async delete(id) { return db.delete('cv_stack_tags', id); }
    },

    languages: {
        async getAll() { return db.select('languages', { order: { column: 'sort_order' } }); },
        async create(data) { return db.insert('languages', data); },
        async update(id, data) { return db.update('languages', id, data); },
        async delete(id) { return db.delete('languages', id); }
    },

    interests: {
        async getAll() { return db.select('interests', { order: { column: 'sort_order' } }); },
        async create(data) { return db.insert('interests', data); },
        async update(id, data) { return db.update('interests', id, data); },
        async delete(id) { return db.delete('interests', id); }
    },

    contact_links: {
        async getAll() { return db.select('contact_links', { order: { column: 'sort_order' } }); },
        async create(data) { return db.insert('contact_links', data); },
        async update(id, data) { return db.update('contact_links', id, data); },
        async delete(id) { return db.delete('contact_links', id); }
    },

    media: {
        async getAll() { return db.select('media', { order: { column: 'created_at', ascending: false } }); },
        async create(data) { return db.insert('media', data); },
        async delete(id) { return db.delete('media', id); }
    },

    admin_users: {
        async getAll() { return db.select('admin_users', { order: { column: 'created_at', ascending: false } }); },
        async create(data) { return db.insert('admin_users', data); },
        async update(id, data) { return db.update('admin_users', id, data); },
        async delete(id) { return db.delete('admin_users', id); }
    },

    audit_logs: {
        async getAll(limit = 100) { 
            return db.select('audit_logs', { order: { column: 'created_at', ascending: false }, limit }); 
        },
        async getByUser(userId) { 
            return db.select('audit_logs', { filters: { user_id: userId }, order: { column: 'created_at', ascending: false } }); 
        }
    }
};

// Utility functions
const utils = {
    generateId() {
        return crypto.randomUUID();
    },

    async uploadImage(file, folder = 'projects') {
        const ext = file.name.split('.').pop().toLowerCase();
        const filename = `${folder}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
        await db.uploadFile('portfolio', filename, file, { contentType: file.type });
        return db.getPublicUrl('portfolio', filename);
    },

    formatDate(dateString, options = {}) {
        const defaultOpts = { day: '2-digit', month: '2-digit', year: 'numeric', ...options };
        return new Date(dateString).toLocaleDateString('fr-FR', defaultOpts);
    },

    formatDateTime(dateString) {
        return new Date(dateString).toLocaleString('fr-FR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    },

    formatRelativeTime(dateString) {
        const now = new Date();
        const then = new Date(dateString);
        const diff = Math.floor((now - then) / 1000);
        
        if (diff < 60) return 'à l\'instant';
        if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
        if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`;
        if (diff < 604800) return `il y a ${Math.floor(diff / 86400)} j`;
        return this.formatDate(dateString);
    },

    debounce(fn, wait) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => fn.apply(this, args), wait);
        };
    },

    throttle(fn, limit) {
        let inThrottle;
        return (...args) => {
            if (!inThrottle) {
                fn.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};

// Toast notification system
const toast = {
    container: null,
    
    init() {
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'toast-container';
            this.container.style.cssText = `
                position: fixed; bottom: 24px; right: 24px; z-index: 9999;
                display: flex; flex-direction: column; gap: 8px;
                pointer-events: none;
            `;
            document.body.appendChild(this.container);
        }
    },

    show(message, type = 'success', duration = 4000) {
        this.init();
        
        const toast = document.createElement('div');
        const icons = {
            success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>',
            error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
            warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
            info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
        };
        
        const colors = {
            success: 'rgba(0,200,110,1)',
            error: 'rgba(255,60,90,1)',
            warning: 'rgba(200,160,30,1)',
            info: 'rgba(80,130,255,1)'
        };
        
        toast.style.cssText = `
            display: flex; align-items: center; gap: 12px;
            padding: 14px 18px; border-radius: 10px;
            background: var(--card); border: 1px solid var(--border);
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            min-width: 280px; max-width: 420px;
            animation: slideIn 0.3s cubic-bezier(.34,1.56,.64,1);
            pointer-events: auto;
            border-left: 4px solid ${colors[type]};
        `;
        
        toast.innerHTML = `
            <span style="color:${colors[type]};flex-shrink:0">${icons[type]}</span>
            <span style="flex:1;font-size:.85rem;line-height:1.4">${message}</span>
            <button onclick="this.parentElement.remove()" style="background:none;border:none;color:var(--muted);padding:4px;cursor:pointer;flex-shrink:0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
        `;
        
        this.container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.2s ease-in forwards';
            setTimeout(() => toast.remove(), 200);
        }, duration);
    },

    success(msg, dur) { this.show(msg, 'success', dur); },
    error(msg, dur) { this.show(msg, 'error', dur); },
    warning(msg, dur) { this.show(msg, 'warning', dur); },
    info(msg, dur) { this.show(msg, 'info', dur); }
};

// Add toast animations to document
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn { from { opacity: 0; transform: translateX(100px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes slideOut { from { opacity: 1; transform: translateX(0); } to { opacity: 0; transform: translateX(100px); } }
`;
document.head.appendChild(style);

// Export for global use
window.SupabaseClient = { 
    init: initSupabase, 
    auth, 
    db, 
    tables, 
    utils, 
    toast,
    supabase: () => supabase
};

// Auto-initialize on DOM ready
document.addEventListener('DOMContentLoaded', initSupabase);