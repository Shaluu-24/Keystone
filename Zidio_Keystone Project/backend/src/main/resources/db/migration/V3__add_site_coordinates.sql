ALTER TABLE sites
    ADD COLUMN latitude DOUBLE PRECISION,
    ADD COLUMN longitude DOUBLE PRECISION;

CREATE INDEX idx_sites_coordinates
    ON sites(latitude, longitude);
