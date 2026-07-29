-- Reference/demo data. Seed users are created programmatically at startup
-- (see DataSeeder) so passwords are hashed with the real BCryptPasswordEncoder
-- instead of a hard-coded hash baked into a migration.

INSERT INTO customers (name, contact_email) VALUES
    ('Meridian Facilities Management', 'ops@meridianfm.example');

INSERT INTO sites (customer_id, name, address) VALUES
    ((SELECT id FROM customers WHERE name = 'Meridian Facilities Management'),
     'Meridian HQ Tower', '1 Meridian Plaza, Chennai'),
    ((SELECT id FROM customers WHERE name = 'Meridian Facilities Management'),
     'Meridian Warehouse B', '22 Industrial Estate Rd, Chennai');

INSERT INTO parts (name, sku, unit_cost, stock_qty) VALUES
    ('HVAC Air Filter', 'HVAC-FILT-001', 12.50, 100),
    ('Copper Pipe Fitting 1/2in', 'PLMB-FIT-012', 3.75, 250),
    ('Circuit Breaker 20A', 'ELEC-CB-020', 18.00, 60),
    ('Refrigerant R-410A (lb)', 'HVAC-REF-410', 22.00, 40),
    ('LED Panel Light 40W', 'ELEC-LED-040', 15.25, 80);
