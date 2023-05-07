CREATE TABLE secret.permission_value(
   id SERIAL PRIMARY KEY,
   alias VARCHAR(50) UNIQUE NOT NULL,
   title VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE secret.permission(
   id SERIAL PRIMARY KEY,
   table_schema VARCHAR(50) NOT NULL,
   table_name VARCHAR(50) NOT NULL,
   permission_value VARCHAR(50) NOT NULL,
   UNIQUE(table_schema, table_name, permission_value),
   CONSTRAINT fk_secret_permissions_id FOREIGN KEY (permission_value) REFERENCES secret.permission_value(alias) ON DELETE NO ACTION
);

CREATE TABLE secret.group(
   id SERIAl PRIMARY KEY,
   title VARCHAR(50) UNIQUE,
   permissions INTEGER[]
);

CREATE TABLE secret.permission___group(
   permission_id INTEGER,
   group_id INTEGER,
   CONSTRAINT fk_secret_permission___group_permission_id FOREIGN KEY (permission_id) REFERENCES secret.permission(id) ON DELETE CASCADE,
   CONSTRAINT fk_secret_permission___group_group_id FOREIGN KEY (group_id) REFERENCES secret.group(id) ON DELETE CASCADE,
   PRIMARY KEY (permission_id, group_id)
);

CREATE TABLE secret.user(
   id SERIAL PRIMARY KEY,
   title VARCHAR(30) UNIQUE,
   password VARCHAR(500),
   groups INTEGER[]
);

CREATE TABLE secret.user___group(
   user_id INTEGER,
   group_id INTEGER,
   CONSTRAINT fk_secret_user___group_user_id FOREIGN KEY (user_id) REFERENCES secret.user(id) ON DELETE NO ACTION,
   CONSTRAINT fk_secret_user___group_group_id FOREIGN KEY (group_id) REFERENCES secret.group(id) ON DELETE NO ACTION,
   PRIMARY KEY (user_id, group_id)
);

CREATE TABLE secret.session(
   id SERIAL PRIMARY KEY,
   session_id VARCHAR(100) UNIQUE NOT NULL,
   ip_address VARCHAR(20),
   data JSON,
   expires BIGINT,
   created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
   updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


