// Supabase Client Configuration for Portfolio Admin
// Project: wsajnfwotxodlkmvxzyc
// URL: https://wsajnfwotxodlkmvxzyc.supabase.co

// Initialize Supabase client
const SUPABASE_URL = 'https://wsajnfwotxodlkmvxzyc.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_iIZ5S5u5p3Cx6gAmVCBmyQ_Dg6ZtjZp';

// Global Supabase client
let supabase = null;

// Initialize on load
document.addEventListener('DOMContentLoaded', async () => {
    if (window.supabase) {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('[Supabase] Client initialized');
        
        // Check auth state
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            console.log('[Supabase] User logged in:', session.user.email);
        }
    }
});

// Auth helpers
export const auth = {
    // Sign in with email/password
    async signIn(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data;
    },

    // Sign out
    async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    // Get current session
    async getSession() {
        const { data: { session } } = await supabase.auth.getSession();
        return session;
    },

    // Get current user
    async getUser() {
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    },

    // Listen to auth changes
    onAuthStateChange(callback) {
        return supabase.auth.onAuthStateChange(callback);
    },

    // Check if user is admin
    async isAdmin() {
        const session = await this.getSession();
        if (!session) return false;
        
        const { data, error } = await supabase
            .from('admin_users')
            .select('role, is_active')
            .eq('id', session.user.id)
            .single();
        
        if (error || !data || !data.is_active) return false;
        return true;
    },

    // Check if super admin
    async isSuperAdmin() {
        const session = await this.getSession();
        if (!session) return false;
        
        const { data, error } = await supabase
            .from('admin_users')
            .select('role, is_active')
            .eq('id', session.user.id)
            .single();
        
        if (error || !data || !data.is_active) return false;
        return data.role === 'super_admin';
    }
};

// Generic CRUD helpers
export const db = {
    // Select with optional filters
    async select(table, options = {}) {
        let query = supabase.from(table).select(options.select || '*');
        
        if (options.filters) {
            Object.entries(options.filters).forEach(([key, value]) => {
                query = query.eq(key, value);
            });
        }
        
        if (options.order) {
            query = query.order(options.order.column, { ascending: options.order.ascending !== false });
        }
        
        if (options.limit) {
            query = query.limit(options.limit);
        }
        
        if (options.range) {
            query = query.range(options.range.from, options.range.to);
        }
        
        const { data, error, count } = await query;
        if (error) throw error;
        return { data, count };
    },

    // Insert single record
    async insert(table, record) {
        const { data, error } = await supabase.from(table).insert(record).select().single();
        if (error) throw error;
        return data;
    },

    // Insert multiple records
    async insertMany(table, records) {
        const { data, error } = await supabase.from(table).insert(records).select();
        if (error) throw error;
        return data;
    },

    // Update record
    async update(table, id, updates) {
        const { data, error } = await supabase.from(table).update(updates).eq('id', id).select().single();
        if (error) throw error;
        return data;
    },

    // Delete record
    async delete(table, id) {
        const { error } = await supabase.from(table).delete().eq('id', id);
        if (error) throw error;
        return true;
    },

    // Upload file to storage
    async uploadFile(bucket, path, file, options = {}) {
        const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
            cacheControl: '3600',
            upsert: options.upsert || false,
            contentType: options.contentType
        });
        if (error) throw error;
        return data;
    },

    // Get public URL for file
    getPublicUrl(bucket, path) {
        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        return data.publicUrl;
    },

    // Delete file
    async deleteFile(bucket, path) {
        const { error } = await supabase.storage.from(bucket).remove([path]);
        if (error) throw error;
        return true;
    },

    // Real-time subscription
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
export const tables = {
    projects: {
        async getAll(publishedOnly = false) {
            const options = publishedOnly ? { filters: { published: true }, order: { column: 'sort_order' } } : { order: { column: 'sort_order' } };
            return db.select('projects', options);
        },
        async getById(id) {
            return db.select('projects', { filters: { id } });
        },
        async create(data) {
            return db.insert('projects', data);
        },
        async update(id, data) {
            return db.update('projects', id, data);
        },
        async delete(id) {
            return db.delete('projects', id);
        },
        async reorder(updates) {
            // updates = [{id, sort_order}, ...]
            const promises = updates.map(u => db.update('projects', u.id, { sort_order: u.sort_order }));
            return Promise.all(promises);
        }
    },

    skills: {
        async getAll() {
            return db.select('skills', { order: { column: 'sort_order' } });
        },
        async create(data) { return db.insert('skills', data); },
        async update(id, data) { return db.update('skills', id, data); },
        async delete(id) { return db.delete('skills', id); }
    },

    about: {
        async get() {
            return db.select('about', { limit: 1 });
        },
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
export const utils = {
    generateId() {
        return crypto.randomUUID();
    },
    
    async uploadImage(file, folder = 'projects') {
        const ext = file.name.split('.').pop();
        const filename = `${folder}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
        await db.uploadFile('portfolio', filename, file);
        return db.getPublicUrl('portfolio', filename);
    },

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });
    },

    formatDateTime(dateString) {
        return new Date(dateString).toLocaleString('fr-FR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    }
};

// Export for global use
window.SupabaseClient = { auth, db, tables, utils };