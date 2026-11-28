-- Synthetic fixture, not production data. Run only in an empty disposable database.
CREATE SCHEMA cko_master;
CREATE SCHEMA cko_governance;
CREATE TABLE cko_master.entities(canonical_id text PRIMARY KEY, object_uuid uuid UNIQUE NOT NULL, entity_type_id text NOT NULL, current_version_ref text NOT NULL);
CREATE TABLE cko_governance.object_versions(object_version_id text PRIMARY KEY, object_ref text NOT NULL, object_class text NOT NULL);
CREATE TABLE cko_governance.layer_catalog(layer_id text PRIMARY KEY REFERENCES cko_master.entities(canonical_id) ON UPDATE CASCADE, layer_uuid uuid UNIQUE NOT NULL, flow_sequence integer UNIQUE NOT NULL);
INSERT INTO cko_master.entities SELECT 'TEST-LAYER-'||i, ('10000000-0000-7000-8000-'||lpad(i::text,12,'0'))::uuid,'LAYER','TEST-V-'||i FROM generate_series(1,44) i;
INSERT INTO cko_governance.object_versions SELECT 'TEST-V-'||i,'TEST-LAYER-'||i,'LAYER' FROM generate_series(1,44) i;
INSERT INTO cko_governance.layer_catalog SELECT 'TEST-LAYER-'||i, ('20000000-0000-7000-8000-'||lpad(i::text,12,'0'))::uuid,i*10 FROM generate_series(1,44) i;
