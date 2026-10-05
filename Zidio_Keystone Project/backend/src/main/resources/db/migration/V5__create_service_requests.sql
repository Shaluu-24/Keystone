CREATE TABLE service_requests (
    id BIGSERIAL PRIMARY KEY,

    customer_id BIGINT NOT NULL
        REFERENCES customers(id),

    site_id BIGINT NOT NULL
        REFERENCES sites(id),

    service_type VARCHAR(100) NOT NULL,

    description TEXT NOT NULL,

    priority VARCHAR(20) NOT NULL,

    status VARCHAR(30) NOT NULL DEFAULT 'NEW',

    photo_url VARCHAR(1000),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_service_request_priority
        CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')),

    CONSTRAINT chk_service_request_status
        CHECK (
            status IN (
                'NEW',
                'ASSIGNED',
                'IN_PROGRESS',
                'COMPLETED',
                'CANCELLED'
            )
        )
);

CREATE INDEX idx_service_requests_customer
    ON service_requests(customer_id);

CREATE INDEX idx_service_requests_site
    ON service_requests(site_id);

CREATE INDEX idx_service_requests_status
    ON service_requests(status);

CREATE INDEX idx_service_requests_created_at
    ON service_requests(created_at);