ALTER TABLE work_orders
ADD COLUMN service_request_id BIGINT;

CREATE INDEX idx_work_orders_service_request_id
ON work_orders(service_request_id);