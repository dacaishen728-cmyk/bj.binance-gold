CREATE INDEX IF NOT EXISTS idx_users_created ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_name ON users(json_extract(data,'$.name'));
CREATE INDEX IF NOT EXISTS idx_sessions_actor ON sessions(actor_type, actor_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_admins_created ON admins(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_target ON notifications(target, created_at);
