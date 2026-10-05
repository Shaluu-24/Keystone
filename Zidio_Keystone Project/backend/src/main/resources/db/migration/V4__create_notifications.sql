CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    work_order_id BIGINT REFERENCES work_orders(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user
    ON notifications(user_id);

CREATE INDEX idx_notifications_user_read
    ON notifications(user_id, is_read);

CREATE INDEX idx_notifications_work_order
    ON notifications(work_order_id);

CREATE INDEX idx_notifications_created_at
    ON notifications(created_at);